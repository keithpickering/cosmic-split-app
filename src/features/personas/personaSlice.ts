import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchWithAuth } from '../../api';
import { AsyncStatus } from '../../enums';
import { RootState } from '../../store';
import { ApiPost, Post, Poster } from '../posts';
import { fetchPostList } from '../posts/postSlice';
import { Persona } from '.';

type PersonasKeyed = {
  [data: string]: Persona;
};

interface PersonaState {
  data: PersonasKeyed;
}

const initialState: PersonaState = {
  data: {},
};

const personaSlice = createSlice({
  name: 'personas',
  initialState,
  reducers: {
    resetPersonaData: state => {
      state.data = {};
    },
  },
  extraReducers: builder => {
    builder.addCase(fetchPostList.fulfilled, (state, action) => {
      const posts = action.payload;
      posts.forEach((post: ApiPost) => {
        state.data[post.persona.id] = post.persona;
      });
    });
  },
});

export const { resetPersonaData } = personaSlice.actions;

export default personaSlice.reducer;
