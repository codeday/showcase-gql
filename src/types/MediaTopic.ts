import { registerEnumType } from 'type-graphql';

export enum MediaTopic {
  TEAM = 'TEAM',
  DEMO = 'DEMO',
  PRESENTATION = 'PRESENTATION',
}

registerEnumType(MediaTopic, { name: 'MediaTopic' });
