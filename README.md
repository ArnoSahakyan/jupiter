# Jupiter

A small social network for students: share posts and photos, find friends and chat in real time.

Built with **React + TypeScript** on the front end and **Node.js + Express + PostgreSQL** on the back end, with **Socket.IO** for live chat and **Supabase Storage** for images.

## Features

- Sign up and log in; sessions renew silently
- Profile with name, job, profile picture and cover photo
- Posts with text and/or a photo, likes, comments and replies
- Newsfeed, and a Photos page with your images
- Friend requests, friend suggestions and user search
- Private one-to-one real-time chat with friends, with saved history
- Online / away / offline status
- Responsive: three columns on desktop, two on tablets, one on phones

## Under the hood

- **Auth:** short-lived JWT access token (1 hour) plus a refresh token in an **httpOnly cookie** (1 day), so page scripts can never read it. Passwords are hashed with bcrypt (cost 12).
- **Abuse protection:** per-account login rate limiting (keyed on IP and username, so students on a shared campus IP don't lock each other out), validation of all auth input on the server, and one generic error for a wrong username or password.
- **Private chat:** the server decides which chat room a socket may join and builds every message itself, so nobody can read, post into or spoof someone else's conversation.
- **Images:** uploads are resized and converted to WebP with `sharp`, then stored in Supabase.
- **Database:** schema changes are versioned migrations (umzug), applied automatically on startup.
- **Tests:** unit tests plus an end-to-end suite that drives the real API, sockets and uploads.

## Repository layout

| Folder | What it is |
| --- | --- |
| [`frontend/`](frontend) | React 18 + TypeScript web app (Vite, Redux Toolkit, React Router, Formik + Yup, SCSS) |
| [`backend/`](backend) | Express API (Sequelize + PostgreSQL, Socket.IO, JWT, multer + sharp, Supabase Storage) |
| [`docker-compose.yml`](docker-compose.yml) | Runs the database, API and web app together |

## Quick start (Docker)

You need [Docker](https://docs.docker.com/get-docker/) and a Supabase project with a **public** storage bucket named `winku` that contains `default/pfp.jpg` and `default/cover.jpg` (the images new users start with).

```sh
cp backend/.env.example backend/.env    # fill in DB password, JWT secrets and Supabase keys
docker compose up --build
```

Open http://localhost:5173. The API is at http://localhost:8080. Code changes in `frontend/` and `backend/` reload automatically.

The database is created on first start (tables, roles), using the name, user and password from `backend/.env`.

## Running without Docker

You need Node.js 20 (or 18.17+) and PostgreSQL.

```sh
# terminal 1: API
cd backend
cp .env.example .env    # fill it in; HOST=localhost
npm install
npm run dev

# terminal 2: web app
cd frontend
npm install
npm run dev
```

## Tests

```sh
cd backend
npm test                              # unit tests, no database needed
npm run test:e2e                      # end-to-end, against a running API (e.g. docker compose up)
RUN_UPLOAD_TESTS=1 npm run test:e2e   # also tests image uploads against Supabase (cleans up after itself)
```

The frontend is checked with `npm run lint` and `npm run build` (which type-checks).

## Deployment notes

- **Frontend (Vercel):** `frontend/vercel.json` proxies `/api` to the backend, so the refresh cookie is first-party in every browser (Safari blocks third-party cookies). Set `VITE_API_URL` to empty and `VITE_SOCKET_URL` to the backend URL, and update the backend address in `vercel.json`.
- **Backend (e.g. Render):** set `NODE_ENV=production`, `CORS` to the frontend URL, and the variables from `backend/.env.example`. Migrations run on startup.

## History

Jupiter started as **Winku**, a university project by Arno Sahakyan (separate [frontend](https://github.com/ArnoSahakyan/winku) and [backend](https://github.com/ArnoSahakyan/winkuback) repositories). It was then rebranded, hardened and merged into this repository with both histories preserved.
