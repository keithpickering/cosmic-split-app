/**
 * @file Main layout file for Expo Router.
 * @see {@link https://docs.expo.dev/router/layouts/ Layout routes documentation}
 */
import { Stack } from 'expo-router';
import React, { useEffect } from 'react';
import { useState } from 'react';
import { Platform } from 'react-native';
import 'react-native-url-polyfill/auto';
//import '@tamagui/core/reset.css';
import { TamaguiProvider, YStack } from 'tamagui';
import tamaguiConfig from '../../tamagui.config';
import {
  Toast,
  ToastProvider,
  ToastViewport,
  useToastState,
} from '@tamagui/toast';
import { Provider } from 'react-redux';
import { store } from '../store';
import CurrentToast from '../components/CurrentToast';

/**
 * Enable data mocking for local development and testing.
 * @returns {Promise<ServiceWorkerRegistration | undefined>} Resolves
 * once the Service Worker is up and ready to intercept requests.
 * Returns early if mocking is not needed.
 */
async function enableMocking() {
  /**
   * @todo Implement for native platforms as well
   */
  if (Platform.OS !== 'web' || process.env.NODE_ENV !== 'development') {
    return;
  }

  const { worker } = await import('../mocks/browser');

  return worker.start();
}

export default function Layout() {
  const [isMockingEnabled, setIsMockingEnabled] = useState(false);

  useEffect(() => {
    const handleEnableMocking = async () => {
      await enableMocking();
      setIsMockingEnabled(true);
    };
    handleEnableMocking();
  }, []);

  if (!isMockingEnabled) {
    return null;
  }

  return (
    <TamaguiProvider config={tamaguiConfig}>
      <ToastProvider>
        <Provider store={store}>
          <Stack />
          <ToastViewport flexDirection="column" bottom={20} right={20} />
        </Provider>
      </ToastProvider>
    </TamaguiProvider>
  );
}
