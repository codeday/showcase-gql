import { registerEnumType } from 'type-graphql';

export enum ProjectType {
  APP = 'APP',
  GAME = 'GAME',
  VR = 'VR',
  HARDWARE = 'HARDWARE',
  WEBSITE = 'WEBSITE',
  LIBRARY = 'LIBRARY',
  BOT = 'BOT',
  OTHER = 'OTHER',
}

registerEnumType(ProjectType, { name: 'ProjectType' });
