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

  @Field(() => String)
  urlLarge: string;

  @Field(() => String)
  urlMedium: string;

  @Field(() => String)
  urlSmall: string;

  @Field(() => String, { nullable: true })
  thanks?: string;

  @Field(() => String, { nullable: true })
  programId?: string;

  @Field(() => String, { nullable: true })
  eventId?: string;

  @Field(() => String, { nullable: true })
  regionId?: string;

  @Field(() => String, { nullable: true })
  eventGroupId?: string;
}
