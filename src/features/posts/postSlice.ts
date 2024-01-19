import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchWithAuth } from '../../api';
import { AsyncStatus } from '../../enums';
import { RootState } from '../../store';
import { fetchSingleThread } from '../threads/threadSlice';
import { Post, FetchPostsRequest, PostInput, PostFlat } from './';

/**
 * Async thunk for fetching a single post (public or private) by its ID.
 * If the post is private, an authentication token is required.
 * @param {{ postId: string, token?: string }} params - The post ID and, optionally, the auth token for private posts.
 * @returns {Promise<Post>} The fetched post data.
 */
export const fetchSinglePost = createAsyncThunk(
  'posts/fetchSinglePost',
  async (
    { postId, token }: { postId: string; token?: string },
    { rejectWithValue },
  ) => {
    try {
      return (await fetchWithAuth(`/api/posts/${postId}`, {
        method: 'GET',
        token,
      })) as Post;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'An unknown error occurred',
      );
    }
  },
);

/**
 * Async thunk for fetching a list of posts (public or private) in a thread with pagination.
 * An authentication token can be provided for private posts.
 * @param {{ params: FetchPostsRequest, token?: string }} args - The pagination parameters and thread ID, and optionally, the auth token for private posts.
 * @returns {Promise<Post[]>} The fetched list of posts.
 */
export const fetchPostList = createAsyncThunk(
  'posts/fetchPostList',
  async (
    { params, token }: { params: FetchPostsRequest; token?: string },
    { rejectWithValue },
  ) => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.set('pageSize', params.pageSize.toString());
      if (params.page) {
        queryParams.set('page', params.page.toString());
      }
      if (params.cursor) {
        queryParams.set('cursor', params.cursor.toString());
      }
      if (params.threadId) {
        queryParams.set('threadId', params.threadId.toString());
      }
      return await fetchWithAuth(`/posts?${queryParams.toString()}`, {
        method: 'GET',
        token,
      });
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'An unknown error occurred',
      );
    }
  },
);

/**
 * Async thunk for creating a new post in a thread.
 * Requires an authentication token and post data.
 * @param {{ postData: PostInput, token: string }} params - The new post data and the auth token.
 * @returns {Promise<Post>} The newly created post data.
 */
export const createNewPost = createAsyncThunk(
  'posts/createNewPost',
  async (
    { postData, token }: { postData: PostInput; token: string },
    { rejectWithValue },
  ) => {
    try {
      return await fetchWithAuth('/posts', {
        method: 'POST',
        jsonBody: postData,
        token,
      });
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'An unknown error occurred',
      );
    }
  },
);

/**
 * Async thunk for editing an existing post.
 * Requires an authentication token and the updated post data.
 * @param {{ postId: string, updateData: Partial<PostInput>, token: string }} params - The post ID, updated post data, and the auth token.
 * @returns {Promise<Post>} The updated post data.
 */
export const editPost = createAsyncThunk(
  'posts/editPost',
  async (
    {
      postId,
      updateData,
      token,
    }: { postId: string; updateData: Partial<PostInput>; token: string },
    { rejectWithValue },
  ) => {
    try {
      return await fetchWithAuth(`/posts/${postId}`, {
        method: 'PATCH',
        jsonBody: updateData,
        token,
      });
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'An unknown error occurred',
      );
    }
  },
);

type PostsKeyed = {
  [byId: string]: PostFlat;
};
interface PostState {
  status: AsyncStatus;
  allIds: string[];
  byId: PostsKeyed;
  hasMore: boolean;
}

const initialState: PostState = {
  status: AsyncStatus.IDLE,
  allIds: [],
  byId: {},
  hasMore: true,
};

const flattenPost = (post: Post) => {
  const flattenedPost: PostFlat = {
    id: post.id,
    threadId: post.threadId,
    content: post.content,
    personaId: post.persona.id, // Flattened persona
    accountId: post.account.id, // Flattened account
    dateCreated: post.dateCreated,
    dateUpdated: post.dateUpdated,
  };
  return flattenedPost;
};

const postSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    resetPostList: state => {
      state.allIds = [];
      state.hasMore = true;
      state.status = AsyncStatus.IDLE;
    },
    clearAllPostData: state => {
      state.allIds = [];
      state.byId = {};
      state.hasMore = true;
      state.status = AsyncStatus.IDLE;
    },
    addPostToState: (state, action) => {
      const post: Post = action.payload;
      const flattenedPost = flattenPost(post);
      state.byId[flattenedPost.id] = flattenedPost;
    },
  },
  extraReducers: builder => {
    builder
      // Reset post list when a new thread is requested
      .addCase(fetchSingleThread.pending, state => {
        state.allIds = [];
        state.hasMore = true;
        state.status = AsyncStatus.IDLE;
      })

      // Handle a list of posts being fetched
      .addCase(fetchPostList.pending, state => {
        state.status = AsyncStatus.LOADING;
      })
      .addCase(fetchPostList.fulfilled, (state, action) => {
        action.payload.reduce((byId: PostsKeyed, post: Post) => {
          const flattenedPost = flattenPost(post);
          byId[flattenedPost.id] = flattenedPost;
          return byId;
        }, state.byId);
        state.hasMore = action.payload.length > 0;
        state.status = AsyncStatus.SUCCEEDED;
      })
      .addCase(fetchPostList.rejected, state => {
        state.status = AsyncStatus.FAILED;
      })

      // Handle a new post being created
      /* .addCase(createNewPost.pending, state => {
        state.status = AsyncStatus.LOADING;
      })
      .addCase(createNewPost.fulfilled, (state, action) => {
        const post: Post = action.payload.post;
        const flattenedPost = flattenPost(post);
        state.byId[post.id] = flattenedPost;
        //state.allIds.push(post.id);
        state.status = AsyncStatus.SUCCEEDED;
      })
      .addCase(createNewPost.rejected, state => {
        state.status = AsyncStatus.FAILED;
      })

      // Handle an existing post being edited
      .addCase(editPost.pending, state => {
        state.status = AsyncStatus.LOADING;
      })
      .addCase(editPost.fulfilled, (state, action) => {
        const updatedPost: Post = action.payload;
        if (state.byId[updatedPost.id]) {
          state.byId[updatedPost.id] = {
            ...state.byId[updatedPost.id],
            content: updatedPost.content,
            dateUpdated: updatedPost.dateUpdated,
          };
          state.status = AsyncStatus.SUCCEEDED;
        }
      })
      .addCase(editPost.rejected, state => {
        state.status = AsyncStatus.FAILED;
      }); */
  },
});

// Export actions
export const { resetPostList, addPostToState, clearAllPostData } =
  postSlice.actions;

/**
 * Select the list of post objects in current state order
 */
export const selectPostList = (state: RootState) => {
  return state.posts.allIds.map(id => state.posts.byId[id]);
};

/**
 * Select a specific post in the store by its ID
 */
export const selectPostById = (id: string) => (state: RootState) => {
  if (!id) {
    return null;
  }
  return state.posts.byId[id];
};

export default postSlice.reducer;
