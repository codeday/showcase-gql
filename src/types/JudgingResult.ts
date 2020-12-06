import { ObjectType, Field } from 'type-graphql';
import { Project } from './Project';
import { JudgingResultSubValue } from './JudgingResultSubValue';

@ObjectType()
export class JudgingResult {
  @Field(() => Number)
  value: number;

  @Field(() => Number)
  count: number;

  @Field(() => [JudgingResultSubValue])
  subScores: JudgingResultSubValue[]

  @Field(() => Project)
  project: Project;
}
