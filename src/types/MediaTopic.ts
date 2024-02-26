import { registerEnumType } from 'type-graphql';

export enum MediaTopic {
  TEAM = 'TEAM',
  DEMO = 'DEMO',
  ART = 'ART',
  MUSIC = 'MUSIC',
  PRESENTATION = 'PRESENTATION',
  JUDGES = 'JUDGES',
}

registerEnumType(MediaTopic, { name: 'MediaTopic' });
