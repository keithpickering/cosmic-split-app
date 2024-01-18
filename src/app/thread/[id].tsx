import React from 'react';
import { Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ThreadComponent as Thread } from '../../features/threads/Thread';

export default function ThreadPage() {
  const { id } = useLocalSearchParams();
  return <Thread id={id?.toString()} />;
}
