import { InputType, Field, registerEnumType } from 'type-graphql';
import { ReactionType } from '@prisma/client';

registerEnumType(ReactionType, { name: 'ReactionType' });

@InputType()
export class AddReactionsInput {
    @Field(() => ReactionType)
    type: ReactionType;

    @Field(() => Number)
    count: number;
}
