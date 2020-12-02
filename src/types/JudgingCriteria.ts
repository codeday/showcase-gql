import { ObjectType, Field } from 'type-graphql';
import { JudgingPool } from './JudgingPool';

@ObjectType()
export class JudgingCriteria {
  /* Metadata */
  @Field(() => String)
  id: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  /* Fields */
  @Field(() => String)
  name: string;

  @Field(() => Number)
  weight: number;

  /* Relations */
  @Field(() => JudgingPool)
  judgingPool: JudgingPool;
}
