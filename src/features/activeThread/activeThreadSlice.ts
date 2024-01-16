import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AsyncStatus } from '../../enums';
import { Post, PostFlat } from '../posts';
import { fetchWithAuth } from '../../api';
import { FetchThreadsRequest, ThreadInput } from '../threads';
import { createNewPost, fetchPostList } from '../posts/postSlice';
import { RootState } from '../../store';
import { Thread } from '../threads';
import { fetchSingleThread } from '../threads/threadSlice';

interface ActiveThreadState {
  status: AsyncStatus;
  threadId?: string;
  activePage: number;
  postIds: string[];
}

const initialState: ActiveThreadState = {
  status: AsyncStatus.IDLE,
  threadId: undefined,
  activePage: 1,
  postIds: [],
};

const threadSlice = createSlice({
  name: 'threads',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      // Handling fetchSingleThread
      .addCase(fetchSingleThread.pending, state => {
        state.threadId = undefined;
        state.status = AsyncStatus.LOADING;
        state.activePage = 1;
      })
      .addCase(fetchSingleThread.fulfilled, (state, action) => {
        state.threadId = action.payload.id;
        state.status = AsyncStatus.SUCCEEDED;
      })
      .addCase(fetchSingleThread.rejected, state => {
        state.status = AsyncStatus.FAILED;
      })
      .addCase(fetchPostList.fulfilled, (state, action) => {
        // Don't bother if no active thread
        if (!state.threadId) {
          return;
        }
        const { pageSize, skipCount } = action.meta.arg.params;
        // Set active page
        state.activePage = Math.ceil(skipCount / pageSize + 1);
        // Add fetched posts to the data store
        state.postIds = action.payload.map((post: Post) => post.id);
      });
  },
});

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
