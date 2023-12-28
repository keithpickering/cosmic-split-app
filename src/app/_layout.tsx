import { Stack } from "expo-router";
import React, { useEffect } from 'react';
import { useState } from "react";
import "react-native-url-polyfill/auto";
import { Provider } from 'react-redux';
import { store } from '../store';

async function enableMocking() {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }
 
  const { worker } = await import('../mocks/browser')
 
  // `worker.start()` returns a Promise that resolves
  // once the Service Worker is up and ready to intercept requests.
  return worker.start()
}

export default function Layout() {
  const [isMockingEnabled, setIsMockingEnabled] = useState(false);

  useEffect(() => {
    const handleEnableMocking = async () => {
      await enableMocking();
      setIsMockingEnabled(true);
    }
    handleEnableMocking();
  }, []);

  if (!isMockingEnabled) {
    return null;
  }

  return (
    <Provider store={store}>
      <Stack />
    </Provider>
  );
}
