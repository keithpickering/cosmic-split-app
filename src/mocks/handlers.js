import { http, HttpResponse, RequestHandler } from 'msw';
import { Post } from '../features/posts';
import { Thread } from '../features/threads';

export const handlers: RequestHandler[] = [
  // Handles a GET request to fetch a single thread
  http.get('/api/threads/:threadId', ({ params }) => {
    const { threadId } = params;

    // Mock response data as per the Thread type
    const mockThread: Thread = {
      id: threadId.toString(),
      title: 'Mocked Thread Title',
      originalPosterAccountId: "accountId1",
      originalPosterPersonaId: "personaId1",
    };

    return HttpResponse.json(mockThread);
  }),

  // Handles a GET request to fetch a thread's posts
 // http.get('/api/posts?threadId=:threadId')
];