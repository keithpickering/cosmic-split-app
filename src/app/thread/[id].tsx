import React from 'react';
import { Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import ThreadComponent from '../../features/threads/Thread';
import CurrentToast from '../../components/CurrentToast';

export type ThreadSearchParams = {
  id: string;
  page?: string;
};

export default function ThreadPage() {
  const { id, page } = useLocalSearchParams<ThreadSearchParams>();
  return (
    <>
      <ThreadComponent
        id={id?.toString()}
        initialPage={page ? parseInt(page.toString(), 10) : 0}
      />
      <CurrentToast />
    </>
  );
}
