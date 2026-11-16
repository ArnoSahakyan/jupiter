# Jupiter Frontend

**Jupiter** is a small social network for students: share posts and photos, find friends and chat in real time.

This is the web app. The API lives in a separate repository: [winkuback](https://github.com/ArnoSahakyan/winkuback).

## Features

- Sign up and log in (sessions refresh automatically)
- Profile with name, job, profile picture and cover photo
- Posts with text and/or an image, likes, comments and replies
- Newsfeed with everyone's posts, and a Photos page with your images
- Friend requests, friend suggestions and user search
- Real-time one-to-one chat with friends
- Online / away / offline status
- Responsive layout: three columns on desktop, two on tablets (768-1023px), one on phones (up to 767px)

## Tech stack

- **React 18 + TypeScript**, built with **Vite**
- **Redux Toolkit** for state, **redux-persist** to keep you logged in
- **React Router** for pages
- **Formik + Yup** for forms and validation
- **Axios** for the API, **Socket.IO** for chat
- **SCSS** for styles; brand colors live in `src/assets/_webColors.scss`

## Getting started

### Prerequisites

- Node.js 18+
- The [Jupiter backend](https://github.com/ArnoSahakyan/winkuback) running locally or deployed

### 1. Install dependencies

```sh
npm install
```

### 2. Point the app at the backend

Set the backend URL in `.env` in the project root:

```env
VITE_BACK_BASE_URL=http://localhost:8080
```

The backend's `CORS` setting must allow the frontend's URL (`http://localhost:5173` for local development).

### 3. Run it

```sh
npm run dev
```

Open http://localhost:5173 and sign up for an account.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the development server with hot reload |
| `npm run build` | Type-check and build for production into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint (fails on any warning) |

## Project structure

```text
public/                   Logos, favicon and static images
src/
  api/axios.ts            API client: adds the access token, refreshes it when it expires
  assets/                 Fonts and the color palette (_webColors.scss)
  components/             UI pieces: navigation, feed, posts, comments, chat, sidebars, footer, ...
    shared/               Loaders, skeletons, modal, small reusable bits
  hooks/                  useAuth (login, signup, logout) and date formatting
  layout/layout.tsx       Page frame: navbar, notifications, footer
  pages/
    NotProtected/         Log in, sign up, error page
    Protected/            Profile (HomePage), News Feed, Friends, Photos
  routes/routes.ts        Route paths
  store/                  Redux store and slices (user, posts, friends)
```

Pages under `Protected/` need a logged-in user (`ProtectedRoute`); the login and signup pages redirect logged-in users away (`AuthRoute`).

## Changing the look

- **Colors:** edit `src/assets/_webColors.scss`; every component uses these variables.
- **Logos:** `public/logo.svg` (dark), `public/logo-light.svg` (for colored backgrounds), `public/favicon.svg`, and `public/jupiter.svg` on the login and signup pages.

## Deployment

The app is a static site. `npm run build` outputs `dist/`. `vercel.json` sends every route to `index.html`, so deep links like `/messages` work on Vercel. Set `VITE_BACK_BASE_URL` to the deployed backend URL in the hosting provider's environment settings.
