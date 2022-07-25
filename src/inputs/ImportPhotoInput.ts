import { InputType, Field } from 'type-graphql';

@InputType()
export class ImportPhotoInput {
  @Field(() => Date, { nullable: true })
  createdAt?: Date;

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
  regionId?: string;

  @Field(() => String, { nullable: true })
  eventGroupId?: string;

  @Field(() => String, { nullable: true })
  programId?: string;

  @Field(() => String)
  eventId: string;
}
