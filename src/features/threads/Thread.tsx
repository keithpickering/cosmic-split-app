import React, { useEffect, useMemo, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { StyleSheet, FlatList, ListRenderItem } from 'react-native';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { AsyncButton } from '../../components/AsyncButton';
import { fetchSingleThread } from './threadSlice';
import {
  appendActiveThreadPostIds,
  selectActiveThread,
  selectActiveThreadPage,
  selectActiveThreadPosts,
  setActiveThreadPage,
  setActiveThreadPostIds,
} from '../activeThread/activeThreadSlice';
import {
  addPostToState,
  createNewPost,
  fetchPostList,
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
  YStack,
  useWindowDimensions,
  useTheme,
} from 'tamagui';
import { Persona } from '../personas';
import { Account } from '../accounts';
import { fakeAccounts, fakePersonas } from '../../mocks/data';
import { Thread } from '.';
import Pagination from '../../components/Pagination';

const pageSize: number = 10;

type PostComponentProps = {
  post: PostFlat;
  indexInThread: number;
};

export function PostComponent({ post, indexInThread = 0 }: PostComponentProps) {
  const { accountId, personaId, content } = post;

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
          <YStack>
            {!!indexInThread && (
              <View>
                <Text alignSelf="flex-end" fontSize="$1" color="$gray10">
                  #{indexInThread}
                </Text>
              </View>
            )}
            <View>
              <Paragraph>{content}</Paragraph>
            </View>
          </YStack>
        </View>
      </XStack>
    </Card>
  );
}

export type ThreadProps = {
  id: string | undefined;
};

export function ThreadComponent({ id }: ThreadProps) {
  const dispatch = useAppDispatch();
  const thread = useAppSelector(selectActiveThread);
  const activePage = useAppSelector(selectActiveThreadPage);
  const posts = useAppSelector(selectActiveThreadPosts);

  const pageCount = useMemo(
    () => (thread?.postCount ? Math.ceil(thread.postCount / pageSize) : 0),
    [thread?.postCount],
  );

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
      const { payload }: { payload: Thread } = await dispatch(
        fetchSingleThread({ threadId: id }),
      );
      return payload;
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

  /**
   * Load a specific page of posts
   * @param page The desired page to load
   */
  const loadPage = async (page: number) => {
    if (isLoadingMorePosts) {
      return;
    }
    try {
      setLoadingMorePostsTrue();
      const { payload: newPosts }: { payload: PostFlat[] } = await dispatch(
        fetchPostList({
          params: {
            threadId: id,
            pageSize,
            skipCount: pageSize * (page - 1), // page is 1-based index
            sortMethod: SortMethod.DATE,
            sortOrder: SortOrder.ASC,
          },
        }),
      );
      dispatch(setActiveThreadPostIds(newPosts.map(post => post.id)));
      dispatch(setActiveThreadPage(page));
    } catch (error) {
      //
    } finally {
      setLoadingMorePostsFalse();
    }
  };

  /**
   * Load the oldest page of posts
   */
  const loadFirstPage = async () => {
    return loadPage(1);
  };

  /**
   * Load the newest page of posts
   */
  const loadLastPage = async () => {
    return loadPage(pageCount);
  };

  const checkForMorePosts = async () => {
    if (isLoadingMorePosts || !thread?.id) {
      return;
    }
    try {
      setLoadingMorePostsTrue();
      /* await dispatch(
        createNewPost({
          postData: {
            threadId: thread.id,
            accountId: fakeAccounts[0].id,
            personaId: fakePersonas[0].id,
            content: 'fake fake fake',
          },
          token: 'testToken',
        }),
      ); */
      const latestThreadData = await loadThreadData();
      if (!latestThreadData?.postCount) {
        throw new Error();
      }
      const newPostCount = latestThreadData.postCount - posts.length;
      const skipCount = (activePage - 1) * pageSize + posts.length;
      const newPageCount = Math.ceil(latestThreadData.postCount / pageSize);
      const { payload: newPosts }: { payload: PostFlat[] } = await dispatch(
        fetchPostList({
          params: {
            threadId: id,
            pageSize: newPostCount,
            skipCount,
            sortMethod: SortMethod.DATE,
            sortOrder: SortOrder.ASC,
          },
        }),
      );
      // If page count has changed, go to the new page
      if (pageCount !== newPageCount) {
        loadPage(newPageCount);
        return;
      }
      // Otherwise just append to current page
      dispatch(appendActiveThreadPostIds(newPosts.map(post => post.id)));
    } catch (error) {
      //
    } finally {
      setLoadingMorePostsFalse();
    }
  };

  const submitNewPost = async () => {
    if (isSubmittingNewPost || !thread?.id) {
      return;
    }
    try {
      setSubmittingNewPostTrue();
      const { payload } = await dispatch(
        createNewPost({
          postData: {
            threadId: thread.id,
            accountId: fakeAccounts[0].id,
            personaId: fakePersonas[0].id,
            content: newPostContent,
          },
          token: 'testToken',
        }),
      );
      setNewPostContent('');
      await loadPage(payload.pageInThread);
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
      loadFirstPage();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]),
  );

  /**
   * Render a single post
   * @returns {React.JSX.Element|null}
   */
  const renderPost: ListRenderItem<PostFlat> = ({ item, index }) => {
    if (!thread?.postCount) {
      return null;
    }
    return (
      <YStack>
        <PostComponent
          post={item}
          indexInThread={(activePage - 1) * pageSize + index + 1}
        />
        {index === posts.length - 1 && activePage === pageCount && (
          <View alignItems="center">
            <XStack alignItems="center" gap="$3">
              <Text fontSize="$3">
                {isLoadingMorePosts ? 'Loading...' : 'End of posts.'}
              </Text>
              <Button
                theme="active"
                size="$3"
                onPress={checkForMorePosts}
                disabled={isLoadingMorePosts}>
                Check for more
              </Button>
            </XStack>
          </View>
        )}
      </YStack>
    );
  };

  const renderPagination = () => {
    return (
      <Pagination
        pageCount={pageCount}
        activePage={activePage}
        onPageChange={loadPage}
      />
    );
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
        contentContainerStyle={{ padding: 20 }}
        ListHeaderComponent={
          <YStack marginBottom="$6">{renderPagination()}</YStack>
        }
        ListFooterComponent={
          <YStack gap="$6" marginTop="$6">
            {renderPagination()}
            <XStack gap="$2">
              <Input
                flex={1}
                placeholder="What do you think?"
                value={newPostContent}
                onChangeText={setNewPostContent}
              />
              <Button onPress={submitNewPost}>Send</Button>
            </XStack>
          </YStack>
        }
      />
    );
  };

  return (
    <View flex={1}>
      <YStack gap="$6" flex={1}>
        {renderPosts()}
      </YStack>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
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
