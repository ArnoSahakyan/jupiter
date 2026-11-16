const ROUTES = {
  LOGIN: '/auth/signin',
  SIGNUP: '/auth/signup',
  HOME: '/',
  PHOTOS: 'photos',
  FRIENDS: 'friends',
  MESSAGES: 'messages',
  NEWSFEED: '/newsfeed',
  CHAT: '/chat',
  USER: '/user/:id'
};

// Link to someone's profile; your own profile is the home page.
export const profilePath = (userId: number, ownId?: number) =>
  userId === ownId ? ROUTES.HOME : `/user/${userId}`;

export default ROUTES;