import { registerEnumType } from 'type-graphql';

export enum MediaType {
  VIDEO = 'VIDEO',
  IMAGE = 'IMAGE',
  AUDIO = 'AUDIO',
}

registerEnumType(MediaType, { name: 'MediaType' });
