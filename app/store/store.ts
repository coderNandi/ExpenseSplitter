import { configureStore } from '@reduxjs/toolkit';
import groupsReducer from './slices/groupsSlice';
import personReducer from './slices/personSlice';

const store = configureStore({
  reducer: {
    groups: groupsReducer,
    persons: personReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
