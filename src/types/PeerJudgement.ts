import { Field, ObjectType } from 'type-graphql';
import { Project } from './Project';

@ObjectType()
export class PeerJudgement {
    @Field(() => String)
    id: string;

    @Field(() => Date)
    createdAt: Date;

    @Field(() => Date)
    updatedAt: Date;

    @Field(() => String)
    username: string;

    @Field(() => String)
    eventId: string;

    @Field(() => Project)
    project: Project;
}
