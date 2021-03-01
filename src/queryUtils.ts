import { ProjectWhereInput, ProjectInclude } from '@prisma/client';
import { ProjectsWhere, MediaFilterArg } from './inputs/ProjectsWhere';

export function projectsWhereToPrisma(where?: ProjectsWhere): ProjectWhereInput {
  if (!where) return {};

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
  if (where?.program) {
    dbWhere.programId = where.program;
  }
  if (where?.awarded) {
    dbWhere.awards = {
      some: {},
    };
  }
  if (where?.user) {
    dbWhere.members = {
      some: {
        username: where.user,
      },
    };
  }

  if (where?.type) {
    dbWhere.type = where.type;
  }

  if (where?.contains) {
    dbWhere.OR = [
      {
        name: {
          contains: where.contains,
        },
      },
      {
        description: {
          contains: where.contains,
        },
      },
    ];
  }

  // Where media filters
  if (where?.media === MediaFilterArg.ANY) {
    dbWhere.media = {
      some: {},
    };
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

  return dbWhere;
}

export const projectsInclude: ProjectInclude = {
  members: true,
  awards: true,
};
