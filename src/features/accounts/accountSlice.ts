import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchWithAuth } from '../../api';
import { AsyncStatus } from '../../enums';
import { RootState } from '../../store';
import { Post, Poster } from '../posts';
import { fetchPostList } from '../posts/postSlice';
import { Account } from '.';

type AccountsKeyed = {
  [byId: string]: Account;
};

interface AccountState {
  byId: AccountsKeyed;
}

const initialState: AccountState = {
  byId: {},
};

const accountSlice = createSlice({
  name: 'accounts',
  initialState,
  reducers: {
    resetAccountData: state => {
      state.byId = {};
    },
  },
  extraReducers: builder => {
    builder.addCase(fetchPostList.fulfilled, (state, action) => {
      const posts = action.payload;
      posts.forEach((post: Post) => {
        state.byId[post.account.id] = post.account;
      });
    });
  },
});

export const { resetAccountData } = accountSlice.actions;

export default accountSlice.reducer;
