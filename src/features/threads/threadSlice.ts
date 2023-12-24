import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit';
import { AsyncStatus } from '../../enums';
import { Post } from '../posts';
import { fetchWithAuth } from '../../api'; 
import { FetchThreadsRequest, ThreadInput } from '.';
import { fetchPostList } from '../posts/postSlice';
import { RootState } from '../../store';

/**
 * Represents a thread, or a collection of posts.
 * 
 * @export
 * @type Thread
 * @typedef {Object} Thread
 * @property {string} id - Unique identifier for the thread.
 * @property {string} originalPosterAccountId - Identifier for the account of the original poster.
 * @property {string} originalPosterPersonaId - Identifier for the persona of the original poster.
 * @property {string} title - The title of the thread.
 * @property {Post[]} [posts] - An array of posts that belong to the thread.
 */
export type Thread = {
  id: string;
  originalPosterAccountId: string;
  originalPosterPersonaId: string;
  title: string;
  posts?: Post[];
}

/**
 * Async thunk for fetching a single thread (public or private) by its ID.
 * If the thread is private, an authentication token is required.
 * @param {{ threadId: string, token?: string }} params - The thread ID and, optionally, the auth token for private threads.
 * @returns {Promise<Thread>} The fetched thread data.
 */
export const fetchSingleThread = createAsyncThunk(
  'threads/fetchSingleThread',
  async ({ threadId, token }: { threadId: string; token?: string }, { rejectWithValue }) => {
    try {
      return {
        id: "threadId1",
        title: "Test thread 1",
        originalPosterAccountId: "accountId",
        originalPosterPersonaId: "personaId",
      } as Thread
      return await fetchWithAuth(`/api/threads/${threadId}`, { method: 'GET', token });
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  }
);

/**
 * Async thunk for fetching a list of threads (public or private) from a forum with pagination.
 * An authentication token can be provided for private threads.
 * @param {{ params: FetchThreadsRequest, token?: string }} args - The pagination parameters, optional forum ID, and optionally, the auth token for private threads.
 * @returns {Promise<Thread[]>} The fetched list of threads.
 */
export const fetchThreadList = createAsyncThunk(
  'threads/fetchThreadList',
  async ({ params, token }: { params: FetchThreadsRequest; token?: string }, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.set('pageSize', params.pageSize.toString());
      queryParams.set('skipCount', params.skipCount.toString());

      // Add 'forumId' only if it's defined
      if (params.forumId) {
        queryParams.set('forumId', params.forumId);
      }

      return await fetchWithAuth(`/api/threads?${queryParams.toString()}`, { method: 'GET', token });
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  }
);

/**
 * Async thunk for creating a new thread.
 * Requires an authentication token and the initial thread data.
 * @param {{ threadData: ThreadInput, token: string }} params - The initial thread data and the auth token.
 * @returns {Promise<Thread>} The newly created thread data.
 */
export const createNewThread = createAsyncThunk(
  'threads/createNewThread',
  async ({ threadData, token }: { threadData: ThreadInput; token: string }, { rejectWithValue }) => {
    try {
      return await fetchWithAuth('/api/threads', {
        method: 'POST',
        jsonBody: threadData,
        token,
      });
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  }
);

/**
 * Async thunk for editing an existing thread.
 * Requires an authentication token and the updated thread data.
 * @param {{ threadId: string, updateData: Partial<ThreadInput>, token: string }} params - The thread ID, updated thread data, and the auth token.
 * @returns {Promise<Thread>} The updated thread data.
 */
export const editThread = createAsyncThunk(
  'threads/editThread',
  async ({ threadId, updateData, token }: { threadId: string; updateData: Partial<ThreadInput>; token: string }, { rejectWithValue }) => {
    try {
      return await fetchWithAuth(`/api/threads/${threadId}`, {
        method: 'PATCH',
        jsonBody: updateData,
        token,
      });
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  }
);

interface ThreadState {
  status: AsyncStatus;
  activeThread: Thread | null;
}

const initialState: ThreadState = {
  status: AsyncStatus.IDLE,
  activeThread: null,
};

const threadSlice = createSlice({
  name: 'thread',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Handling fetchSingleThread
      .addCase(fetchSingleThread.pending, (state) => {
        state.activeThread = null;
        state.status = AsyncStatus.LOADING;
      })
      .addCase(fetchSingleThread.fulfilled, (state, action) => {
        state.activeThread = action.payload;
        state.status = AsyncStatus.SUCCEEDED;
      })
      .addCase(fetchSingleThread.rejected, (state) => {
        state.status = AsyncStatus.FAILED;
      })
  },
});

export const selectActiveThread = (state: RootState) => {
  return state.thread;
}

export default threadSlice.reducer;
