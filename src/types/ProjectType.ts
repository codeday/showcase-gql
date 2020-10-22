import { registerEnumType } from 'type-graphql';

export enum ProjectType {
  APP = 'app',
  GAME = 'game',
  VR = 'vr',
  HARDWARE = 'hardware',
  WEBSITE = 'website',
  LIBRARY = 'library',
  BOT = 'bot',
  OTHER = 'other',
}

registerEnumType(ProjectType, { name: 'ProjectType' });
