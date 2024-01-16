import { PaginationRequest } from '../../interfaces';
import { Post } from '../posts';

/**
 * Represents a thread, or a collection of posts.
 *
 * @export
 * @type Thread
 * @typedef {Object} Thread
 * @property {string} id - Unique identifier for the thread.
 * @property {string} originalPosterAccountId - Identifier for the account of the original poster.
 * @property {string} originalPosterPersonaId - Identifier for the persona of the original poster.
 * @property {string} title - The title of the thread.
 */
export type Thread = {
  id: string;
  originalPosterAccountId: string;
  originalPosterPersonaId: string;
  title: string;
  postCount?: number;
};

/**
 * Represents the input data required for creating or updating a thread.
 *
 * @export
 * @type ThreadInput
 * @typedef {Object} ThreadInput
 * @property {string} title - The title of the thread.
 * @property {string} accountId - Identifier for the account creating the thread.
 * @property {string} personaId - Identifier for the persona creating the thread.
 * @property {string} [content] - Optional initial post content.
 */
export type ThreadInput = {
  title: string;
  accountId: string;
  personaId: string;
  content?: string;
};

/**
 * Represents a request to fetch threads, including pagination parameters and optional forum identifier.
 * Extends from `PaginationRequest` to include common pagination fields.
 *
 * @export
 * @interface FetchThreadsRequest
 * @extends {PaginationRequest}
 * @typedef {Object} FetchThreadsRequest
 * @property {string} [forumId] - Optional identifier for the forum to fetch threads from.
 */
export interface FetchThreadsRequest extends PaginationRequest {
  forumId?: string;
}
