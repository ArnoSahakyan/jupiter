import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { io } from 'socket.io-client';
import { SOCKET_URL } from '../api/config';
import { AppDispatch, store } from '../store/setup';
import { setStatus } from '../store/features/userInfo/userInfoSlice';

// Keeps one socket open while you're logged in, so the server knows when you
// close the app and can show you as offline (see backend app/socket/presence.js).
export default function usePresence(isAuth: boolean) {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (!isAuth) return;

    const socket = io(SOCKET_URL, {
      // a function, so reconnects always send the latest (renewed) access token
      auth: (callback) => callback({ token: store.getState().userInfo.data.accessToken }),
    });
    socket.on('presence', ({ onlineStatus }: { onlineStatus: string }) => {
      dispatch(setStatus(onlineStatus));
    });

    return () => {
      socket.disconnect();
    };
  }, [dispatch, isAuth]);
}
