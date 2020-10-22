import { registerEnumType } from 'type-graphql';

export enum MediaType {
  VIDEO = 'VIDEO',
  IMAGE = 'IMAGE',
}

registerEnumType(MediaType, { name: 'MediaType' });
