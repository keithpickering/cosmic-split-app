import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AsyncStatus } from '../../enums';
import { Post } from '../posts';
import { fetchWithAuth } from '../../api';
import { FetchThreadsRequest, ThreadInput } from '.';
import { createNewPost, fetchPostList } from '../posts/postSlice';
import { RootState } from '../../store';
import { Thread } from '.';

/**
 * Async thunk for fetching a single thread (public or private) by its ID.
 * If the thread is private, an authentication token is required.
 * @param {{ threadId: string, token?: string }} params - The thread ID and, optionally, the auth token for private threads.
 * @returns {Promise<Thread>} The fetched thread data.
 */
export const fetchSingleThread = createAsyncThunk(
  'threads/fetchSingleThread',
  async (
    { threadId, token }: { threadId: string; token?: string },
    { rejectWithValue },
  ) => {
    try {
      return await fetchWithAuth(`/threads/${threadId}`, {
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
 * Async thunk for fetching a list of threads (public or private) from a forum with pagination.
 * An authentication token can be provided for private threads.
 * @param {{ params: FetchThreadsRequest, token?: string }} args - The pagination parameters, optional forum ID, and optionally, the auth token for private threads.
 * @returns {Promise<Thread[]>} The fetched list of threads.
 */
export const fetchThreadList = createAsyncThunk(
  'threads/fetchThreadList',
  async (
    { params, token }: { params: FetchThreadsRequest; token?: string },
    { rejectWithValue },
  ) => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.set('pageSize', params.pageSize.toString());
      queryParams.set('skipCount', params.skipCount.toString());

      // Add 'forumId' only if it's defined
      if (params.forumId) {
        queryParams.set('forumId', params.forumId);
      }

      return await fetchWithAuth(`/threads?${queryParams.toString()}`, {
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
 * Async thunk for creating a new thread.
 * Requires an authentication token and the initial thread data.
 * @param {{ threadData: ThreadInput, token: string }} params - The initial thread data and the auth token.
 * @returns {Promise<Thread>} The newly created thread data.
 */
export const createNewThread = createAsyncThunk(
  'threads/createNewThread',
  async (
    { threadData, token }: { threadData: ThreadInput; token: string },
    { rejectWithValue },
  ) => {
    try {
      return await fetchWithAuth('/threads', {
        method: 'POST',
        jsonBody: threadData,
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
 * Async thunk for editing an existing thread.
 * Requires an authentication token and the updated thread data.
 * @param {{ threadId: string, updateData: Partial<ThreadInput>, token: string }} params - The thread ID, updated thread data, and the auth token.
 * @returns {Promise<Thread>} The updated thread data.
 */
export const editThread = createAsyncThunk(
  'threads/editThread',
  async (
    {
      threadId,
      updateData,
      token,
    }: { threadId: string; updateData: Partial<ThreadInput>; token: string },
    { rejectWithValue },
  ) => {
    try {
      return await fetchWithAuth(`/threads/${threadId}`, {
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

type ThreadsKeyed = {
  [byId: string]: Thread;
};
interface ThreadState {
  byId: ThreadsKeyed;
}

const initialState: ThreadState = {
  byId: {},
};

const threadSlice = createSlice({
  name: 'threads',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchSingleThread.fulfilled, (state, action) => {
        const thread: Thread = action.payload;
        state.byId[thread.id] = thread;
      })
      .addCase(createNewPost.fulfilled, (state, action) => {
        const latestPostCount: number = action.payload.latestPostCount;
        const threadId: string = action.payload.post.threadId;
        state.byId[threadId].postCount = latestPostCount;
      });
  },
});

export default threadSlice.reducer;
