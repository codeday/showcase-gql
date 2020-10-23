import { ObjectType, Field } from 'type-graphql';
import { Project } from './Project';

@ObjectType()
export class Member {
  /* Metadata */
  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  /* Fields */
  @Field(() => String)
  username: string;

  /* Relations */
  @Field(() => Project)
  project: Project;
}
