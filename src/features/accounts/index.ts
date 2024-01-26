/**
 * Represents a user account.
 *
 * @export
 * @type Account
 * @typedef {Object} Account
 * @property {string} id - Unique identifier for the account.
 * @property {string} email - The email address associated with the account.
 * @property {string} username - A case-insensitive, alphanumeric identifier for the account.
 * @property {string} dateCreated - The ISO string date when the account was created.
 * @property {string} dateLastVisited - The ISO string date when the user last visited (optional)
 */
export type Account = {
  id: string;
  email: string;
  username: string;
  dateCreated?: string;
  dateLastVisited?: string;
};
