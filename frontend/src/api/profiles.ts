import { api } from './axios';
import { API_URL as url } from './config';

export type TRelationship = 'self' | 'friends' | 'request_sent' | 'request_received' | 'none';

export type TProfile = {
  id: number;
  fname: string;
  username: string;
  pfp: string;
  coverPhoto: string;
  onlineStatus: string;
  job: string | null;
  email?: string; // only on your own profile
  relationship: TRelationship;
  friendshipId: number | null;
  friendsCount: number;
  postsCount: number;
};

export type TProfileFriend = {
  id: number;
  fname: string;
  username: string;
  pfp: string;
  job: string | null;
  onlineStatus: string;
};

export const fetchProfile = (userId: number) =>
  api.get<TProfile>(`${url}/api/users/${userId}`).then(res => res.data);

export const fetchProfileFriends = (userId: number) =>
  api.get<TProfileFriend[]>(`${url}/api/users/${userId}/friends`).then(res => res.data);
