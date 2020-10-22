import { registerEnumType } from 'type-graphql';

export enum ResizeStrategy {
  CLAMP = 'clamp',
  CLIP = 'clip',
  CROP = 'crop',
  FACEAREA = 'facearea',
  FILL = 'fill',
  FILLMAX = 'fillmax',
  MAX = 'max',
  MIN = 'min',
  SCALE = 'scale',
}

registerEnumType(ResizeStrategy, { name: 'ResizeStrategy' });
