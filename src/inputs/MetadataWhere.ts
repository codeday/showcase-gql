import { InputType, Field } from 'type-graphql';

@InputType()
export class MetadataWhere {
  @Field(() => String)
  key: string

  @Field(() => String)
  value: string
}
