import { ObjectType, Field } from 'type-graphql';
import { ReactionType } from '@prisma/client';

@ObjectType()
export class ReactionCount {
  @Field(() => ReactionType)
  type: string;

  @Field(() => Number)
  count: string;
}
