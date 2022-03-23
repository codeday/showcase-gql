import { ProjectWhereInput, ProjectInclude, MediaListRelationFilter } from '@prisma/client';
import { ProjectsWhere, MediaFilterArg } from './inputs/ProjectsWhere';
import { AuthContext } from './auth/AuthContext';
import { MediaTopic } from './types/MediaTopic';

// eslint-disable-next-line sonarjs/cognitive-complexity
export function projectsWhereToPrisma(where?: ProjectsWhere, auth?: AuthContext): ProjectWhereInput {
  if (!where) return {};

  // TODO(@tylermenezes): Refactor to have everything push to dbWhere.AND
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

  const dbAnd: ProjectWhereInput[] = [];

  if (where?.contains) {
    dbAnd.push({ OR: [
      {
        name: {
          contains: where.contains,
          mode: 'insensitive',
        },
      },
      {
        description: {
          contains: where.contains,
          mode: 'insensitive',
        },
      },
    ]});
  }

  const mediaWhere: MediaListRelationFilter[] = [];

  // Where media filters
  if (where?.media === MediaFilterArg.ANY) {
    mediaWhere.push({ some: {} });
  } else if (where?.media === MediaFilterArg.IMAGES) {
    mediaWhere.push({ some: { type: 'IMAGE' } });
  } else if (where?.media === MediaFilterArg.VIDEOS) {
    mediaWhere.push({ some: { type: 'VIDEO' } });
  } else if (where?.media === MediaFilterArg.AUDIOS) {
    mediaWhere.push({ some: { type: 'AUDIO' } });
  } else if (where?.media === MediaFilterArg.BOTH) {
    mediaWhere.push({ some: { type: 'IMAGE' } });
    mediaWhere.push({ some: { OR: [{ type: 'VIDEO' }, { type: 'AUDIO' }] } });
  }

  // Media topic filters
  if (where?.mediaTopic) {
    if (where.mediaTopic === MediaTopic.JUDGES && !auth?.isGlobalAdmin()) {
      // Only select projects with VISIBLE judges' media.
      dbAnd.push(...<ProjectWhereInput[]><unknown>[
        {
          awards: { some: {} },
          media: { some: { topic: MediaTopic.JUDGES } },
        },
        auth?.adminFlag === true && auth?.eventId ? ({
          eventId: auth.eventId,
          media: { some: { topic: MediaTopic.JUDGES } },
        }) : null,
        auth?.adminFlag === true && auth?.eventGroupId ? ({
          eventGroupId: auth.eventGroupId,
          media: { some: { topic: MediaTopic.JUDGES } },
        }) : null,
      ].filter(Boolean));
    } else {
      mediaWhere.push({ some: { topic: where.mediaTopic } });
    }
  }

  if (where?.tags) {
    dbAnd.push({ OR: where.tags.map((t) => ({ tags: { some: { id: t } } })) });
  }

  dbWhere.AND = [
    ...mediaWhere.map((m) => ({ media: m })),
    ...(where.metadata || []).map((m) => ({ metadata: { some: { key: m.key, value: m.value } } })),
    ...dbAnd,
  ];

  return dbWhere;
}

export const projectsInclude: ProjectInclude = {
  members: true,
  awards: true,
  reactionCounts: true,
};
