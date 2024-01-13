import React, { useEffect, useState } from 'react';
import { StyleSheet, View, FlatList, ListRenderItem } from 'react-native';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { AsyncButton } from '../../components/AsyncButton';
import { fetchSingleThread, selectActiveThread } from './threadSlice';
import { fetchPostList, selectPostList } from '../posts/postSlice';
import { SortMethod, SortOrder } from '../../enums';
import { Post } from '../posts';
import { useCallback } from 'react';
import { useBoolean } from 'usehooks-ts';
import { Button, Card, Text, Image } from 'tamagui';

const pageSize: number = 10;

export type ThreadProps = {
  id: string | undefined;
};

export function Thread({ id }: ThreadProps) {
  const dispatch = useAppDispatch();
  const thread = useAppSelector(selectActiveThread);
  const posts = useAppSelector(selectPostList);

  const {
    value: isLoadingThreadData,
    setTrue: setLoadingThreadDataTrue,
    setFalse: setLoadingThreadDataFalse,
  } = useBoolean(false);

  const {
    value: isLoadingMorePosts,
    setTrue: setLoadingMorePostsTrue,
    setFalse: setLoadingMorePostsFalse,
  } = useBoolean(false);

  /**
   * Load the thread metadata
   */
  const loadThreadData = async () => {
    try {
      setLoadingThreadDataTrue();
      if (!id) {
        throw new Error();
      }
      dispatch(fetchSingleThread({ threadId: id }));
    } catch (error) {
      //
    } finally {
      setLoadingThreadDataFalse();
    }
  }

  /**
   * Load the next page of posts
   */
  const loadMorePosts = useCallback(async () => {
    try {
      setLoadingMorePostsTrue();
      const nextPosts: Post[] = await dispatch(
        fetchPostList({
          params: {
            threadId: id,
            pageSize,
            skipCount: posts.length,
            sortMethod: SortMethod.DATE,
            sortOrder: SortOrder.ASC,
          },
        }),
      );
    } catch (error) {
      //
    } finally {
      setLoadingMorePostsFalse();
    }
  }, [
    dispatch,
    id,
    posts.length,
    setLoadingMorePostsFalse,
    setLoadingMorePostsTrue,
  ]);

  // On `id` change, fetch thread metadata and initial page of posts
  useEffect(() => {
    // Return if no id
    if (!id) {
      return;
    }
    // Fetch thread metadata
    loadThreadData();
    // Fetch iniital page of posts
    loadMorePosts();
  }, [dispatch, id]);

  /**
   * Render a single post
   * @returns {React.JSX.Element}
   */
  const renderPost: ListRenderItem<Post> = ({ item }) => {
    console.log(item);
    return (
      <Card bordered padded marginBottom="$6">
        <Text>{item.content}</Text>
      </Card>
    );
  };

  /**
   * Render a list of posts
   * @returns {FlatList}
   */
  const renderPosts = () => {
    return <FlatList data={posts} renderItem={renderPost} />;
  };

  return (
    <View style={styles.root}>
      {renderPosts()}
      <Button onPress={loadMorePosts}>Load more</Button>
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
  post: {
    marginBottom: 20,
  },
  avatar: {
    flex: 1,
    width: 100,
    height: 100,
  },
});
