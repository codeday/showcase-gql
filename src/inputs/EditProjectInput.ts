import { InputType, Field } from 'type-graphql';
import { ProjectType } from '../types/ProjectType';

@InputType()
export class EditProjectInput {
  @Field(() => String, { nullable: true })
  name?: string;

  @Field(() => ProjectType, { nullable: true })
  type?: ProjectType;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => String, { nullable: true })
  priorExperience?: string;

  @Field(() => String, { nullable: true })
  challengesEncountered?: string;

  @Field(() => String, { nullable: true })
  codeLink?: string;

  @Field(() => String, { nullable: true })
  viewLink?: string;
}
