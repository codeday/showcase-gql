import { InputType, Field } from 'type-graphql';
import { ProjectType } from '../types/ProjectType';

@InputType()
export class CreateProjectInput {
  @Field(() => String)
  name: string;

  @Field(() => ProjectType)
  type: ProjectType;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => String, { nullable: true })
  priorExperience?: string;

  @Field(() => String, { nullable: true })
  codeLink?: string;

  @Field(() => String, { nullable: true })
  viewLink?: string;
}
