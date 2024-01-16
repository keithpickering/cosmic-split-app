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
      queryParams.set('skipCount', params.skipCount.toString());

      // Add 'threadId' only if it's defined
      if (params.threadId) {
        queryParams.set('threadId', params.threadId);
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
  },
  extraReducers: builder => {
    builder
      // Handling fetchSingleThread
      .addCase(fetchSingleThread.pending, state => {
        state.allIds = [];
        state.hasMore = true;
        state.status = AsyncStatus.IDLE;
      })

      // Handling fetchPostList
      .addCase(fetchPostList.pending, state => {
        state.status = AsyncStatus.LOADING;
      })
      .addCase(fetchPostList.fulfilled, (state, action) => {
        // Add fetched posts to the data store
        state.allIds.push(
          // Flatten post data, abstracting repeated data by ID.
          // This effect should also be handled in extraReducers for related
          // slices, to ensure the abstracted data can be referenced in Redux.
          ...action.payload.reduce((allIds: string[], post: Post) => {
            const flattenedPost: PostFlat = {
              id: post.id,
              threadId: post.threadId,
              content: post.content,
              personaId: post.persona.id, // Flattened persona
              accountId: post.account.id, // Flattened account
              dateCreated: post.dateCreated,
              dateUpdated: post.dateUpdated,
            };
            // Add flattened post to byId object
            state.byId[flattenedPost.id] = flattenedPost;
            // Add post ID to allIds array
            allIds.push(flattenedPost.id);
            return allIds;
          }, []),
        );
        state.hasMore = action.payload.length > 0;
        state.status = AsyncStatus.SUCCEEDED;
      })
      .addCase(fetchPostList.rejected, state => {
        state.status = AsyncStatus.FAILED;
      })

      // Handling createNewPost
      .addCase(createNewPost.pending, state => {
        state.status = AsyncStatus.LOADING;
      })
      .addCase(createNewPost.fulfilled, (state, action) => {
        const newPost = action.payload;
        const flattenedPost: PostFlat = {
          id: newPost.id,
          threadId: newPost.threadId,
          content: newPost.content,
          personaId: newPost.persona.id,
          accountId: newPost.account.id,
          dateCreated: newPost.dateCreated,
          dateUpdated: newPost.dateUpdated,
        };
        state.byId[newPost.id] = flattenedPost;
        state.allIds.push(newPost.id);
        state.status = AsyncStatus.SUCCEEDED;
      })
      .addCase(createNewPost.rejected, state => {
        state.status = AsyncStatus.FAILED;
      })

      // Handling editPost
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
      });
  },
});

export const { resetPostList, clearAllPostData } = postSlice.actions;

export const selectPostList = (state: RootState) => {
  return state.posts.allIds.map(id => state.posts.byId[id]);
};

export const selectPostById = (id: string) => (state: RootState) => {
  if (!id) {
    return null;
  }
  return state.posts.byId[id];
};

export default postSlice.reducer;
