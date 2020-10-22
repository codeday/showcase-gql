import { registerEnumType } from 'type-graphql';

export enum MediaTopic {
  TEAM = 'team',
  DEMO = 'demo',
  PRESENTATION = 'presentation',
}

registerEnumType(MediaTopic, { name: 'MediaTopic' });
