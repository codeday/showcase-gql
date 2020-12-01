import { ObjectType, Field } from 'type-graphql';
import { Project } from './Project';
import { Member } from './Member';

@ObjectType()
export class Metric {
  /* Metadata */
  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  /* Fields */
  @Field(() => String)
  name: string;

  @Field(() => Number)
  value: number;

  /* Relations */
  @Field(() => Project)
  project: Project;

  @Field(() => Member)
  member: Member;
}
