import {
  Resolver, Query, Arg, registerEnumType,
} from 'type-graphql';
import { PrismaClient, ProjectOrderByInput, ProjectWhereInput } from '@prisma/client';
import { Inject } from 'typedi';
import { Project } from '../types/Project';
import { ProjectsWhere, MediaFilterArg } from '../inputs/ProjectsWhere';

enum ProjectOrderByArg {
  NEWEST = 'newest',
  OLDEST = 'oldest',
}
registerEnumType(ProjectOrderByArg, { name: 'ProjectOrderByArg' });

@Resolver(Project)
export class PostResolver {
  @Inject(() => PrismaClient)
  private readonly prisma : PrismaClient;

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

    // Set where on query
    const dbWhere: ProjectWhereInput = {};
    if (where?.event) {
      dbWhere.eventId = where.event;
    }
    if (where?.eventGroup) {
      dbWhere.eventGroupId = where.eventGroup;
    }
    if (where?.region) {
      dbWhere.regionId = where.region;
    }
    if (where?.featured) {
      dbWhere.featured = where.featured;
    }
    if (where?.awarded) {
      dbWhere.awards = {};
    }

    // Where media filters
    if (where?.media === MediaFilterArg.ANY) {
      dbWhere.media = {};
    } else if (where?.media === MediaFilterArg.IMAGES) {
      dbWhere.media = {
        some: {
          type: 'IMAGE',
        },
      };
    } else if (where?.media === MediaFilterArg.VIDEOS) {
      dbWhere.media = {
        some: {
          type: 'VIDEO',
        },
      };
    } else if (where?.media === MediaFilterArg.BOTH) {
      dbWhere.AND = [
        {
          media: {
            some: {
              type: 'IMAGE',
            },
          },
        },
        {
          media: {
            some: {
              type: 'VIDEO',
            },
          },
        },
      ];
    }

    return <Promise<Project[]>><unknown> this.prisma.project.findMany({
      skip,
      take: take || 25,
      orderBy: dbOrderBy,
      where: dbWhere,
    });
  }
}
