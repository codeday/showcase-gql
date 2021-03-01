import { InputType, Field, registerEnumType } from 'type-graphql';

export enum MediaFilterArg {
  ANY = 'any',
  IMAGES = 'images',
  VIDEOS = 'videos',
  BOTH = 'both',
}
registerEnumType(MediaFilterArg, { name: 'MediaFilterType' });

@InputType()
export class ProjectsWhere {
    @Field(() => String, { nullable: true })
    event?: string;

    @Field(() => String, { nullable: true })
    eventGroup?: string;

    @Field(() => String, { nullable: true })
    region?: string;

    @Field(() => String, { nullable: true })
    program?: string;

    @Field(() => String, { nullable: true })
    user?: string;

    @Field(() => Boolean, { nullable: true })
    featured?: boolean;

    @Field(() => Boolean, { nullable: true })
    awarded?: boolean;

    @Field(() => String, { nullable: true })
    contains?: string;

    @Field(() => MediaFilterArg, { nullable: true })
    media?: MediaFilterArg;
}
