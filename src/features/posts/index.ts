import { PaginationRequest } from "../../interfaces";

type Badge = {
  id: string;
  name: string;
  thumbnailUrl: string;
}

type Poster = {
  accountId: string;
  personaId: string;
  avatar?: string;
  tagline?: string;
  signature?: string;
  badges?: Badge[];
}

/**
 * Represents a post made by a user.
 * 
 * @export
 * @type Post
 * @typedef {Object} Post
 * @property {string} id - Unique identifier for the post.
 * @property {Poster} poster - Data related to the user who made the post.
 * @property {string} threadId - Identifier for the thread the post belongs to.
 * @property {string} content - The actual content of the post.
 * @property {string} dateCreated - The ISO string date when the post was created.
 * @property {string} dateUpdated - The ISO string date when the post was last updated.
 */
export type Post = {
  id: string;
  poster: Poster;
  threadId: string;
  content: string;
  dateCreated: string;
  dateUpdated: string;
}

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
}