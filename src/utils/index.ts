export enum AsyncStatus {
  Idle,
  Loading,
  Failed,
}

export function getRandomElement<T>(arr: T[]): T | undefined {
  if (arr.length === 0) {
    return undefined;
  }

  const randomIndex = Math.floor(Math.random() * arr.length);
  return arr[randomIndex];
}

export function pluralize(word: string, count: number = 1): string {
  if (count === 1) {
    return word;
  }
  return word + 's';
}

export function timeAgo(isoDate: string) {
  const date = new Date(isoDate);
  const now = new Date();

  const seconds = Math.round((+now - +date) / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);
  const weeks = Math.round(days / 7);
  const months = Math.round(days / 30); // Approximation
  const years = Math.round(days / 365); // Approximation

  if (seconds < 5) {
    return 'just now';
  } else if (seconds < 60) {
    return 'a few seconds ago';
  } else if (minutes < 60) {
    return `${minutes} ${pluralize('minute', minutes)} ago`;
  } else if (hours < 24) {
    return `${hours} ${pluralize('hour', hours)} ago`;
  } else if (days < 7) {
    return `${days} ${pluralize('day', days)} ago`;
  } else if (weeks < 5) {
    return `${weeks} ${pluralize('week', weeks)} ago`;
  } else if (months < 12) {
    return `${months} ${pluralize('month', months)} ago`;
  } else {
    return `${years} ${pluralize('year', years)} ago`;
  }
}
