import { http, delay, RequestHandler, HttpResponse } from 'msw';
import { faker } from '@faker-js/faker';
import { Thread } from '../features/threads';
import { API_BASE_URL } from '../api';
import {
  fakeAccounts,
  fakePersonas,
  generateFillerPosts,
  generateFillerThread,
} from './data';
import { Post, PostFlat, PostInput } from '../features/posts';
import mockPostsJson from './data/mockThread.json';

//const mockPosts = generateFillerPosts(undefined, 422);
const mockPosts: Post[] = mockPostsJson;

const addAnotherMockPost = (threadId: string) => {
  const incidentalPersona = faker.helpers.arrayElement(fakePersonas);
  const incidentalAccount = fakeAccounts.find(
    ({ id }) => id === incidentalPersona.ownerAccountId,
  );
  if (!incidentalAccount) {
    return;
  }
  const incidentalNewPost = {
    id: faker.string.uuid(),
    account: incidentalAccount,
    persona: incidentalPersona,
    content: faker.lorem.paragraphs(),
    threadId,
    dateCreated: new Date().toISOString(),
  } as Post;
  mockPosts.push(incidentalNewPost);
};

export const handlers: RequestHandler[] = [
  // Handles a GET request to fetch a single thread
  http.get(`${API_BASE_URL}/threads/:threadId`, async ({ params }) => {
    const { threadId } = params;

    // Mock the possibility that a new post has been added since the last request
    faker.helpers.maybe(() => {
      addAnotherMockPost(threadId.toString());
      faker.helpers.maybe(() => {
        addAnotherMockPost(threadId.toString());
      });
    });

    // Mock response data as per the Thread type
    const mockThread: Thread = generateFillerThread(
      threadId.toString(),
      mockPosts.length,
    );
    if (process.env.NODE_ENV !== 'test') {
      await delay();
    }
    return HttpResponse.json(mockThread);
  }),

  // Handles a GET request to fetch a thread's posts
  http.get(`${API_BASE_URL}/posts`, async ({ request }) => {
    const url = new URL(request.url);
    const threadId = url.searchParams.get('threadId');
    const pageSize = parseInt(url.searchParams.get('pageSize') ?? '10', 10);
    // Cursor is the ID of the last post from the previous page
    const cursor = url.searchParams.get('cursor');
    // Page number will be used if there's no cursor (less precise)
    const pageNumber = parseInt(url.searchParams.get('page') ?? '1', 10);

    let startIndex = 0;
    if (cursor) {
      const cursorIndex = mockPosts.findIndex(post => post.id === cursor);
      startIndex = cursorIndex >= 0 ? cursorIndex + 1 : 0;
    } else if (pageNumber) {
      startIndex = (pageNumber - 1) * pageSize;
    }
    const endIndex = startIndex + pageSize;
    let paginatedPosts = mockPosts.slice(startIndex, endIndex);
    if (threadId) {
      paginatedPosts = paginatedPosts.map(post => ({ ...post, threadId }));
    }
    if (process.env.NODE_ENV !== 'test') {
      await delay();
    }
    return HttpResponse.json(paginatedPosts);
  }),

  // Handles a POST request to add a new post to a thread
  http.post<PostInput, PostInput>(
    `${API_BASE_URL}/posts`,
    async ({ request }) => {
      const { content, threadId, accountId, personaId } = await request.json();
      const account = fakeAccounts.find(({ id }) => id === accountId);
      const persona = fakePersonas.find(({ id }) => id === personaId);
      faker.helpers.maybe(() => {
        addAnotherMockPost(threadId);
        faker.helpers.maybe(() => {
          addAnotherMockPost(threadId);
        });
      });
      const newPost = {
        id: faker.string.uuid(),
        account,
        persona,
        content,
        threadId,
        dateCreated: new Date().toISOString(),
      } as Post;
      mockPosts.push(newPost);
      if (process.env.NODE_ENV !== 'test') {
        await delay();
      }
      const indexInThread = mockPosts.indexOf(newPost);
      const latestPostCount = mockPosts.length;
      return HttpResponse.json({
        post: newPost,
        indexInThread,
        latestPostCount,
        pageInThread: Math.ceil((indexInThread + 1) / 10),
      });
    },
  ),
];
