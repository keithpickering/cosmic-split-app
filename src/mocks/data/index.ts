import { faker } from '@faker-js/faker';
import { Thread } from '../../features/threads/threadSlice';
import { Post, Poster } from '../../features/posts';
import { getRandomElement } from '../../utils';

export type Account = {
  id: string;
  email: string;
};

export type Persona = {
  id: string;
  ownerAccountId: string;
  displayName: string;
  avatar?: string;
  tagline?: string;
};

export const fakeAccounts: Account[] = [
  {
    id: '1c57b68600552041df60d39d7fa69fc1',
    email: 'opinionbot@yahoo.com',
  },
  {
    id: '709d68522b56b5a66658d2190a72d5bd',
    email: 'readytorumble@hotmail.com',
  },
  {
    id: "ff9020841ffbe9ac51cac536206f37a2",
    email: 'seriousdeerious@gmail.com',
  }
];

export const fakePersonas: Persona[] = [
  {
    id: '3cdca9fe9bebc23dd78170c8018415a4',
    ownerAccountId: '1c57b68600552041df60d39d7fa69fc1',
    displayName: 'Pixuminum',
    avatar: faker.internet.avatar(),
  },
  {
    id: 'd03e7fe8071264badccbc940194b90a7',
    ownerAccountId: '1c57b68600552041df60d39d7fa69fc1',
    displayName: 'Perfect Lurker',
  },
  {
    id: '61850d892c3887373b5cf9bface3cdd7',
    ownerAccountId: '709d68522b56b5a66658d2190a72d5bd',
    displayName: 'Worlds Shortest Escalator',
    avatar: faker.internet.avatar(),
  },
  {
    id: 'aff9d5041ca9a93736a50b4357de4514',
    ownerAccountId: 'ff9020841ffbe9ac51cac536206f37a2',
    displayName: 'Serious Deer',
    avatar: faker.internet.avatar(),
  }
];

export const fakePosters: Poster[] = fakePersonas.map(persona => {
  const account = fakeAccounts.find(({ id }) => id === persona.id);
  return {
    accountId: account?.id || "id",
    personaId: persona.id,
    displayName: persona.displayName,
    avatar: persona.avatar,
    tagline: persona.tagline,
  };
});

export const generatePoster = () => {
  return {
    accountId: faker.string.uuid(),
    personaId: faker.string.uuid(),
    displayName: faker.internet.displayName(),
    avatar: faker.internet.avatar(),
    tagline: faker.person.bio(),
  } as Poster;
};

export const generateFillerPosts = (
  threadId: string | undefined,
  num: number = 10,
) => {
  return Array.from({ length: num }, () => {
    const dateCreated: Date = faker.date.recent();
    return {
      id: faker.string.uuid(),
      threadId: threadId ?? faker.string.uuid(),
      dateCreated: dateCreated.toISOString(),
      dateUpdated: faker.helpers.arrayElement([
        faker.date.soon({ refDate: dateCreated }).toISOString(),
        undefined,
      ]),
      poster: faker.helpers.arrayElement(fakePosters),
      content: faker.lorem.paragraphs(),
    } as Post;
  }).sort((a, b) => parseInt(b.dateCreated, 10) - parseInt(a.dateCreated, 10)); // Sort by date
};

export const generateFillerThread = (
  id: string,
  shouldIncludePosts: boolean = false,
) =>
  ({
    id,
    title: 'Mocked Thread Title',
    originalPosterAccountId: 'accountId1',
    originalPosterPersonaId: 'personaId1',
  } as Thread);
