import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import Header from '../components/Header';
import { Counter } from '../features/counter/Counter';
import { Thread } from '../features/threads/Thread';

export const App = () => {
  return (
    <View style={styles.container}>
      <Thread id="threadId1" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
