import {
  Resolver, Query, Arg, registerEnumType, Ctx,
} from 'type-graphql';
import { PrismaClient, ProjectOrderByInput } from '@prisma/client';
import { Inject } from 'typedi';
import { Project } from '../types/Project';
import { ProjectsWhere } from '../inputs/ProjectsWhere';
import { projectsWhereToPrisma, projectsInclude } from '../queryUtils';
import { Context } from '../context';

enum ProjectOrderByArg {
  NEWEST = 'newest',
  OLDEST = 'oldest',
}
registerEnumType(ProjectOrderByArg, { name: 'ProjectOrderByArg' });

@Resolver(Project)
export class ProjectQuery {
  @Inject(() => PrismaClient)
  private readonly prisma : PrismaClient;

  @Query(() => Project, {nullable: true})
  async project(
    @Arg('id', { nullable: true }) id?: string,
    @Arg('slug', { nullable: true }) slug?: string,
  ): Promise<Project> {
    if ((id && slug) || (!id && !slug)) throw new Error('Set either id or slug.');
    return <Promise<Project>><unknown> this.prisma.project.findFirst({
      where: { id, slug: slug ? slug.toLowerCase() : undefined },
      include: projectsInclude,
    });
  }

  @Query(() => [Project])
  async projects(
    @Ctx() { auth }: Context,
    @Arg('skip', () => Number, { nullable: true }) skip?: number,
    @Arg('take', () => Number, { nullable: true }) take?: number,
    @Arg('orderBy', () => ProjectOrderByArg, { nullable: true }) orderBy?: ProjectOrderByArg,
    @Arg('where', () => ProjectsWhere, { nullable: true }) where?: ProjectsWhere,
  ): Promise<Project[]> {
    // Set orderBy on query
    let dbOrderBy: ProjectOrderByInput = { createdAt: 'desc' };
    if (orderBy === ProjectOrderByArg.OLDEST) {
      dbOrderBy = { createdAt: 'asc' };
    }

    return <Promise<Project[]>><unknown> this.prisma.project.findMany({
      skip,
      take: take || 25,
      orderBy: dbOrderBy,
      where: projectsWhereToPrisma(where, auth),
      include: projectsInclude,
    });
  }
}
