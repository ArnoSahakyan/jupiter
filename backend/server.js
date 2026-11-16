require('dotenv').config();
const express = require("express");
const cors = require("cors");
const http = require('http'); // Import http
const { Server } = require('socket.io'); // Import socket.io
const jwt = require("jsonwebtoken");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");

const corsOptions = {
  origin: process.env.CORS, // specify the origin
  methods: ['GET', 'PUT', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Authorization', 'Content-Type', 'Origin'],
  credentials: true,
  optionsSuccessStatus: 200,
  maxAge: -1
};

const app = express();

// Behind a hosting proxy (Render, Heroku, ...) the client IP comes from
// X-Forwarded-For; without this every user shares the proxy's IP and the rate
// limits would apply to everyone at once. Defaults to 1 proxy hop in production.
const trustProxy = process.env.TRUST_PROXY ?? (process.env.NODE_ENV === 'production' ? '1' : 'false');
app.set('trust proxy', /^\d+$/.test(trustProxy) ? Number(trustProxy) : trustProxy === 'true');
const server = http.createServer(app); // Create an HTTP server
const io = new Server(server, { // Initialize socket.io with the HTTP server
  cors: corsOptions
});

// Middleware and routes setup
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

const db = require("./app/models");
const { runMigrations } = require("./app/migrate");

// Users created before the Supabase project moved still point at the old
// project's default images; repoint them to the current project. (This runs
// here rather than in a migration because it depends on SUPABASE_IMAGE_URL.)
const fixDefaultImages = async () => {
  const { Op } = db.Sequelize;
  const { DEFAULT_PFP, DEFAULT_COVER } = require('./app/models/user.model.js');
  const [[pfpCount], [coverCount]] = await Promise.all([
    db.user.update({ pfp: DEFAULT_PFP }, {
      where: { pfp: { [Op.like]: '%/winku/default/pfp.jpg', [Op.ne]: DEFAULT_PFP } }
    }),
    db.user.update({ coverPhoto: DEFAULT_COVER }, {
      where: { coverPhoto: { [Op.like]: '%/winku/default/cover.jpg', [Op.ne]: DEFAULT_COVER } }
    })
  ]);
  if (pfpCount || coverCount) {
    console.log(`Updated default images: ${pfpCount} profile, ${coverCount} cover`);
  }
};

// Schema changes live in app/migrations and are applied on startup.
runMigrations().then(fixDefaultImages).then(() => {
  console.log('Database ready');
}).catch((err) => {
  console.error('Error preparing the database:', err);
  process.exit(1);
});

app.options('*', cors(corsOptions)); // handle preflight requests

app.get("/", (req, res) => {
  res.json({ message: "Welcome to the Jupiter API." });
});

require('./app/routes/auth.routes')(app);
require('./app/routes/user.routes')(app);
require('./app/routes/upload.routes')(app);
require('./app/routes/post.routes')(app);
require('./app/routes/like.routes')(app);
require('./app/routes/comment.routes')(app);
require('./app/routes/friend.routes')(app);
require('./app/routes/friendRequest.routes')(app);
require('./app/routes/message.routes')(app);
require('./app/routes/profile.routes')(app);

// Socket.IO setup
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error'));
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return next(new Error('Authentication error'));
    }
    socket.userId = decoded.id;
    next();
  });
});

require('./app/socket/chat')(io, db);
require('./app/socket/presence')(io, db);

// Start the server
const PORT = process.env.PORT || 7070;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
