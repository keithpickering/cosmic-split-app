import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { AsyncButton } from '../../components/AsyncButton';
import { fetchSingleThread, selectActiveThread } from './threadSlice';
import { fetchPostList, selectPostList } from '../posts/postSlice';
import { SortMethod, SortOrder } from '../../enums';
import { Post } from '../posts';

const pageSize: number = 10;

export type ThreadProps = {
  id: string
}

export function Thread({ id }: ThreadProps) {
  const dispatch = useAppDispatch();
  const thread = useAppSelector(selectActiveThread);
  const posts = useAppSelector(selectPostList);

  // On `id` change, fetch thread metadata and initial page of posts
  useEffect(() => {
    // Return if no id
    if (!id) {
      return;
    }
    // Fetch thread metadata
    dispatch(fetchSingleThread({ threadId: id }));
    // Fetch posts
    dispatch(fetchPostList({
      params: {
        threadId: id,
        pageSize,
        skipCount: posts.length,
        sortMethod: SortMethod.DATE,
        sortOrder: SortOrder.ASC,
      }
    }));
  }, [id]);

  const renderPosts = () => {
    return posts?.map(({ id, content, dateCreated, dateUpdated }: Post) => (
      <View key={id}>
        <Text>{content}</Text>
        <Text>{dateCreated}</Text>
      </View>
    ))
  }

  return (
    <View style={styles.root}>
      {renderPosts()}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  value: {
    fontSize: 78,
    paddingHorizontal: 16,
    marginTop: 2,
  },
  button: {
    backgroundColor: 'rgba(112, 76, 182, 0.1)',
    borderRadius: 2,
    paddingLeft: 12,
    paddingRight: 12,
    paddingBottom: 4,
    margin: 2,
  },
  buttonText: {
    color: 'rgb(112, 76, 182)',
    fontSize: 32,
    textAlign: 'center',
  },
  textbox: {
    fontSize: 48,
    padding: 2,
    width: 64,
    textAlign: 'center',
    marginRight: 8,
    borderWidth: 1,
    justifyContent: 'center',
  },
});
