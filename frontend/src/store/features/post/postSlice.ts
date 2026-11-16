import { createSlice } from "@reduxjs/toolkit";
import { createComment, createPost, deletePost, getNewsfeed, getProfilePosts, getUserPosts, likePost, unlikePost } from "./postThunks";

export type TReplies = {
  commentId: number;
  userId?: number;
  content: string;
  createdAt: Date;
  fname: string;
  parentId: number | null;
  pfp: string;
};

export type TComments = TReplies & {
  replies: TReplies[] | null;
};

export type PostState = {
  postId: number;
  content: string | null;
  image: string | undefined;
  likeCount: number;
  createdAt: Date;
  fname: string;
  pfp: string;
  userId: number;
  comments: TComments[] | null;
  likedByUser: boolean;
};

type TpostInitialState = {
  userPosts: {
    data: PostState[],
    currentPage: number,
    totalPages: number | undefined,
    totalItems: number | undefined
    offset: number
  },
  newsfeedPosts: {
    data: PostState[],
    currentPage: number,
    totalPages: number | undefined,
    totalItems: number | undefined
    offset: number
  },
  // posts of the profile currently being viewed (/user/:id)
  profilePosts: {
    userId: number | undefined,
    data: PostState[],
    currentPage: number,
    totalPages: number | undefined,
    totalItems: number | undefined
    offset: number
  },
  loading: boolean,
  createLoading: boolean,
  deleteLoading: { loading: boolean, postId: number | undefined },
  commentLoading: { loading: boolean, postId: number | undefined },
  error: string | undefined
}

const initialState: TpostInitialState = {
  userPosts: {
    data: [],
    currentPage: 1,
    totalPages: undefined,
    totalItems: undefined,
    offset: 0
  },
  newsfeedPosts: {
    data: [],
    currentPage: 1,
    totalPages: undefined,
    totalItems: undefined,
    offset: 0
  },
  profilePosts: {
    userId: undefined,
    data: [],
    currentPage: 1,
    totalPages: undefined,
    totalItems: undefined,
    offset: 0
  },
  loading: false,
  createLoading: false,
  deleteLoading: { loading: false, postId: undefined },
  commentLoading: { loading: false, postId: undefined },
  error: undefined
}

// A post can be in several lists at once (your timeline, the newsfeed, a
// profile), so likes/comments update every copy.
const findEverywhere = (state: TpostInitialState, postId: number) =>
  [state.userPosts, state.newsfeedPosts, state.profilePosts]
    .map(list => list.data.find(post => post.postId === postId))
    .filter((post): post is PostState => post !== undefined);

// Add a page of posts, skipping any already shown (posting something new
// shifts the server's pages by one).
const appendNew = (list: PostState[], page: PostState[]) => {
  const shown = new Set(list.map(post => post.postId));
  list.push(...page.filter(post => !shown.has(post.postId)));
};

const addComment = (post: PostState, comment: TComments) => {
  if (comment.parentId) {
    const parentComment = post.comments!.find(c => c.commentId === comment.parentId);
    if (parentComment) {
      if (!parentComment.replies) {
        parentComment.replies = [];
      }
      parentComment.replies.push(comment);
    }
  } else {
    if (!post.comments) {
      post.comments = [];
    }
    post.comments.push(comment);
  }
};

const postSlice = createSlice({
  name: 'posts',
  initialState: initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getUserPosts.fulfilled, (state, { payload, meta }) => {
        if (meta.arg.offset === 0) {
          state.userPosts = payload;
        } else {
          appendNew(state.userPosts.data, payload.data);
          state.userPosts.currentPage = payload.currentPage;
          state.userPosts.offset = payload.offset;
          state.userPosts.totalItems = payload.totalItems;
          state.userPosts.totalPages = payload.totalPages
        }
        state.loading = false;
      })
      .addCase(getUserPosts.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(getUserPosts.rejected, (state, action) => {
        state.error = action.error.message;
        state.loading = false;
      })

      .addCase(getNewsfeed.fulfilled, (state, { payload, meta }) => {
        if (meta.arg.offset === 0) {
          state.newsfeedPosts = payload;
        } else {
          appendNew(state.newsfeedPosts.data, payload.data);
          state.newsfeedPosts.currentPage = payload.currentPage;
          state.newsfeedPosts.offset = payload.offset;
          state.newsfeedPosts.totalItems = payload.totalItems;
          state.newsfeedPosts.totalPages = payload.totalPages
        }
        state.loading = false;
      })
      .addCase(getProfilePosts.fulfilled, (state, { payload, meta }) => {
        if (meta.arg.offset === 0 || state.profilePosts.userId !== meta.arg.userId) {
          state.profilePosts = { ...payload, userId: meta.arg.userId };
        } else {
          appendNew(state.profilePosts.data, payload.data);
          state.profilePosts.currentPage = payload.currentPage;
          state.profilePosts.offset = payload.offset;
          state.profilePosts.totalItems = payload.totalItems;
          state.profilePosts.totalPages = payload.totalPages;
        }
        state.loading = false;
      })
      .addCase(getProfilePosts.pending, (state, { meta }) => {
        state.loading = true;
        if (state.profilePosts.userId !== meta.arg.userId) {
          state.profilePosts = { ...initialState.profilePosts, userId: meta.arg.userId };
        }
      })
      .addCase(getProfilePosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      .addCase(getNewsfeed.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(getNewsfeed.rejected, (state, action) => {
        state.error = action.error.message;
        state.loading = false;
      })

      .addCase(createPost.fulfilled, (state, { payload }) => {
        const modifiedData = {
          ...payload,
          image: payload.image ? payload.image : null,
        };
        state.userPosts.data.unshift(modifiedData)
        if (state.userPosts.totalItems !== undefined) state.userPosts.totalItems += 1
        // the newsfeed shows your posts too (only once it has loaded)
        if (state.newsfeedPosts.totalItems !== undefined) {
          state.newsfeedPosts.data.unshift(modifiedData)
          state.newsfeedPosts.totalItems += 1
        }
        state.createLoading = false
      })
      .addCase(createPost.pending, (state) => {
        state.createLoading = true
        state.error = undefined;
      })
      .addCase(createPost.rejected, (state, action) => {
        state.error = action.error.message;
        state.createLoading = false
      })

      .addCase(likePost.fulfilled, (state, { payload }) => {
        findEverywhere(state, payload.postId).forEach(post => {
          post.likeCount = post.likeCount + 1;
          post.likedByUser = true;
        });
      })
      .addCase(likePost.rejected, (state, { error }) => {
        state.error = error.message
      })

      .addCase(unlikePost.fulfilled, (state, { payload }) => {
        findEverywhere(state, payload.postId).forEach(post => {
          post.likeCount = post.likeCount - 1;
          post.likedByUser = false;
        });
      })
      .addCase(unlikePost.rejected, (state, { error }) => {
        state.error = error.message
      })

      .addCase(deletePost.fulfilled, (state, action) => {
        // only your own posts can be deleted
        if (state.userPosts.totalItems && state.userPosts.data.some(post => post.postId == action.payload.postId)) {
          state.userPosts.totalItems -= 1
        }
        for (const list of [state.userPosts, state.newsfeedPosts, state.profilePosts]) {
          list.data = list.data.filter(post => post.postId != action.payload.postId)
        }
        state.deleteLoading = { loading: false, postId: undefined };
      })
      .addCase(deletePost.pending, (state, action) => {
        state.deleteLoading = { loading: true, postId: action.meta.arg };
        state.error = undefined;
      })
      .addCase(deletePost.rejected, (state, action) => {
        state.error = action.error.message;
        state.deleteLoading = { loading: false, postId: undefined };
      })

      .addCase(createComment.fulfilled, (state, action) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { uploaderId, ...comment } = action.payload;
        findEverywhere(state, action.payload.postId).forEach(post => addComment(post, { ...comment, replies: null }));
        state.commentLoading = { loading: false, postId: undefined };
      })
      .addCase(createComment.pending, (state, action) => {
        state.commentLoading = { loading: true, postId: action.meta.arg.postId };
        state.error = undefined;
      })
      .addCase(createComment.rejected, (state, action) => {
        state.error = action.error.message;
        state.commentLoading = { loading: false, postId: undefined };
      })

  },
  selectors: {
    userPostsSelector: state => state.userPosts,
    newsfeedPostsSelector: state => state.newsfeedPosts,
    profilePostsSelector: state => state.profilePosts,
    postGetLoading: state => state.loading,
    postCreateLoading: state => state.createLoading,
    postDeleteLoading: state => state.deleteLoading,
    postCommentLoading: state => state.commentLoading,
    postError: state => state.error
  }
});

export const { userPostsSelector, newsfeedPostsSelector, profilePostsSelector, postGetLoading, postCreateLoading, postDeleteLoading, postCommentLoading, postError } = postSlice.selectors
export default postSlice.reducer;