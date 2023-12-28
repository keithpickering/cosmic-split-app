import React, { ReactNode } from 'react';
import "react-native-url-polyfill/auto";
import { Provider } from 'react-redux';
import { store } from './src/store';
import { server } from './src/mocks/server';

//server.listen({ onUnhandledRequest: "bypass" });

const MainApp = () => (
  <Provider store={store}>
  </Provider>
);

export default MainApp;
