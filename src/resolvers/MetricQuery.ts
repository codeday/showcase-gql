import {
  Resolver, Query, Arg,
} from 'type-graphql';
import { PrismaClient } from '@prisma/client';
import { Inject } from 'typedi';
import { MetricAggregate } from '../types/MetricAggregate';
import { MetricTimeSeries } from '../types/MetricTimeSeries';
import { ProjectsWhere } from '../inputs/ProjectsWhere';
import { projectsWhereToPrisma, projectsInclude } from '../queryUtils';
import { Project } from '../types/Project';

const PROJECT_READY_DESCRIPTION_MIN_LENGTH = 140;
const PROJECT_READY_EXPERIENCE_MIN_LENGTH = 15;

@Resolver(MetricAggregate)
export class MetricSummaryQuery {
  @Inject(() => PrismaClient)
  private readonly prisma : PrismaClient;

  @Query(() => [MetricAggregate])
  async averageMemberRecentResponses(
    @Arg('name') name: string,
    @Arg('projectWhere', () => ProjectsWhere, { nullable: true }) where?: ProjectsWhere,
  ): Promise<MetricAggregate[]> {
    const allProjects = await this.prisma.project.findMany({
      where: projectsWhereToPrisma(where),
      include: {
        ...projectsInclude,
        metrics: {
          where: { name },
          orderBy: [{ createdAt: 'desc' }],
          distinct: ['username'],
        },
      },
    });

    return allProjects.map(({ metrics, ...project }): MetricAggregate => {
      const value = metrics.reduce((accum, metric) => accum + metric.value, 0) / metrics.length;
      return {
        value: typeof value === 'number' && !Number.isNaN(value) ? value : undefined,
        project: <Project><unknown>project,
      };
    });
  }

  @Query(() => Number)
  async presentationReadyPercent(
    @Arg('where', () => ProjectsWhere) where?: ProjectsWhere,
  ): Promise<number> {
    const allProjects = await this.prisma.project.findMany({
      where: projectsWhereToPrisma(where),
      include: {
        media: true,
      },
      orderBy: [{ createdAt: 'asc' }],
    });

    const presentationReadyProjects = allProjects.filter((p) => {
      let checklist = 0;
      if (p.media.filter(({ type }) => type === 'IMAGE').length > 0) checklist += 1;
      if (p.media.filter(({ type }) => type === 'VIDEO').length > 0) checklist += 1;
      if (p.description && p.description.length >= PROJECT_READY_DESCRIPTION_MIN_LENGTH) checklist += 1;
      if (p.priorExperience && p.priorExperience.length >= PROJECT_READY_EXPERIENCE_MIN_LENGTH) checklist += 1;

      return checklist >= 2;
    });

    return Math.round((presentationReadyProjects.length / allProjects.length) * 100) / 100;
  }

  @Query(() => [MetricTimeSeries])
  async projectsOverTime(
    @Arg('where', () => ProjectsWhere) where?: ProjectsWhere,
  ): Promise<MetricTimeSeries[]> {
    const allProjects = await this.prisma.project.findMany({
      where: projectsWhereToPrisma(where),
      orderBy: [{ createdAt: 'asc' }],
    });

    return allProjects.map((proj, j): MetricTimeSeries => ({
      time: proj.createdAt,
      value: j,
    }));
  }

  @Query(() => [MetricTimeSeries])
  async membersOverTime(
    @Arg('where', () => ProjectsWhere) where?: ProjectsWhere,
  ): Promise<MetricTimeSeries[]> {
    const allProjects = await this.prisma.project.findMany({
      where: projectsWhereToPrisma(where),
      include: {
        members: true,
      },
    });

    const allMembers = allProjects.map((p) => p.members)
      .reduce((accum, members) => [...accum, ...members], [])
      .sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1));

    return allMembers.map((member, j): MetricTimeSeries => ({
      time: member.createdAt,
      value: j,
    }));
  }
}
