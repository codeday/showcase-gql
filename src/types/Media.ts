import { ObjectType, Field, Arg } from 'type-graphql';
import { MediaType } from './MediaType';
import { MediaTopic } from './MediaTopic';
import { ResizeStrategy } from './ResizeStrategy';
import { Project } from './Project';

@ObjectType()
export class Media {
  /* Metadata */
  @Field(() => String)
  id: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  /* Fields */
  @Field(() => MediaType)
  type: MediaType;

  @Field(() => MediaTopic)
  topic: MediaTopic;

  image: string;

  @Field(() => String, { name: 'image' })
  makeImageUrl(
    @Arg('width', { nullable: true }) width: number,
    @Arg('height', { nullable: true }) height: number,
    @Arg('strategy', () => ResizeStrategy, { nullable: true }) strategy: ResizeStrategy,
    @Arg('fillBlur', { nullable: true }) fillBlur: boolean,
  ): string {
    const resizeString = [
      width && `w=${width}`,
      height && `h=${height}`,
      strategy && `fit=${strategy}`,
      fillBlur && `fill=blur`,
    ].filter((e) => e).join(';');

    return this.image.replace('/o/', `/${resizeString}/`);
  }

  @Field(() => String, { nullable: true })
  stream: string;

  @Field(() => String, { nullable: true })
  download: string;

  /* Relations */
  @Field(() => Project)
  project: Project;
}
