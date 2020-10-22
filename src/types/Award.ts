import { ObjectType, Field } from 'type-graphql';
import { Project } from './Project';

@ObjectType()
export class Award {
  /* Metadata */
  @Field(() => String)
  id: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  /* Fields */
  @Field(() => String)
  type: string;

  @Field(() => String)
  modifier: string;

  /* Relations */
  @Field(() => Project)
  project: Project;
}
