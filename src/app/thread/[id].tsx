import React from 'react';
import { Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import ThreadComponent from '../../features/threads/Thread';

export default function ThreadPage() {
  const { id } = useLocalSearchParams();
  return <ThreadComponent id={id?.toString()} />;
}
