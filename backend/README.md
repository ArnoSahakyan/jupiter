# Jupiter Backend

REST and real-time API for **Jupiter**, a small social network for students. Users can sign up, post text and photos, like and comment, add friends and chat in real time.

The frontend lives in a separate repository: [winku](https://github.com/ArnoSahakyan/winku).

## Tech stack

- **Node.js + Express** for the REST API
- **Socket.IO** for real-time chat
- **PostgreSQL + Sequelize** for data
- **Supabase Storage** for images (profile pictures, covers, post photos)
- **JWT** access and refresh tokens, **bcrypt** password hashing
- **multer + sharp** to accept uploads and convert them to compressed WebP

## Features

- Sign up, log in, token refresh
- Profile: name, job, profile picture, cover photo, online status
- Posts with text and/or an image, likes, comments and replies
- Friend requests, friends list, friend suggestions, user search
- One-to-one real-time chat between friends, with saved history

### Security

- Passwords hashed with bcrypt (cost 12)
- Rate limits on auth routes: 10 failed logins per IP and username per 15 minutes, 20 signups per IP per hour, 100 auth requests per IP per 15 minutes
- Signup and login input validated on the server
- One generic error for a wrong username or password, so valid usernames can't be discovered
- Security headers via `helmet`
- Users can only delete their own posts and change their own profile images
- Chat rooms are private: you can only join and post to chats with your own friends, and the sender is always taken from the login token

## Getting started

### Prerequisites

- Node.js 18.17+ or 20.3+
- PostgreSQL (any recent version; the quickest way is Docker, see below)
- A Supabase project with a **public** storage bucket named `winku` that contains `default/pfp.jpg` and `default/cover.jpg` (the images new users start with)

### 1. Install dependencies

```sh
npm install
```

### 2. Start a database

If you don't have PostgreSQL installed, run one in Docker (use the same password you put in `.env`):

```sh
docker run -d --name jupiter-db -e POSTGRES_PASSWORD=<your-db-password> -p 127.0.0.1:5432:5432 -v jupiter-db-data:/var/lib/postgresql/data postgres:17-alpine
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
PORT=8080
CORS=http://localhost:5173

HOST=localhost
USER_NAME=postgres
PASSWORD=<your-db-password>
DB_NAME=postgres

ACCESS_TOKEN_SECRET=<long-random-string>
REFRESH_TOKEN_SECRET=<another-long-random-string>

SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_KEY=<supabase-key>
SUPABASE_IMAGE_URL=https://<project-ref>.supabase.co/storage/v1/object/public/
```

| Variable | Description |
| --- | --- |
| `PORT` | Port the API listens on (default `7070`) |
| `CORS` | URL of the frontend allowed to call the API, e.g. `http://localhost:5173` |
| `HOST`, `USER_NAME`, `PASSWORD`, `DB_NAME` | PostgreSQL connection. `HOST` defaults to `localhost` |
| `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET` | Secrets for signing JWTs. Use long random values, e.g. `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_KEY` | A key that can upload to and delete from the `winku` bucket. The service role key is simplest; keep it secret |
| `SUPABASE_IMAGE_URL` | Public storage URL, ending in `/storage/v1/object/public/` |
| `NODE_ENV` | Set to `production` when deployed |
| `TRUST_PROXY` | Number of proxies in front of the app (defaults to `1` in production, off otherwise). Needed so rate limits see real client IPs on hosts like Render |

Never commit `.env`; it is already in `.gitignore`.

### 4. Run the server

```sh
npm run dev    # restarts on file changes (nodemon)
npm start      # plain node, for production
```

On startup the server:

- creates any missing tables,
- adds the `user`, `moderator` and `admin` roles if they don't exist (new users get `user`),
- fixes data left by older versions (default images pointing at an old Supabase project, the old "TV Model" default job).

Then open `http://localhost:8080/`; you should see `{"message":"Welcome to the Jupiter API."}`.

## API

All routes except signup, signin, refresh and `/` need an `Authorization: Bearer <accessToken>` header.

### Auth

| Method | Route | Body / notes |
| --- | --- | --- |
| POST | `/api/auth/signup` | `{ fname, username, email, password }`. Username: 3-20 letters, numbers, `_` or `.`. Password: 8-72 characters with a number, a lowercase and an uppercase letter and a symbol |
| POST | `/api/auth/signin` | `{ username, password }`. Returns the user plus `accessToken` (1 hour) and `refreshToken` (1 day) |
| POST | `/api/auth/refresh` | `{ refreshToken }`. Returns a new `accessToken` |

### Users

| Method | Route | Body / notes |
| --- | --- | --- |
| GET | `/api/user/info` | The logged-in user's profile |
| GET | `/api/user/:id` | Another user's public profile |
| PATCH | `/api/user/update` | `{ fname, job }`. An empty `job` clears it |
| PATCH | `/api/user/status` | `{ onlineStatus }` (`online`, `away`, `offline`) |
| GET | `/api/search-user?query=&limit=&offset=` | Search by name or username |
| POST | `/api/upload/user-images` | Multipart: `file` (image, max 5 MB) and `type` (`pfp` or `coverPhoto`) |

### Posts, likes and comments

| Method | Route | Body / notes |
| --- | --- | --- |
| POST | `/api/post` | Multipart: `content` and/or `file` (image, max 5 MB) |
| DELETE | `/api/delete-post/:postId` | Own posts only; also deletes the image |
| GET | `/api/user-posts?limit=&offset=` | Your posts, with comments and replies |
| GET | `/api/posts?limit=&offset=` | Newsfeed: everyone else's posts |
| GET | `/api/photos?limit=&offset=` | Your posts that have an image |
| POST | `/api/like` / `/api/unlike` | `{ postId }` |
| POST | `/api/comment` | `{ postId, content, parentId? }`. Set `parentId` to reply to a comment |

### Friends

| Method | Route | Body / notes |
| --- | --- | --- |
| GET | `/api/friends` | Your friends |
| GET | `/api/unassociated-users` | Suggestions: users who aren't friends and have no pending request |
| DELETE | `/api/delete-friend/:friendId` | Remove a friend |
| GET | `/api/requests` | Friend requests sent to you |
| POST | `/api/send-request` | `{ receiverId }` |
| POST | `/api/respond-request` | `{ senderId, status }` (`accepted` or anything else to decline) |

### Messages

| Method | Route | Body / notes |
| --- | --- | --- |
| GET | `/api/messages/:friendId` | Chat history with a friend |
| POST | `/api/messages` | `{ receiverId, message }`. Friends only, 1-255 characters |

### Real-time chat (Socket.IO)

Connect with the access token: `io(API_URL, { auth: { token: accessToken } })`.

| Event | Direction | Payload |
| --- | --- | --- |
| `join_room` | client to server | `friendshipId`. Only works for your own friendships |
| `send_message` | client to server | `{ receiverId, message }`. Friends only, 1-255 characters; the message is saved |
| `receive_message` | server to client | `{ senderId, receiverId, message }` |

## Project structure

```text
server.js                 Express + Socket.IO setup, startup tasks
supabaseClient.js         Supabase storage client
app/
  controllers/            Route handlers (auth, users, posts, likes, comments, friends, messages, uploads)
  helpers/messages.js     Shared message rules (length limit, friendship check)
  middleware/             JWT check, input validation, rate limits, upload + image compression
  models/                 Sequelize models and relations
  routes/                 Route definitions
  socket/chat.js          Real-time chat handlers
```

## Deployment notes

- Set `NODE_ENV=production`, and set `CORS` to the deployed frontend URL.
- If the host runs more than one proxy in front of the app, set `TRUST_PROXY` to that number.
- Images are stored in Supabase, so the server itself keeps no files.
