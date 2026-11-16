# Jupiter Frontend

Jupiter is a social network website allowing users to sign up, sign in, upload images, change profile and cover pictures, upload posts with text and photo, add and delete friends, search for other users, and message them in real-time.

## Features

- User Authentication (Sign Up, Sign In, Refresh Token)
- Upload Images (Profile Picture, Cover Picture, Post Images)
- Change Profile and Cover Pictures
- Create, Read, Update, Delete Posts
- Like and Unlike Posts
- Comment on Posts
- Add and Delete Friends
- Search for Users
- Real-time Messaging
- Responsive Design

## Prerequisites

- Node.js
- npm or yarn

## Installation

1. Clone the repository

   ```bash
   git clone https://github.com/ArnoSahakyan/winku.git
   cd winku
   ```

2. Install dependencies

   ```bash
   npm install
   ```

   or

   ```bash
   yarn install
   ```

## Environment Variables

Create a `.env` file in the root directory and add the following environment variables:

```env
   VITE_BACK_BASE_URL=<your-backend-url>
```

## Running the App

To start the development server, run:

```bash
npm run dev
```

or

```bash
yarn dev
```

The app will be available at (http://localhost:5173).

## Building the App

To create a production build, run:

```bash
npm run build
```

or

```bash
yarn build
```

The production build will be available in the `dist` directory.

## Project Structure

```plaintext
.vscode/
node_modules/
public/
src/
|-- api/
|-- assets/
|-- components/
|   |-- AuthRoute/
|   |-- BurgerMenu/
|   |-- CreatePost/
|   |-- EditForm/
|   |-- Feed/
|   |-- Footer/
|   |-- FriendsBar/
|   |-- LeftSidebar/
|   |-- Messages/
|   |-- Navigation/
|   |-- PageBar/
|   |-- Post/
|   |-- ProfileCover/
|   |-- ProtectedRoute/
|   |-- RightSidebar/
|   |-- SearchUser/
|   |-- shared/
|       |-- Shortcuts/
|-- hooks/
|   |-- dateFormat.ts
|   |-- useAuth.ts
|-- layout/
|   |-- layout.tsx
|-- pages/
|   |-- NotProtected/
|   |   |-- ErrorPage/
|   |   |-- LogIn/
|   |   |-- SignUp/
|   |-- Protected/
|       |-- FriendsPage/
|       |-- HomePage/
|       |-- NewsFeed/
|       |-- Photos/
|-- routes/
|-- store/
|   |-- features/
|       |-- friends/
|           |-- friendsSlice.ts
|           |-- friendThunks.ts
|       |-- post/
|           |-- postSlice.ts
|           |-- postThunks.ts
|       |-- userInfo/
|           |-- userInfoSlice.ts
|           |-- userThunks.ts
|       |-- rootReducer.ts
|   |-- setup.ts
|-- App.scss
|-- App.tsx
|-- index.scss
|-- main.tsx
|-- vite-env.d.ts
.env
.eslintrc.cjs
.gitignore
index.html
package-lock.json
package.json
README.md
tsconfig.json
tsconfig.node.json
vercel.json
vite.config.ts
```

## Components

- **AuthRoute**: Handles routes that should only be accessible to authenticated users.
- **BurgerMenu**: Implements the responsive burger menu.
- **CreatePost**: Form component for creating new posts.
- **EditForm**: Form component for editing user details.
- **Feed**: Displays the news feed.
- **Footer**: Footer component of the application.
- **FriendsBar**: Displays a list of friends.
- **LeftSidebar**: Sidebar component with navigation links.
- **Messages**: Component for displaying messages.
- **Navigation**: Main navigation bar.
- **PageBar**: Pagination component.
- **Post**: Component to display individual posts.
- **ProfileCover**: Component to display and update the user's cover photo.
- **ProtectedRoute**: Handles routes that should only be accessible to authenticated users.
- **RightSidebar**: Sidebar component with additional navigation links.
- **SearchUser**: Component for searching users.
- **shared**: Contains shared components like icons, loaders, and modals.
- **Shortcuts**: Quick access to various sections of the application.

## Hooks

- **dateFormat.ts**: Custom hook for formatting dates.
- **useAuth.ts**: Custom hook for handling authentication.

## Pages

- **NotProtected**
  - **ErrorPage**: Page displayed for error routes.
  - **LogIn**: Login page.
  - **SignUp**: Sign-up page.
- **Protected**
  - **FriendsPage**: Page displaying the user's friends.
  - **HomePage**: Homepage displaying user's profile and posts.
  - **NewsFeed**: Page displaying the news feed.
  - **Photos**: Page displaying the user's photos.

## Store

- **features**
  - **friends**
    - **friendsSlice.ts**: Slice for managing friends.
    - **friendThunks.ts**: Thunks for friends-related actions.
  - **post**
    - **postSlice.ts**: Slice for managing posts.
    - **postThunks.ts**: Thunks for posts-related actions.
  - **userInfo**
    - **userInfoSlice.ts**: Slice for managing user information.
    - **userThunks.ts**: Thunks for user information-related actions.
  - **rootReducer.ts**: Combines all slices.
- **setup.ts**: Sets up the Redux store.

## Routing

The app uses `react-router-dom` for routing. The routes are defined in `src/routes`.

### Protected Routes

Protected routes are wrapped in the `ProtectedRoute` component to ensure that only authenticated users can access them.

### Auth Routes

Auth routes are wrapped in the `AuthRoute` component to ensure that only unauthenticated users can access them.

## State Management

The app uses Redux for state management. The store setup is in `src/store/setup.ts`. User information is managed in the `userInfoSlice` and `userThunks` in `src/store/features/userInfo`.

## Image Upload

Image uploads are handled using the `uploadMiddleware` and `compressImageMiddleware` in the backend. Images are stored in Supabase storage.

## Dependencies

- React
- Redux
- React Router
- Axios
- Socket IO
- Vite

## Scripts

- `dev`: Starts the development server using Vite.
- `build`: Builds the project for production.
- `lint`: Runs ESLint to check for code quality issues.
- `preview`: Previews the production build.

## Contributing

If you would like to contribute, please fork the repository and use a feature branch. Pull requests are welcome.
