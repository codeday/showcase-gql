import { InputType, Field } from 'type-graphql';

@InputType()
export class PhotosWhere {
    @Field(() => String, { nullable: true })
    event?: string;

    @Field(() => String, { nullable: true })
    eventGroup?: string;

    @Field(() => String, { nullable: true })
    program?: string;

    @Field(() => String, { nullable: true })
    region?: string;

    @Field(() => Boolean, { nullable: true })
    featured?: boolean;
}
