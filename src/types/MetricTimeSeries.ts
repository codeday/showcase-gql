import { ObjectType, Field } from 'type-graphql';

@ObjectType()
export class MetricTimeSeries {
  @Field(() => Date)
  time?: Date;

  @Field(() => Number)
  value?: number;
}
