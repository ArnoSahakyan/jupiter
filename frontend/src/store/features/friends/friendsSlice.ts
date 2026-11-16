import { createSlice } from "@reduxjs/toolkit";
import { deleteFriend, getFriendsApi, getMessages, getRequestsApi, getUnassociatedApi, respondRequest, sendRequest } from "./friendThunks";

export type TFriend = {
  friendshipId: number;
  id: number;
  fname: string;
  email: string;
  onlineStatus: string;
  job: string;
  pfp: string;
}

export type TRequest = {
  requestId: number,
  senderId: number,
  status: string,
  fname: string,
  pfp: string
}

export type TFriendBack = {
  friendshipId: number;
  id: number;
  fname: string;
  username: string;
  pfp: string;
  job: string;
  onlineStatus: string;
  messages: TMessages[];
}

export type Tunassocitaed = {
  id: number,
  fname: string,
  username: string
  job: string,
  pfp: string,
}

type TUsers = {
  requests: TRequest[],
  friendsBack: TFriendBack[],
  unassociated: Tunassocitaed[],
  loading: boolean,
  messageLoading: boolean,
  respondLoading: { loading: boolean, userId: number | undefined },
  error: string,
}

export type TMessages = {
  messageId: number;
  senderId: number;
  receiverId: number;
  message: string;
  createdAt?: string;
}

// Temporary ids for messages shown before the server has an id for them.
// Negative, so they never clash with real (positive) database ids.
let localMessageId = 0;
const nextLocalId = () => --localMessageId;

const initialState: TUsers = {
  requests: [],
  friendsBack: [],
  unassociated: [],
  loading: false,
  messageLoading: false,
  respondLoading: { loading: false, userId: undefined },
  error: undefined
};

const friendsSlice = createSlice({
  name: 'friends_request',
  initialState: initialState,
  reducers: {
    receiveMessage: (state, { payload }) => {
      const friend = state.friendsBack.find(friend => friend.id === payload.senderId);

      if (friend) {
        friend.messages.push({
          ...payload,
          messageId: payload.messageId ?? nextLocalId(),
          createdAt: payload.createdAt ?? new Date().toISOString()
        });
      }
    },
    sendMessage: (state, { payload }) => {
      const friend = state.friendsBack.find(friend => friend.id === payload.receiverId);
      if (friend) {
        friend.messages.push({
          ...payload,
          messageId: nextLocalId(),
          createdAt: new Date().toISOString()
        });
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getFriendsApi.fulfilled, (state, { payload }) => {
        // keep chat history already loaded for each friend; refresh the rest
        const loaded = new Map(state.friendsBack.map(friend => [friend.id, friend.messages]));
        state.friendsBack = payload.map((friend: TFriendBack) => ({ ...friend, messages: loaded.get(friend.id) ?? friend.messages }));
        state.loading = false;
      })
      .addCase(getFriendsApi.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(getFriendsApi.rejected, (state, { error }) => {
        state.error = error.message
        state.loading = false;
      })

      .addCase(getRequestsApi.fulfilled, (state, { payload }) => {
        state.requests = [...payload];
        state.loading = false;
      })
      .addCase(getRequestsApi.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(getRequestsApi.rejected, (state, { error }) => {
        state.error = error.message
        state.loading = false;
      })

      .addCase(getUnassociatedApi.fulfilled, (state, { payload }) => {
        state.unassociated = [...payload]
        state.loading = false;
      })
      .addCase(getUnassociatedApi.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(getUnassociatedApi.rejected, (state, { error }) => {
        state.error = error.message
        state.loading = false;
      })

      .addCase(deleteFriend.fulfilled, (state, { payload }) => {
        state.friendsBack = state.friendsBack.filter(friend => friend.id != payload.friendId);
        state.respondLoading = { loading: false, userId: undefined }
      })
      .addCase(deleteFriend.pending, (state, action) => {
        state.respondLoading = { loading: true, userId: action.meta.arg }
        state.error = undefined;
      })
      .addCase(deleteFriend.rejected, (state, { error }) => {
        state.error = error.message
        state.respondLoading = { loading: false, userId: undefined }
      })

      .addCase(respondRequest.fulfilled, (state, { payload }) => {
        state.requests = state.requests.filter(request => request.requestId != payload.requestId);
        state.respondLoading = { loading: false, userId: undefined }
      })
      .addCase(respondRequest.pending, (state, action) => {
        state.respondLoading = { loading: true, userId: action.meta.arg.senderId }
        state.error = undefined;
      })
      .addCase(respondRequest.rejected, (state, { error }) => {
        state.error = error.message
        state.respondLoading = { loading: false, userId: undefined }
      })

      .addCase(sendRequest.fulfilled, (state) => {
        state.respondLoading = { loading: false, userId: undefined }
      })
      .addCase(sendRequest.pending, (state, action) => {
        state.respondLoading = { loading: true, userId: action.meta.arg }
        state.error = undefined;
      })
      .addCase(sendRequest.rejected, (state, { payload, error }) => {
        state.error = (payload as string | undefined) ?? error.message
        state.respondLoading = { loading: false, userId: undefined }
      })

      .addCase(getMessages.fulfilled, (state, { payload }) => {
        const friend = state.friendsBack.find(friend => friend.id == payload.friendId)
        if (friend) friend.messages = payload.messages
        state.messageLoading = false;
      })
      .addCase(getMessages.pending, (state) => {
        state.messageLoading = true;
        state.error = undefined;
      })
      .addCase(getMessages.rejected, (state, action) => {
        state.error = action.error.message
        state.messageLoading = false;
      })
  },
  selectors: {
    getRequests: (state) => state.requests,
    getFriendsBack: (state) => state.friendsBack,
    getUnassociated: (state) => state.unassociated,
    getFriendsLoading: (state) => state.loading,
    getRespondLoading: (state) => state.respondLoading,
    getMessagesLoading: (state) => state.messageLoading,
    getFriendsError: (state) => state.error
  }
});

export const { sendMessage, receiveMessage } = friendsSlice.actions
export const { getRequests, getFriendsBack, getUnassociated, getFriendsLoading, getRespondLoading, getMessagesLoading, getFriendsError } = friendsSlice.selectors
export default friendsSlice.reducer;