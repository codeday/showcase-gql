import { Media } from './types/Media';
import { MediaType } from './types/MediaType';
import { Project } from './types/Project';
import { ProjectsWhere, MediaFilterArg } from './inputs/ProjectsWhere';

function matchMediaFilter(mediaFilter: MediaFilterArg, media: Media[]) {
  const hasImageMedia = media.filter((m) => m.type === MediaType.IMAGE).length > 0;
  const hasVideoMedia = media.filter((m) => m.type === MediaType.VIDEO).length > 0;

  if (mediaFilter === MediaFilterArg.ANY) return media.length > 0;
  if (mediaFilter === MediaFilterArg.IMAGES) return hasImageMedia;
  if (mediaFilter === MediaFilterArg.VIDEOS) return hasVideoMedia;
  if (mediaFilter === MediaFilterArg.BOTH) return hasImageMedia && hasVideoMedia;
  return false;
}

// eslint-disable-next-line sonarjs/cognitive-complexity
export async function matchProject(where: ProjectsWhere, project: Project): Promise<boolean> {
  if (!where) return true;

  if (where.event && where.event !== project.eventId) return false;
  if (where.eventGroup && where.eventGroup !== project.eventGroupId) return false;
  if (where.region && where.region !== project.regionId) return false;
  if (where.program && where.program !== project.programId) return false;
  if (where.user && !project.members.map((u) => u.username).includes(where.user)) return false;
  if (where.featured && !project.featured) return false;
  if (where.awarded && project.awards.length === 0) return false;
  if (where.media && !matchMediaFilter(where.media, await project.media())) return false;

  return true;
}
