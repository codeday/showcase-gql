import {
  ObjectType, Field, Ctx, Arg,
} from 'type-graphql';
import { PrismaClient } from '@prisma/client';
import { Container } from 'typedi';
import { Context } from '../context';
import { MediaFilterArg, ProjectsWhere } from '../inputs/ProjectsWhere';
import { JudgingCriteria } from './JudgingCriteria';
import { Project } from './Project';
import { JudgingResult } from './JudgingResult';
import { JudgingResultSubValue } from './JudgingResultSubValue';
import { projectsWhereToPrisma, projectsInclude } from '../queryUtils';

@ObjectType()
export class JudgingPool {
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

  /* Relations */
  @Field(() => String, { nullable: true })
  eventId: string;

  @Field(() => String, { nullable: true })
  programId: string;

  @Field(() => String, { nullable: true })
  eventGroupId?: string;

  @Field(() => String, { nullable: true })
  regionId?: string;

  @Field(() => [JudgingCriteria])
  judgingCriteria: JudgingCriteria[]

  private getProjectsWhere() {
    const where = new ProjectsWhere();
    where.event = this.eventId;
    where.eventGroup = this.eventGroupId;
    where.program = this.programId;
    where.region = this.regionId;
    where.media = MediaFilterArg.ANY;
    return where;
  }

  @Field(() => [Project])
  async projects(
    @Ctx() { auth }: Context,
      @Arg('take', () => Number, { nullable: true, defaultValue: 25 }) take = 25,
      @Arg('needsJudging', () => Boolean, { nullable: true, defaultValue: false }) needsJudging = false,
  ): Promise<Project[]> {
    if (needsJudging && !auth?.judgingPoolId) {
      throw new Error('You must have a judge token to see projects needing judging.');
    }

    const allProjects = await Container.get(PrismaClient).project.findMany({
      where: {
        ...projectsWhereToPrisma(this.getProjectsWhere(), auth),
        members: { none: { username: auth.username } },
      },
      include: {
        ...projectsInclude,
        judgements: {
          where: {
            username: auth.username,
            judgingPool: { id: this.id },
          },
        },
      },
      take: 500,
    });

    if (!needsJudging) {
      return <Project[]><unknown> allProjects
        .sort(() => (Math.random() > 0.5 ? 1 : -1))
        .slice(0, take || 25);
    }
    return <Project[]><unknown> allProjects
      .filter((p) => p.judgements.length < this.judgingCriteria.length)
      .sort(() => (Math.random() > 0.5 ? 1 : -1))
      .slice(0, take || 25);
  }

  @Field(() => [JudgingResult])
  async results(
    @Ctx() { auth }: Context,
  ): Promise<JudgingResult[]> {
    if (!auth?.judgingPoolCanViewResults) {
      throw new Error('You cannot see results.');
    }

    const allProjects = await Container.get(PrismaClient).project.findMany({
      where: {
        ...projectsWhereToPrisma(this.getProjectsWhere(), auth),
      },
      include: {
        ...projectsInclude,
        judgements: {
          where: { judgingPool: { id: this.id } },
          include: {
            judgingCriteria: true,
          },
        },
      },
      take: 500,
    });

    return allProjects.map((p) => {
      const elementScores = this.judgingCriteria.map((criteria): JudgingResultSubValue => {
        const matchingJudgements = p.judgements.filter((j) => j.judgingCriteria.id === criteria.id);
        const sum = matchingJudgements.reduce((accum, j) => accum + j.value, 0);
        const result = new JudgingResultSubValue();
        result.judgingCriteria = criteria;
        result.value = sum / matchingJudgements.length;
        result.count = matchingJudgements.length;
        if (typeof result.value !== 'number' || Number.isNaN(result.value)) result.value = 0;
        return result;
      });

      const sumWeighted = elementScores.reduce((accum, e) => accum + (e.value * e.judgingCriteria.weight), 0);
      const sumWeights = elementScores.reduce((accum, e) => accum + e.judgingCriteria.weight, 0);
      const score = sumWeighted / sumWeights;

      const result = new JudgingResult();
      result.project = <Project><unknown> p;
      result.subScores = elementScores;
      result.value = score;
      result.count = Math.max(...elementScores.map((e) => e.count));
      if (typeof result.value !== 'number' || Number.isNaN(result.value)) result.value = 0;

      return result;
    }).sort((a, b) => b.value - a.value);
  }
}
