import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import counterReducer from './features/counter/counterSlice';
import threadReducer from './features/threads/threadSlice';
import postsReducer from './features/posts/postSlice';
import accountsReducer from './features/accounts/accountSlice';
import personasReducer from './features/personas/personaSlice';

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    thread: threadReducer,
    posts: postsReducer,
    accounts: accountsReducer,
    personas: personasReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
