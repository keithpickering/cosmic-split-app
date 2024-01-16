import { http, delay, RequestHandler, HttpResponse } from 'msw';
import { faker } from '@faker-js/faker';
import { Thread } from '../features/threads';
import { API_BASE_URL } from '../api';
import {
  fakeAccounts,
  fakePersonas,
  fakePosters,
  generateFillerPosts,
  generateFillerThread,
} from './data';
import { Post, PostFlat, PostInput } from '../features/posts';

const mockThreadId = faker.string.uuid();
const mockPosts = generateFillerPosts(undefined, 25);
console.log(mockPosts);

export const handlers: RequestHandler[] = [
  // Handles a GET request to fetch a single thread
  http.get(`${API_BASE_URL}/threads/:threadId`, ({ params }) => {
    const { threadId } = params;

    // Mock response data as per the Thread type
    const mockThread: Thread = generateFillerThread(threadId.toString());

    return HttpResponse.json(mockThread);
  }),

  // Handles a GET request to fetch a thread's posts
  http.get(`${API_BASE_URL}/posts`, async ({ request }) => {
    const url = new URL(request.url);
    const threadId = url.searchParams.get('threadId');
    const pageSize = url.searchParams.get('pageSize') ?? '';
    const skipCount = url.searchParams.get('skipCount') ?? '';

    const start = parseInt(skipCount, 10);
    const end = start + parseInt(pageSize, 10);
    let paginatedPosts = mockPosts.slice(start, end);
    if (threadId) {
      paginatedPosts = paginatedPosts.map(post => ({ ...post, threadId }));
    }
    if (process.env.NODE_ENV !== 'test') {
      await delay(1000);
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
      return HttpResponse.json({
        id: faker.string.uuid(),
        account,
        persona,
        content,
        threadId,
        dateCreated: new Date().toISOString(),
      } as Post);
    },
  ),
];
