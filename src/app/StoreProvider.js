'use client'
import { useRef } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from "redux-persist/integration/react";

import { makeStore } from '../lib/store';
import { persistStore } from 'redux-persist';

export default function StoreProvider({ children }) {
  // const storeRef = useRef(null);
  // if (!storeRef.current) {
  //   storeRef.current = makeStore();
  // }

  const store = makeStore();
  const persistor = persistStore(store);

  return (
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  )
}