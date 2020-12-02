import { InputType, Field } from 'type-graphql';

@InputType()
export class JudgingCriteriaInput {
  @Field(() => String)
  name: string;

  @Field(() => Number)
  weight: number;
}
