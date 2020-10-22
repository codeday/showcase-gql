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

  @Field(() => String)
  description: string;

  @Field(() => String)
  priorExperience: string;

  @Field(() => String)
  codeLink: string;

  @Field(() => String)
  viewLink: string;

  /* Relations */
  @Field(() => String)
  eventId: string;

  @Field(() => String)
  eventGroupId: string;

  @Field(() => String)
  regionId: string;

  @Field(() => [Media])
  media: Media[];

  @Field(() => [Award])
  awards: Award[]

  @Field(() => [Member])
  members: Member[]

  @Field(() => [Metadata])
  metadata: Metadata[]
}
