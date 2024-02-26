import { uniqueNamesGenerator, adjectives, colors, animals } from 'unique-names-generator';

export function generatePhrase() {
  return uniqueNamesGenerator({
    dictionaries: [adjectives, colors, animals],
    separator: '-',
    length: 3,
  });
}