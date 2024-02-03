/**
 * Represents a set of themed character attributes a user has chosen for a specific post.
 *
 * @export
 * @type Persona
 * @typedef {Object} Persona
 * @property {string} id - Unique identifier for the persona.
 * @property {string} ownerAccountId - The ID of the account that currently controls this persona.
 * @property {string} displayName - The persona's display name, or username.
 * @property {string} avatar - URL linking to the persona's avatar.
 * @property {string} tagline - A personalized message included in each post from this persona.
 */
export type Persona = {
  id: string;
  ownerAccountId: string;
  displayName: string;
  avatar?: string;
  tagline?: string;
};
