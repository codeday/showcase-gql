import { registerEnumType } from 'type-graphql';

export enum MediaTopic {
  TEAM = 'TEAM',
  DEMO = 'DEMO',
  PRESENTATION = 'PRESENTATION',
  JUDGES = 'JUDGES',
}

registerEnumType(MediaTopic, { name: 'MediaTopic' });
