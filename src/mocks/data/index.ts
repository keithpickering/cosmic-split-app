import { faker } from '@faker-js/faker';
import { Thread } from '../../features/threads';
import { Post, PostFlat, Poster } from '../../features/posts';
import { Account } from '../../features/accounts';
import { Persona } from '../../features/personas';

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
    id: 'ff9020841ffbe9ac51cac536206f37a2',
    email: 'seriousdeerious@gmail.com',
  },
  {
    id: '6c30cd3b855d4a65f63db65956d3a598',
    email: 'dguy1337@outlook.com',
  },
];

export const fakePersonas: Persona[] = [
  {
    id: '3cdca9fe9bebc23dd78170c8018415a4',
    ownerAccountId: '1c57b68600552041df60d39d7fa69fc1',
    displayName: 'Pixuminum',
    avatar: '/default-avatars/robochad.jpg',
  },
  {
    id: 'd03e7fe8071264badccbc940194b90a7',
    ownerAccountId: '1c57b68600552041df60d39d7fa69fc1',
    displayName: 'Perfect Lurker',
  },
  {
    id: '61850d892c3887373b5cf9bface3cdd7',
    ownerAccountId: '709d68522b56b5a66658d2190a72d5bd',
    displayName: "World's Shortest Escalator",
    avatar: '/default-avatars/shortestescalator.jpg',
  },
  {
    id: 'aff9d5041ca9a93736a50b4357de4514',
    ownerAccountId: 'ff9020841ffbe9ac51cac536206f37a2',
    displayName: 'Serious Deer',
    avatar: '/default-avatars/seriousdeer.jpg',
  },
  {
    id: 'd108c1afb6a252b57538683480e4efd8',
    ownerAccountId: '6c30cd3b855d4a65f63db65956d3a598',
    displayName: 'D-Guy',
    avatar: '/default-avatars/dguy.jpg',
  },
  {
    id: '32f8a53245b2e51be086dd2207d67397',
    ownerAccountId: '709d68522b56b5a66658d2190a72d5bd',
    displayName: 'Artie Smartie',
    avatar: '/default-avatars/artiesmartie.jpg',
  },
];

export const fakePosters: { account: Account | undefined; persona: Persona }[] =
  fakePersonas.map(persona => {
    const account = fakeAccounts.find(
      ({ id }) => id === persona.ownerAccountId,
    );
    return {
      account,
      persona,
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
    const poster = faker.helpers.arrayElement(fakePosters);
    return {
      id: faker.string.uuid(),
      threadId: threadId ?? faker.string.uuid(),
      dateCreated: dateCreated.toISOString(),
      dateUpdated: faker.helpers.arrayElement([
        faker.date.soon({ refDate: dateCreated }).toISOString(),
        undefined,
      ]),
      account: poster.account,
      persona: poster.persona,
      content: faker.lorem.paragraphs(),
    } as Post;
  }).sort((a, b) => parseInt(b.dateCreated, 10) - parseInt(a.dateCreated, 10)); // Sort by date
};

export const generateFillerThread = (id: string, postCount: number = 25) =>
  ({
    id,
    title: 'Mocked Thread Title',
    originalPosterAccountId: fakeAccounts[0].id,
    originalPosterPersonaId: fakePersonas[0].id,
    postCount,
  } as Thread);
