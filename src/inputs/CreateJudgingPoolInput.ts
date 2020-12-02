import { InputType, Field } from 'type-graphql';
import { JudgingCriteriaInput } from './JudgingCriteriaInput';

@InputType()
export class CreateJudgingPoolInput {
  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  eventId?: string;

  @Field(() => String, { nullable: true })
  regionId?: string;

  @Field(() => String, { nullable: true })
  eventGroupId?: string;

  @Field(() => String, { nullable: true })
  programId?: string;

  @Field(() => [JudgingCriteriaInput])
  judgingCriteria: JudgingCriteriaInput[]
}
