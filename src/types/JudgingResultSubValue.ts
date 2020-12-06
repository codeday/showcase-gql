import { ObjectType, Field } from 'type-graphql';
import { JudgingCriteria } from './JudgingCriteria';

@ObjectType()
export class JudgingResultSubValue {
  @Field(() => JudgingCriteria)
  judgingCriteria: JudgingCriteria;

  @Field(() => Number)
  value: number;

  @Field(() => Number)
  count: number;
}
