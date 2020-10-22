import { ObjectType, Field } from 'type-graphql';
import { ProjectType } from './ProjectType';
import { Media } from './Media';
import { Award } from './Award';
import { Member } from './Member';
import { Metadata } from './Metadata';

@ObjectType()
export class Project {
  /* Metadata */

  @Field(() => String)
  id: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  /* Fields */
  @Field(() => String)
  name: string;

  @Field(() => Boolean)
  featured: boolean;

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

  /* Relations */
  @Field(() => String)
  eventId: string;

  @Field(() => String, { nullable: true })
  eventGroupId?: string;

  @Field(() => String, { nullable: true })
  regionId?: string;

  @Field(() => [Media], { nullable: true })
  media: Media[];

  @Field(() => [Award], { nullable: true })
  awards: Award[]

  @Field(() => [Member], { nullable: true })
  members: Member[]

  @Field(() => [Metadata], { nullable: true })
  metadata: Metadata[]
}
