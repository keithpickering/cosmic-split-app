import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchWithAuth } from '../../api';
import { AsyncStatus } from '../../enums';
import { RootState } from '../../store';
import { Post, Poster } from '../posts';
import { fetchPostList } from '../posts/postSlice';
import { Persona } from '.';

type PersonasKeyed = {
  [byId: string]: Persona;
};

interface PersonaState {
  byId: PersonasKeyed;
}

const initialState: PersonaState = {
  byId: {},
};

const personaSlice = createSlice({
  name: 'personas',
  initialState,
  reducers: {
    resetPersonaData: state => {
      state.byId = {};
    },
  },
  extraReducers: builder => {
    builder.addCase(fetchPostList.fulfilled, (state, action) => {
      const posts = action.payload;
      posts.forEach((post: Post) => {
        state.byId[post.persona.id] = post.persona;
      });
    });
  },
});

export const { resetPersonaData } = personaSlice.actions;

export default personaSlice.reducer;
