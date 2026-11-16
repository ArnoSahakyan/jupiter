# Jupiter Backend

REST and real-time API for **Jupiter**, a small social network for students. Users can sign up, post text and photos, like and comment, add friends and chat in real time.

Part of the [Jupiter](../README.md) repository; the web app is in [`../frontend`](../frontend).

## Tech stack

- **Node.js + Express** for the REST API
- **Socket.IO** for real-time chat
- **PostgreSQL + Sequelize** for data
- **Supabase Storage** for images (profile pictures, covers, post photos)
- **JWT** access tokens and an httpOnly refresh-token cookie, **bcrypt** password hashing
- **umzug** for database migrations
- **multer + sharp** to accept uploads and convert them to compressed WebP

## Features

- Sign up, log in, token refresh
- Profile: name, job, profile picture, cover photo, online status
- Posts with text and/or an image, likes, comments and replies
- Friend requests, friends list, friend suggestions, user search
- One-to-one real-time chat between friends, with saved history

### Security

- Passwords hashed with bcrypt (cost 12)
- The refresh token is an httpOnly cookie (scripts can't read it), limited to `/api/auth`
- Rate limits on auth routes: 10 failed logins per IP and username per 15 minutes, 50 signups per IP per hour, 100 auth requests per IP per 15 minutes
- Signup and login input validated on the server
- One generic error for a wrong username or password, so valid usernames can't be discovered
- Security headers via `helmet`
- Users can only delete their own posts and change their own profile images
- Chat rooms are private: you can only join and post to chats with your own friends, and the sender is always taken from the login token

## Getting started

The quickest way to run everything (database, API and web app) is `docker compose up --build` from the repository root; see the [root README](../README.md). To run the API on its own:

### Prerequisites

- Node.js 18.17+ or 20.3+
- PostgreSQL (any recent version)
- A Supabase project with a **public** storage bucket named `winku` that contains `default/pfp.jpg` and `default/cover.jpg` (the images new users start with)

### Setup

```sh
npm install
cp .env.example .env    # then fill it in
npm run dev             # restarts on file changes; `npm start` for production
```

Then open `http://localhost:8080/`; you should see `{"message":"Welcome to the Jupiter API."}`.

| Variable | Description |
| --- | --- |
| `PORT` | Port the API listens on (default `7070`; `.env.example` uses `8080`) |
| `CORS` | URL of the frontend allowed to call the API, e.g. `http://localhost:5173` |
| `HOST`, `USER_NAME`, `PASSWORD`, `DB_NAME` | PostgreSQL connection. `HOST` defaults to `localhost` (`db` under docker compose) |
| `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET` | Secrets for signing JWTs. Use long random values, e.g. `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_KEY` | A key that can upload to and delete from the `winku` bucket. The service role key is simplest; keep it secret |
| `SUPABASE_IMAGE_URL` | Public storage URL, ending in `/storage/v1/object/public/` |
| `NODE_ENV` | Set to `production` when deployed (also makes the refresh cookie `Secure`) |
| `TRUST_PROXY` | Number of proxies in front of the app (defaults to `1` in production, off otherwise). Needed so rate limits see real client IPs |
| `REFRESH_COOKIE_SAMESITE` | `lax` by default. Use `none` only if the frontend calls the API cross-site without a proxy |
| `REFRESH_COOKIE_SECURE` | Overrides the `Secure` flag (`true`/`false`) |

Never commit `.env`; it is in `.gitignore`.

### Database and migrations

On startup the server applies any pending migrations from `app/migrations` (tracked in the `SequelizeMeta` table), so an empty database gets all tables and the `user` / `moderator` / `admin` roles. It also repoints default profile/cover images to the Supabase project in `.env`.

```sh
npm run migrate        # apply pending migrations without starting the server
npm run migrate:down   # undo the last migration
```

To change the schema, add a new file in `app/migrations` (never edit an applied one) and update the model in `app/models`.

### Tests

```sh
npm test                              # unit tests: no database or server needed
npm run test:e2e                      # end-to-end against a running API (API_URL, default http://localhost:8080)
RUN_UPLOAD_TESTS=1 npm run test:e2e   # also image uploads against the Supabase bucket (deletes what it uploads)
```

The end-to-end tests sign up their own users on each run, and are skipped if the API isn't reachable.

## API

All routes except signup, signin, refresh, logout and `/` need an `Authorization: Bearer <accessToken>` header.

### Auth

| Method | Route | Body / notes |
| --- | --- | --- |
| POST | `/api/auth/signup` | `{ fname, username, email, password }`. Username: 3-20 letters, numbers, `_` or `.`. Password: 8-72 characters with a number, a lowercase and an uppercase letter and a symbol |
| POST | `/api/auth/signin` | `{ username, password }`. Returns the user plus an `accessToken` (1 hour), and sets the refresh-token cookie `jupiter_rt` (httpOnly, 1 day) |
| POST | `/api/auth/refresh` | No body; uses the cookie (send requests with credentials). Returns a new `accessToken` |
| POST | `/api/auth/logout` | Clears the refresh-token cookie |

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
  migrate.js              Migration runner (umzug)
  migrations/             Versioned schema changes
  models/                 Sequelize models and relations
  routes/                 Route definitions
  socket/chat.js          Real-time chat handlers
  utils/refreshCookie.js  Refresh-token cookie settings
test/
  unit/                   Tests that need no database or server
  e2e/                    Tests against a running API
```

## Deployment notes

- Set `NODE_ENV=production`, and set `CORS` to the deployed frontend URL.
- Serve the API to the browser through the frontend's domain (the frontend's `vercel.json` proxies `/api`), so the refresh cookie is first-party; otherwise set `REFRESH_COOKIE_SAMESITE=none`, which some browsers (e.g. Safari) block.
- Migrations run on startup, so deploying a new version updates the database schema.
- If the host runs more than one proxy in front of the app, set `TRUST_PROXY` to that number.
- Images are stored in Supabase, so the server itself keeps no files.
