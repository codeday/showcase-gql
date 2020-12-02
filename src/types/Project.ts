import {
  ObjectType, Field, Ctx, Arg,
} from 'type-graphql';
import { PrismaClient } from '@prisma/client';
import { Container } from 'typedi';
import { ProjectType } from './ProjectType';
import { Media } from './Media';
import { Award } from './Award';
import { Member } from './Member';
import { Metadata } from './Metadata';
import { Judgement } from './Judgement';
import { Context } from '../context';

@ObjectType()
export class Project {
  /* Metadata */
  @Field(() => String)
  id: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  /* Fields */
  @Field(() => String)
  name: string;

  @Field(() => Boolean)
  featured: boolean;

  @Field(() => ProjectType)
  type: ProjectType;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => String, { nullable: true })
  priorExperience?: string;

  @Field(() => String, { nullable: true })
  codeLink?: string;

  @Field(() => String, { nullable: true })
  viewLink?: string;

  /* Relations */
  @Field(() => String)
  eventId: string;

  @Field(() => String)
  programId: string;

  @Field(() => String, { nullable: true })
  eventGroupId?: string;

  @Field(() => String, { nullable: true })
  regionId?: string;

  @Field(() => [Media], { nullable: true })
  media: Media[];

  @Field(() => [Award], { nullable: true })
  awards: Award[]

  @Field(() => [Member], { nullable: true })
  members: Member[]

  @Field(() => [Judgement], { nullable: true })
  async userJudgement(
    @Ctx() { auth }: Context,
  ): Promise<Judgement[] | undefined> {
    if (!auth.judgingPoolId) throw new Error('You are not a judge.');
    if (!auth.isJudgeForProject(this)) throw new Error('You are not a judge for this project.');

    return <Promise<Judgement[]>><unknown> Container.get(PrismaClient).judgement.findMany({
      where: {
        judgingPool: { id: auth.judgingPoolId },
        project: { id: this.id },
        username: auth.username,
      },
      include: {
        judgingCriteria: {
          include: {
            judgingPool: true,
          },
        },
        judgingPool: true,
      },
      distinct: ['judgingCriteriaId'],
      orderBy: { createdAt: 'desc' },
    });
  }

  @Field(() => [Metadata], { nullable: true })
  async metadata(
    @Ctx() { auth }: Context,
  ): Promise<Metadata[]> {
    return <Promise<Metadata[]>><unknown> Container.get(PrismaClient).metadata.findMany({
      where: {
        projectId: this.id,
        OR: auth.visibilityConditions(this),
      },
    });
  }

  @Field(() => String, { nullable: true })
  async metadataValue(
    @Ctx() { auth }: Context,
    @Arg('key') key: string,
  ): Promise<string> {
    const metadata = <Metadata><unknown> await Container.get(PrismaClient).metadata.findFirst({
      where: {
        projectId: this.id,
        key,
        OR: auth.visibilityConditions(this),
      },
    });
    return metadata?.value;
  }

  @Field(() => Boolean, { name: 'canEdit' })
  async canEdit(
    @Ctx() { auth }: Context,
  ): Promise<boolean> {
    return auth.isProjectAdmin(this);
  }

  @Field(() => Boolean, { name: 'canAdmin' })
  async canAdmin(
    @Ctx() { auth }: Context,
  ): Promise<boolean> {
    return auth.isEventAdmin(this.eventId);
  }
}
