import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchWithAuth } from '../../api';
import { AsyncStatus } from '../../enums';
import { RootState } from '../../store';
import { ApiPost, Post, Poster } from '../posts';
import { fetchPostList } from '../posts/postSlice';
import { Account } from '.';

type AccountsKeyed = {
  [data: string]: Account;
};

interface AccountState {
  data: AccountsKeyed;
}

const initialState: AccountState = {
  data: {},
};

const accountSlice = createSlice({
  name: 'accounts',
  initialState,
  reducers: {
    resetAccountData: state => {
      state.data = {};
    },
  },
  extraReducers: builder => {
    builder.addCase(fetchPostList.fulfilled, (state, action) => {
      const posts = action.payload;
      posts.forEach((post: ApiPost) => {
        state.data[post.account.id] = post.account;
      });
    });
  },
});

export const { resetAccountData } = accountSlice.actions;

export default accountSlice.reducer;
