import { ObjectType, Field } from 'type-graphql';
import { Project } from './Project';

@ObjectType()
export class Metadata {
  /* Metadata */
  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  /* Fields */
  @Field(() => String)
  key: string;

  @Field(() => String)
  value: string;

  /* Relations */
  @Field(() => Project)
  project: Project;
}
