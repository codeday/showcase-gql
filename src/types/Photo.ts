import {
  ObjectType, Field,
} from 'type-graphql';

@ObjectType()
export class Photo {
  @Field(() => String)
  id: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => String)
  url: string;

  @Field(() => String, { nullable: true })
  urlLarge?: string;

  @Field(() => String, { nullable: true })
  urlMedium?: string;

  @Field(() => String, { nullable: true })
  urlSmall?: string;

  @Field(() => String, { nullable: true })
  thanks?: string;

  @Field(() => String)
  programId: string;

  @Field(() => String)
  eventId: string;

  @Field(() => String, { nullable: true })
  regionId?: string;

  @Field(() => String, { nullable: true })
  eventGroupId?: string;
}
