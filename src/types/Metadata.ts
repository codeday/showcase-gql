import { ObjectType, Field } from 'type-graphql';
import { Project } from './Project';
import { MetadataVisibility } from './MetadataVisibility';

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

  @Field(() => MetadataVisibility)
  visibility: MetadataVisibility;

  /* Relations */
  @Field(() => Project)
  project: Project;
}
