import { ObjectType, Field } from 'type-graphql';
import { JudgingCriteria } from './JudgingCriteria';
import { JudgingPool } from './JudgingPool';

@ObjectType()
export class Judgement {
  /* Metadata */
  @Field(() => String)
  id: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  /* Fields */
  @Field(() => Number)
  value: number;

  @Field(() => String)
  username: string;

  /* Relations */
  @Field(() => JudgingPool)
  judgingPool: JudgingPool;

  @Field(() => JudgingCriteria)
  judgingCriteria: JudgingCriteria
}
