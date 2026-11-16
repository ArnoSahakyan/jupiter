import { isAxiosError } from 'axios';

// The server's message (e.g. "Username is already in use") from an axios error.
export const serverMessage = (error: unknown) =>
  (isAxiosError(error) && error.response?.data?.message) || 'Something went wrong, please try again';
