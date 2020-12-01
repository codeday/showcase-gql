import {
  Resolver, Query, Arg, registerEnumType,
} from 'type-graphql';
import { PrismaClient, ProjectOrderByInput } from '@prisma/client';
import { Inject } from 'typedi';
import { Project } from '../types/Project';
import { ProjectsWhere } from '../inputs/ProjectsWhere';
import { projectsWhereToPrisma } from '../queryUtils';

enum ProjectOrderByArg {
  NEWEST = 'newest',
  OLDEST = 'oldest',
}
registerEnumType(ProjectOrderByArg, { name: 'ProjectOrderByArg' });

@Resolver(Project)
export class ProjectQuery {
  @Inject(() => PrismaClient)
  private readonly prisma : PrismaClient;

  @Query(() => Project)
  async project(
    @Arg('id') id: string,
  ): Promise<Project> {
    return <Promise<Project>><unknown> this.prisma.project.findFirst({
      where: { id },
      include: {
        members: true,
        media: true,
        awards: true,
        metadata: true,
      },
    });
  }

  @Query(() => [Project])
  async projects(
    @Arg('skip', { nullable: true }) skip?: number,
    @Arg('take', { nullable: true }) take?: number,
    @Arg('orderBy', () => ProjectOrderByArg, { nullable: true }) orderBy?: ProjectOrderByArg,
    @Arg('where', () => ProjectsWhere, { nullable: true }) where?: ProjectsWhere,
  ): Promise<Project[]> {
    // Set orderBy on query
    let dbOrderBy: ProjectOrderByInput = { createdAt: 'desc' };
    if (orderBy === ProjectOrderByArg.OLDEST) {
      dbOrderBy = { createdAt: 'asc' };
    }

    const dbWhere = projectsWhereToPrisma(where);

    return <Promise<Project[]>><unknown> this.prisma.project.findMany({
      skip,
      take: take || 25,
      orderBy: dbOrderBy,
      where: dbWhere,
      include: {
        members: true,
        media: true,
        awards: true,
        metadata: true,
      },
    });
  }
}
