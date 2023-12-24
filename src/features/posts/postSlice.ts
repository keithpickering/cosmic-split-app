import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { fetchWithAuth } from "../../api";
import { AsyncStatus } from "../../enums";
import { RootState } from "../../store";
import { fetchSingleThread } from "../threads/threadSlice";
import { FetchPostsRequest, Post, PostInput } from "./";

/**
 * Async thunk for fetching a single post (public or private) by its ID.
 * If the post is private, an authentication token is required.
 * @param {{ postId: string, token?: string }} params - The post ID and, optionally, the auth token for private posts.
 * @returns {Promise<Post>} The fetched post data.
 */
export const fetchSinglePost = createAsyncThunk(
  'posts/fetchSinglePost',
  async ({ postId, token }: { postId: string; token?: string }, { rejectWithValue }) => {
    try {
      return await fetchWithAuth(`/api/posts/${postId}`, { method: "GET", token }) as Post;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  }
);

/**
 * Async thunk for fetching a list of posts (public or private) in a thread with pagination.
 * An authentication token can be provided for private posts.
 * @param {{ params: FetchPostsRequest, token?: string }} args - The pagination parameters and thread ID, and optionally, the auth token for private posts.
 * @returns {Promise<Post[]>} The fetched list of posts.
 */
export const fetchPostList = createAsyncThunk(
  'posts/fetchPostList',
  async ({ params, token }: { params: FetchPostsRequest; token?: string }, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.set('pageSize', params.pageSize.toString());
      queryParams.set('skipCount', params.skipCount.toString());

      // Add 'threadId' only if it's defined
      if (params.threadId) {
        queryParams.set('threadId', params.threadId);
      }

      return [
        {
          id: "post1",
          poster: {
            accountId: "accountId",
            personaId: "personaId",
          },
          threadId: "threadId1",
          content: "post content",
          dateCreated: "2023-12-23T22:03:54Z",
          dateUpdated: "2023-12-23T22:03:54Z",
        },
        {
          id: "post2",
          poster: {
            accountId: "accountId",
            personaId: "personaId",
          },
          threadId: "threadId1",
          content: "post content 2",
          dateCreated: "2023-12-23T22:03:54Z",
          dateUpdated: "2023-12-23T22:03:54Z",
        }
      ] as Post[];

      return await fetchWithAuth(`/api/posts?${queryParams.toString()}`, { method: 'GET', token });
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  }
);

/**
 * Async thunk for creating a new post in a thread.
 * Requires an authentication token and post data.
 * @param {{ postData: PostInput, token: string }} params - The new post data and the auth token.
 * @returns {Promise<Post>} The newly created post data.
 */
export const createNewPost = createAsyncThunk(
  'posts/createNewPost',
  async ({ postData, token }: { postData: PostInput; token: string }, { rejectWithValue }) => {
    try {
      return await fetchWithAuth('/api/posts', {
        method: 'POST',
        jsonBody: postData,
        token,
      });
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  }
);

/**
 * Async thunk for editing an existing post.
 * Requires an authentication token and the updated post data.
 * @param {{ postId: string, updateData: Partial<PostInput>, token: string }} params - The post ID, updated post data, and the auth token.
 * @returns {Promise<Post>} The updated post data.
 */
export const editPost = createAsyncThunk(
  'posts/editPost',
  async ({ postId, updateData, token }: { postId: string; updateData: Partial<PostInput>; token: string }, { rejectWithValue }) => {
    try {
      return await fetchWithAuth(`/api/posts/${postId}`, {
        method: 'PATCH',
        jsonBody: updateData,
        token,
      });
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  }
);

interface PostState {
  status: AsyncStatus;
  list: Post[];
  hasMore: boolean;
}

const initialState: PostState = {
  status: AsyncStatus.IDLE,
  list: [],
  hasMore: true,
};

const postSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    resetPostList: (state) => {
      state.list = [];
      state.hasMore = true;
      state.status = AsyncStatus.IDLE;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handling fetchSingleThread
      .addCase(fetchSingleThread.pending, (state) => {
        state.list = [];
        state.hasMore = true;
        state.status = AsyncStatus.IDLE;
      })
      // Handling fetchPostList
      .addCase(fetchPostList.pending, (state) => {
        state.status = AsyncStatus.LOADING;
      })
      .addCase(fetchPostList.fulfilled, (state, action) => {
        state.list = [...state.list, ...action.payload];
        state.hasMore = action.payload.length > 0;
        state.status = AsyncStatus.SUCCEEDED;
      })
      .addCase(fetchPostList.rejected, (state) => {
        state.status = AsyncStatus.FAILED;
      });
  },
});

export const { resetPostList } = postSlice.actions;

export const selectPostList = (state: RootState) => {
  return state.posts.list;
}

export default postSlice.reducer;