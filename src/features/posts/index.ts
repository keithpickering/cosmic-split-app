import { PaginationRequest } from '../../interfaces';
import { Persona } from '../personas';
import { Account } from '../accounts';

/**
 * Represents a post made by a user.
 *
 * @export
 * @type Post
 * @typedef {Object} Post
 * @property {string} id - Unique identifier for the post.
 * @property {Account} account - The poster's account data.
 * @property {Persona} persona - The poster's persona data.
 * @property {string} threadId - Identifier for the thread the post belongs to.
 * @property {string} content - The actual content of the post.
 * @property {string} dateCreated - The ISO string date when the post was created.
 * @property {string} dateUpdated - The ISO string date when the post was last updated (optional)
 */
export type Post = {
  id: string;
  account: Account;
  persona: Persona;
  threadId: string;
  content: string;
  dateCreated: string;
  dateUpdated?: string;
};

/**
 * Represents a post made by a user, flattened so that the account and persona are referenced by ID.
 *
 * @export
 * @type Post
 * @typedef {Object} Post
 * @property {string} id - Unique identifier for the post.
 * @property {string} accountId - The poster's account ID.
 * @property {string} personaId - The poster's persona ID.
 * @property {string} threadId - Identifier for the thread the post belongs to.
 * @property {string} content - The actual content of the post.
 * @property {string} dateCreated - The ISO string date when the post was created.
 * @property {string} dateUpdated - The ISO string date when the post was last updated (optional)
 */
export type PostFlat = {
  id: string;
  accountId: string;
  personaId: string;
  threadId: string;
  content: string;
  dateCreated: string;
  dateUpdated?: string;
};

/**
 * Represents a request to fetch posts, including pagination parameters.
 * Extends from `PaginationRequest` to include common pagination fields.
 *
 * @export
 * @interface FetchPostsRequest
 * @extends {PaginationRequest}
 * @typedef {Object} FetchPostsRequest
 * @property {string} [threadId] - Optional identifier for the thread to fetch posts from.
 */
export interface FetchPostsRequest extends PaginationRequest {
  threadId?: string;
}

/**
 * Structure for input data required to create a new post.
 *
 * @export
 * @type PostInput
 * @typedef {Object} PostInput
 * @property {string} threadId - Identifier for the thread where the post will be created.
 * @property {string} accountId - Identifier for the account creating the post.
 * @property {string} personaId - Identifier for the persona associated with the post.
 * @property {string} content - Content of the post to be created.
 */
export type PostInput = {
  threadId: string;
  accountId: string;
  personaId: string;
  content: string;
};
