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

const mockPosts = generateFillerPosts(undefined, 100);

export const handlers: RequestHandler[] = [
  // Handles a GET request to fetch a single thread
  http.get(`${API_BASE_URL}/threads/:threadId`, ({ params }) => {
    const { threadId } = params;

    // Mock response data as per the Thread type
    const mockThread: Thread = generateFillerThread(
      threadId.toString(),
      mockPosts.length,
    );

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
        const incidentalPersona = faker.helpers.arrayElement(fakePersonas);
        const incidentalAccount = fakeAccounts.find(
          ({ id }) => id === incidentalPersona.ownerAccountId,
        );
        const incidentalNewPost = {
          id: faker.string.uuid(),
          account: incidentalAccount,
          persona: incidentalPersona,
          content: 'Dude I made this post too fast for you',
          threadId,
          dateCreated: new Date().toISOString(),
        } as Post;
        mockPosts.push(incidentalNewPost);
        faker.helpers.maybe(() => {
          const incidentalPersona2 = faker.helpers.arrayElement(fakePersonas);
          const incidentalAccount2 = fakeAccounts.find(
            ({ id }) => id === incidentalPersona2.ownerAccountId,
          );
          const incidentalNewPost2 = {
            id: faker.string.uuid(),
            account: incidentalAccount2,
            persona: incidentalPersona2,
            content: 'Me too!',
            threadId,
            dateCreated: new Date().toISOString(),
          } as Post;
          mockPosts.push(incidentalNewPost2);
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
