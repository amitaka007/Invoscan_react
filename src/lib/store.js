"use client";
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import createWebStorage from "redux-persist/lib/storage/createWebStorage";

import { userSlice } from './features/slice/userSlice';

import loadingSlice, { loadingActions } from './features/slice/loading';

const createNoopStorage = () => {
  return {
    getItem(_key) {
      return Promise.resolve(null);
    },
    setItem(_key, value) {
      return Promise.resolve(value);
    },
    removeItem(_key) {
      return Promise.resolve();
    },
  };
};

export const storage = typeof window !== "undefined" ? createWebStorage("local") : createNoopStorage();

// const storage = persistStorage;

const persistConfig = {
  key: "root",
  version: 1,
  storage
};

const reducer = combineReducers({
  [userSlice?.name]: userSlice?.reducer,
  [loadingSlice?.name]: loadingSlice?.reducer
});

const persistedReducer = persistReducer(persistConfig, reducer);

export const makeStore = () => {
  return configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false })
  })
}

const store = makeStore();

export const logout = async() => {
  let persistor = persistStore(store);
  await persistor.purge();
}

export const interceptLoading = (value) => {
  const store = makeStore();
  store.dispatch(loadingActions.setLoading(value));
}