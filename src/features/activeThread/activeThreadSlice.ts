import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AsyncStatus } from '../../enums';
import { Post, PostFlat } from '../posts';
import { fetchWithAuth } from '../../api';
import { FetchThreadsRequest, ThreadInput } from '../threads';
import { createNewPost, fetchPostList } from '../posts/postSlice';
import { RootState } from '../../store';
import { Thread } from '../threads';
import { fetchSingleThread } from '../threads/threadSlice';

type ActiveThreadState = {
  status: AsyncStatus;
  threadId?: string;
  activePage: number;
  postIds: string[];
  selectedPostIds: string[];
};

const initialState: ActiveThreadState = {
  status: AsyncStatus.IDLE,
  threadId: undefined,
  activePage: 1,
  postIds: [],
  selectedPostIds: [],
};

const threadSlice = createSlice({
  name: 'threads',
  initialState,
  reducers: {
    clearActiveThread: state => {
      state.threadId = undefined;
      state.activePage = 1;
      state.postIds = [];
    },
    setActiveThreadPostIds: (state, action) => {
      state.postIds = action.payload;
    },
    appendActiveThreadPostIds: (state, action) => {
      state.postIds.push(...action.payload);
    },
    setActiveThreadPage: (state, action) => {
      state.activePage = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      // Handling fetchSingleThread
      .addCase(fetchSingleThread.pending, state => {
        state.status = AsyncStatus.LOADING;
      })
      .addCase(fetchSingleThread.fulfilled, (state, action) => {
        state.threadId = action.payload.id;
        state.status = AsyncStatus.SUCCEEDED;
      })
      .addCase(fetchSingleThread.rejected, state => {
        state.status = AsyncStatus.FAILED;
      });
  },
});

export const {
  clearActiveThread,
  setActiveThreadPostIds,
  appendActiveThreadPostIds,
  setActiveThreadPage,
} = threadSlice.actions;

export const selectActiveThread = (state: RootState) => {
  const activeThreadId = state.activeThread.threadId;
  if (!activeThreadId) {
    return undefined;
  }
  return state.threads.byId[activeThreadId];
};

export const selectActiveThreadPage = (state: RootState) => {
  return state.activeThread.activePage;
};

/**
 * Select the list of posts (current page)
 */
export const selectActiveThreadPosts = (state: RootState) => {
  return state.activeThread.postIds.map(id => state.posts.byId[id]);
};

export default threadSlice.reducer;
