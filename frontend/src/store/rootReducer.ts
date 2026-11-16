import { combineReducers } from "@reduxjs/toolkit";
import friendsSlice from "./features/friends/friendsSlice";
import postSlice from "./features/post/postSlice";
import userInfoSlice from "./features/userInfo/userInfoSlice";
import storage from 'redux-persist/lib/storage';
import persistReducer from "redux-persist/es/persistReducer";
import { createMigrate, PersistedState } from "redux-persist";

type PersistedUserInfo = PersistedState & { data?: Record<string, unknown> };

const migrations = {
  // v1: the refresh token moved to an httpOnly cookie; drop the old copy
  // that earlier versions saved in localStorage.
  1: (state: PersistedState) => {
    const old = state as PersistedUserInfo;
    if (!old?.data) return state;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { refreshToken, ...data } = old.data;
    return { ...old, data } as PersistedState;
  },
};

export const userInfoPersistConfig = {
  key: 'userInfo',
  storage,
  version: 1,
  migrate: createMigrate(migrations),
  blacklist: ['error']
};

export const rootReducer = combineReducers({
  friends_request: friendsSlice,
  posts: postSlice,
  userInfo: persistReducer(userInfoPersistConfig, userInfoSlice),
});

export default rootReducer;
