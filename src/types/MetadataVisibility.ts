import { registerEnumType } from 'type-graphql';

export enum MetadataVisibility {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
  ADMIN = 'ADMIN',
}

registerEnumType(MetadataVisibility, { name: 'MetadataVisibility' });
