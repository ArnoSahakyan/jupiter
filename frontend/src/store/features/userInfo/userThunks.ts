import { createAsyncThunk } from '@reduxjs/toolkit';
import axios, { isAxiosError } from 'axios';
import { api } from '../../../api/axios';
import { Tunassocitaed } from '../friends/friendsSlice';
import { API_URL as url } from '../../../api/config';

// Pull the server's message (e.g. "Username is already in use") out of an axios error.
const serverMessage = (error: unknown) =>
  (isAxiosError(error) && error.response?.data?.message) || "Something went wrong, please try again";

type SignupData = {
  username: string;
  email: string;
  password: string;
};

type LoginData = Omit<SignupData, 'email'>;

type TimageType = {
  file: File | undefined;
  type: string
}

export type TsearchedUsers = Tunassocitaed & {
  email: string;
  onlineStatus: string;
}

export const signupUser = createAsyncThunk(
  'userInfo/signupAsync',
  async (data: SignupData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${url}/api/auth/signup`, data,
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(serverMessage(error));
    }
  }
);

export const loginUser = createAsyncThunk(
  'userInfo/loginAsync',
  async (data: LoginData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${url}/api/auth/signin`, data,
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(serverMessage(error));
    }
  }
);

export const changeUserImage = createAsyncThunk(
  'userInfo/changePfpAsync',
  async (data: TimageType) => {
    if (data) {
      const formData = new FormData();
      formData.append('file', data.file);
      formData.append('type', data.type)
      const response = await api.post(`${url}/api/upload/user-images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    }
    else return;
  }
);

// Reload the logged-in user's profile so the saved (persisted) copy stays current.
export const fetchUserInfo = createAsyncThunk('userInfo/fetchUserInfo',
  async () => {
    const response = await api.get(`${url}/api/user/info`)
    return response.data
  }
)

export const changeOnlineStatus = createAsyncThunk('userInfo/changeOnlineStatus',
  async (data: { onlineStatus: string }) => {
    const response = await api.patch(`${url}/api/user/status`, data)
    return response.data
  }
)

export const changeUserData = createAsyncThunk('userInfo/changeUserData',
  async (data: { fname: string, job: string }) => {
    const response = await api.patch(`${url}/api/user/update`, data)
    return response.data
  }
)

export const searchUsers = createAsyncThunk('user/searchUser',
  async ({ query, limit, offset }: { query: string, limit: number, offset: number }) => {
    const response = await api.get(`${url}/api/search-user`, {
      params: {
        query,
        limit,
        offset
      }
    });

    return {
      totalUsers: response.data.totalUsers,
      totalPages: response.data.totalPages,
      currentPage: response.data.currentPage,
      users: response.data.users,
    };
  }
)