import {
  Resolver, Query, Arg,
} from 'type-graphql';
import { PrismaClient } from '@prisma/client';
import { Inject } from 'typedi';
import { MetricAggregate } from '../types/MetricAggregate';
import { ProjectsWhere } from '../inputs/ProjectsWhere';
import { projectsWhereToPrisma } from '../queryUtils';
import { Project } from '../types/Project';

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
        members: true,
        media: true,
        awards: true,
        metadata: true,
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
}
