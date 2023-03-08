import { Field, ObjectType } from 'type-graphql';
import { Project } from './Project';

@ObjectType()
export class Kudos {
    @Field(() => String)
    id: string;

    @Field(() => Date)
    createdAt: Date;

    @Field(() => Date)
    updatedAt: Date;

    @Field(() => String)
    username: string;

    @Field(() => Boolean)
    reviewed: boolean;

    @Field(() => Project)
    project: Project;
}
