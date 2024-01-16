import React, { useEffect, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { StyleSheet, FlatList, ListRenderItem } from 'react-native';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { AsyncButton } from '../../components/AsyncButton';
import { fetchSingleThread, selectActiveThread } from './threadSlice';
import {
  createNewPost,
  fetchPostList,
  selectPostList,
} from '../posts/postSlice';
import { SortMethod, SortOrder } from '../../enums';
import { Post, Poster, PostFlat } from '../posts';
import { useCallback } from 'react';
import { useBoolean } from 'usehooks-ts';
import {
  Button,
  Card,
  Text,
  Image,
  View,
  XStack,
  Paragraph,
  Input,
} from 'tamagui';
import { Persona } from '../personas';
import { Account } from '../accounts';
import { fakeAccounts, fakePersonas } from '../../mocks/data';

const pageSize: number = 10;

export function PostComponent({ accountId, personaId, content }: PostFlat) {
  const account: Account = useAppSelector(
    state => state.accounts.byId[accountId],
  );

  const persona: Persona = useAppSelector(
    state => state.personas.byId[personaId],
  );

  return (
    <Card bordered padded marginBottom="$6">
      <XStack gap="$6" flex={1}>
        <View width={200}>
          <Text fontWeight="700">{persona.displayName}</Text>
          <Text>{account.email}</Text>
          {persona.avatar && (
            <Image source={{ uri: persona.avatar, width: 150, height: 150 }} />
          )}
          {!persona.avatar && <Text>No avatar</Text>}
        </View>
        <View flex={1}>
          <Paragraph>{content}</Paragraph>
        </View>
      </XStack>
    </Card>
  );
}

export type ThreadProps = {
  id: string | undefined;
};

export function Thread({ id }: ThreadProps) {
  const dispatch = useAppDispatch();
  const thread = useAppSelector(selectActiveThread);
  const posts = useAppSelector(selectPostList);

  const [newPostContent, setNewPostContent] = useState('');

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

  const {
    value: isSubmittingNewPost,
    setTrue: setSubmittingNewPostTrue,
    setFalse: setSubmittingNewPostFalse,
  } = useBoolean(false);

  /**
   * Load the thread metadata
   */
  const loadThreadData = async () => {
    if (isLoadingThreadData) {
      return;
    }
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
  };

  /**
   * Load the next page of posts
   */
  const loadMorePosts = async () => {
    if (isLoadingMorePosts) {
      return;
    }
    try {
      setLoadingMorePostsTrue();
      await dispatch(
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
  };

  const submitNewPost = async () => {
    if (isSubmittingNewPost) {
      return;
    }
    try {
      setSubmittingNewPostTrue();
      await dispatch(
        createNewPost({
          postData: {
            threadId: 'test',
            accountId: fakeAccounts[0].id,
            personaId: fakePersonas[0].id,
            content: newPostContent,
          },
          token: 'testToken',
        }),
      );
    } catch (error) {
      //
    } finally {
      setSubmittingNewPostFalse();
    }
  };

  // On focus, fetch thread metadata and initial page of posts
  useFocusEffect(
    useCallback(() => {
      // Return if no id
      if (!id) {
        return;
      }
      // Fetch thread metadata
      loadThreadData();
      // Fetch initial page of posts
      loadMorePosts();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]),
  );

  /**
   * Render a single post
   * @returns {React.JSX.Element}
   */
  const renderPost: ListRenderItem<PostFlat> = ({ item }) => {
    return <PostComponent {...item} />;
  };

  /**
   * Render a list of posts
   * @returns {FlatList}
   */
  const renderPosts = () => {
    return (
      <FlatList
        data={posts}
        keyExtractor={(item: PostFlat) => item.id}
        renderItem={renderPost}
      />
    );
  };

  return (
    <View padding="$6" paddingHorizontal="$10">
      {renderPosts()}
      <Button onPress={loadMorePosts}>Load more</Button>
      <XStack>
        <Input
          flex={1}
          placeholder="What do you think?"
          value={newPostContent}
          onChangeText={setNewPostContent}
        />
        <Button onPress={submitNewPost}>Send</Button>
      </XStack>
    </View>
  );
}

const styles = StyleSheet.create({
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
