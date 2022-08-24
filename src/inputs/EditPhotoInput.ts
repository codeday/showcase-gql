import { InputType, Field } from 'type-graphql';

@InputType()
export class EditPhotoInput {
    @Field(() => String, { nullable: true })
    thanks?: string;

    @Field(() => String, { nullable: true })
    programId?: string;

    @Field(() => String, { nullable: true })
    eventId?: string;

    @Field(() => String, { nullable: true })
    regionId?: string;

    @Field(() => String, { nullable: true })
    eventGroupId?: string
}
