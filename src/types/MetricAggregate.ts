import { ObjectType, Field } from 'type-graphql';
import { Project } from './Project';

@ObjectType()
export class MetricAggregate {
  @Field(() => Number, { nullable: true })
  value?: number;

  /* Relations */
  @Field(() => Project)
  project: Project;
}
