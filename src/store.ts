import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import threadsReducer from './features/threads/threadSlice';
import activeThreadReducer from './features/activeThread/activeThreadSlice';
import postsReducer from './features/posts/postSlice';
import accountsReducer from './features/accounts/accountSlice';
import personasReducer from './features/personas/personaSlice';

export const store = configureStore({
  reducer: {
    activeThread: activeThreadReducer,
    accounts: accountsReducer,
    personas: personasReducer,
    threads: threadsReducer,
    posts: postsReducer,
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
