import { faker } from "@faker-js/faker";
import { Thread } from "../../features/threads/threadSlice"
import { Post, Poster } from "../../features/posts";

export const generatePoster = () => {
  return {
    accountId: faker.string.uuid(),
    personaId: faker.string.uuid(),
    displayName: faker.internet.displayName(),
    avatar: faker.internet.avatar(),
    tagline: faker.person.bio(),
  } as Poster;
};

export const generateFillerPosts = (threadId: string|undefined, num: number = 10) => {
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
      poster: generatePoster(),
      content: faker.lorem.paragraphs(),
    } as Post;
  }).sort((a, b) => parseInt(b.dateCreated, 10) - parseInt(a.dateCreated)); // Sort by date
};

export const generateFillerThread = (id: string, shouldIncludePosts: boolean = false) => ({
  id,
  "title": "Mocked Thread Title",
  "originalPosterAccountId": "accountId1",
  "originalPosterPersonaId": "personaId1"
} as Thread);
