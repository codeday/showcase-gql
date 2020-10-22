import { registerEnumType } from 'type-graphql';

export enum MediaType {
  VIDEO = 'video',
  IMAGE = 'image',
}

registerEnumType(MediaType, { name: 'MediaType' });
