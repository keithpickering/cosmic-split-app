import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useFocusEffect, router } from 'expo-router';
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
import { Post, PostFlat } from '../posts';
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
import { Toast, useToastController, useToastState } from '@tamagui/toast';
import { Persona } from '../personas';
import { Account } from '../accounts';
import { fakeAccounts, fakePersonas } from '../../mocks/data';
import { Thread } from '.';
import Pagination from '../../components/Pagination';
import { timeAgo } from '../../utils';
import PostComponent from '../posts/Post';

const pageSize: number = 10;

export type ThreadProps = {
  id: string | undefined;
  initialPage: number;
};

export default function ThreadComponent({ id, initialPage }: ThreadProps) {
  const dispatch = useAppDispatch();

  const toast = useToastController();
  const currentToast = useToastState();
  console.log(currentToast);

  // The current active thread
  const thread = useAppSelector(selectActiveThread);

  // The current active page in the thread
  const activePage = useAppSelector(selectActiveThreadPage);

  // The current list of posts (for the active page)
  const posts = useAppSelector(selectActiveThreadPosts);

  // The current number of pages in the thread,
  // according to the post count and page size.
  const pageCount = useMemo<number>(
    () => (thread?.postCount ? Math.ceil(thread.postCount / pageSize) : 0),
    [thread?.postCount],
  );

  // The FlatList containing the posts.
  // This ref can be used to scroll to certain posts, etc.
  const postListRef = useRef<FlatList<PostFlat>>();

  // A ref storing the cutoff points for each page as they are loaded.
  // This should make pagination reliable if posts are deleted during the session.
  const pageCursors = useRef<{ [page: number]: string | null }>({});

  // State value to store the ID of a thread that has been loaded.
  const [mountedThreadId, setMountedThreadId] = useState<string | null>(null);

  // State value to store a new post the user plans to add to the thread.
  const [newPostContent, setNewPostContent] = useState<string>('');

  // Boolean representing thread metadata loading state
  const {
    value: isLoadingThreadData,
    setTrue: setLoadingThreadDataTrue,
    setFalse: setLoadingThreadDataFalse,
  } = useBoolean(false);

  // Boolean representing loading state for a new page of posts
  const {
    value: isLoadingMorePosts,
    setTrue: setLoadingMorePostsTrue,
    setFalse: setLoadingMorePostsFalse,
  } = useBoolean(false);

  // Boolean representing new post creation loading state
  const {
    value: isSubmittingNewPost,
    setTrue: setSubmittingNewPostTrue,
    setFalse: setSubmittingNewPostFalse,
  } = useBoolean(false);

  /**
   * Loads the metadata for the current thread.
   * It fetches thread data based on the provided thread ID.
   * If the thread data is already loading, it returns early.
   * @returns {Promise<Thread | undefined>} The thread data payload if successful, or undefined if an error occurs.
   */
  const loadThreadData = useCallback(async () => {
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
      toast.show('Failed to load thread metadata.', { variant: 'error' });
    } finally {
      setLoadingThreadDataFalse();
    }
  }, [
    id,
    dispatch,
    isLoadingThreadData,
    setLoadingThreadDataTrue,
    setLoadingThreadDataFalse,
    toast,
  ]);

  /**
   * Loads a specific page of posts in the thread.
   * It calculates the cursor based on the provided page number and fetches the posts.
   * If the page is already loading, it returns early to avoid duplicate requests.
   * @param {number} page - The page number to load.
   * @returns {Promise<void>} A promise that resolves when the posts have been loaded.
   */
  const loadPage = useCallback(
    async (page: number = 1) => {
      if (isLoadingMorePosts) {
        return;
      }
      try {
        setLoadingMorePostsTrue();

        // Throw an error if the page is invalid
        if (page < 1) {
          throw new Error('Invalid page.');
        }

        // Determine the cursor (starting post ID) for the requested page, if it exists
        const cursor = pageCursors.current[page - 1] || null;

        // Fetch the posts using the cursor
        const { payload: newPosts } = await dispatch(
          fetchPostList({
            params: {
              threadId: id,
              pageSize,
              cursor: cursor || null,
              page, // Send the page number in case there is no cursor for this page
              sortMethod: SortMethod.DATE,
              sortOrder: SortOrder.ASC,
            },
          }),
        );

        // Store the cursor for the next page
        if (newPosts.length > 0) {
          pageCursors.current[page] = newPosts[newPosts.length - 1].id;
        } else {
          throw new Error('Page returned zero posts.');
        }

        // Update post and page values in the store
        dispatch(setActiveThreadPostIds(newPosts.map((post: Post) => post.id)));
        dispatch(setActiveThreadPage(page));

        // Scroll to the top of the new page
        if (postListRef.current) {
          postListRef.current.scrollToOffset({ animated: true, offset: 0 });
        }

        // Update the page param in the router
        router.setParams({ page: page.toString() });
      } catch (error) {
        toast.show(`Couldn't find page ${page}.`, { variant: 'error' });
      } finally {
        setLoadingMorePostsFalse();
      }
    },
    [
      dispatch,
      id,
      isLoadingMorePosts,
      setLoadingMorePostsFalse,
      setLoadingMorePostsTrue,
      toast,
    ],
  );

  /**
   * Loads the thread metadata and initial page of posts.
   */
  const loadThreadAndInitialPosts = useCallback(async () => {
    // Return if no id
    if (!id) {
      return;
    }
    // Return if we've already set up this thread
    if (id === mountedThreadId) {
      return;
    }
    // Set active thread ID so this doesn't happen again unless the ID changes
    setMountedThreadId(id);
    try {
      // Fetch thread metadata
      await loadThreadData();
      // Fetch initial page of posts
      await loadPage(initialPage || 1);
    } catch (error) {
      toast.show('Failed to load thread.', { variant: 'error' });
    }
  }, [id, mountedThreadId, loadThreadData, loadPage, initialPage, toast]);

  // Effect to automatically call loadThreadAndInitialPosts when focused
  useFocusEffect(
    useCallback(() => {
      loadThreadAndInitialPosts();
    }, [loadThreadAndInitialPosts]),
  );

  /**
   * Checks for and loads more posts if available.
   * It calculates whether there are new posts since the last loaded page and fetches them.
   * This method is used to dynamically load new posts without reloading the entire page.
   * @returns {Promise<void>} A promise that resolves when the check is complete and any new posts are loaded.
   */
  const checkForMorePosts = async () => {
    if (isLoadingMorePosts || !thread?.id) {
      return;
    }
    try {
      setLoadingMorePostsTrue();
      // Fetch thread data to get the latest post count
      const latestThreadData = await loadThreadData();
      if (!latestThreadData?.postCount) {
        throw new Error();
      }
      // Get the ID of the last post in the current posts array as the cursor
      const lastPostId = posts.length > 0 ? posts[posts.length - 1].id : null;
      // Determine the total number of posts already accounted for in the thread
      const accountedPostCount = (activePage - 1) * pageSize + posts.length;
      // Calculate the number of new posts
      const newPostCount = latestThreadData.postCount - accountedPostCount;
      if (!lastPostId || newPostCount <= 0) {
        // If there are no new posts, we don't need to do anything else here
        // toast.show("You're viewing the latest posts.");
        return;
      }
      // Determine the latest number of pages in the thread
      const newPageCount = Math.ceil(latestThreadData.postCount / pageSize);
      if (pageCount !== newPageCount) {
        // If page count has changed, go to the new last page, which will load the posts automatically
        pageCursors.current[activePage] = null;
        loadPage(newPageCount);
        return;
      }
      // Fetch only the latest posts and add them to the current page using the cursor
      const { payload: newPosts }: { payload: PostFlat[] } = await dispatch(
        fetchPostList({
          params: {
            threadId: id,
            pageSize: newPostCount,
            cursor: lastPostId || null,
            sortMethod: SortMethod.DATE,
            sortOrder: SortOrder.ASC,
          },
        }),
      );
      const newLastPostId = newPosts[newPosts.length - 1]?.id;
      if (!newLastPostId) {
        return;
      }
      dispatch(appendActiveThreadPostIds(newPosts.map(post => post.id)));
      pageCursors.current[activePage] = newLastPostId;
    } catch (error) {
      toast.show('Failed to check for posts.', { variant: 'error' });
    } finally {
      setLoadingMorePostsFalse();
    }
  };

  /**
   * Submits a new post to the thread.
   * It creates a new post with the current content and user details, then reloads the appropriate page.
   * If a post submission is already in progress, it returns early.
   * @returns {Promise<void>} A promise that resolves when the new post has been submitted and the thread is updated.
   */
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
      pageCursors.current[activePage] = null;
      await loadPage(payload.pageInThread);
    } catch (error) {
      toast.show('Failed to submit post.', { variant: 'error' });
    } finally {
      setSubmittingNewPostFalse();
    }
  };

  /**
   * Renders a single post item.
   * It returns a `YStack` component containing the post details.
   * If the thread has no posts, it returns null.
   * @param {ListRenderItem<PostFlat>} param0 - The post item and its index in the list.
   * @returns {React.JSX.Element|null} The rendered post component or null if no posts are available.
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

  /**
   * Renders the pagination controls for the thread.
   * It uses the `Pagination` component with the current page count and active page.
   * @returns {React.JSX.Element} The rendered pagination component.
   */
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
   * Renders a list of posts in the thread.
   * It returns a `FlatList` component containing all the posts with header and footer components.
   * @returns {FlatList<PostFlat>} The rendered list of posts.
   */
  const renderPosts = () => {
    return (
      <FlatList
        ref={postListRef}
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
