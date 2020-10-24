import { verify } from 'jsonwebtoken';
import { ExpressContext } from 'apollo-server-express/dist/ApolloServer';
import {
  PrismaClient, MetadataWhereInput, Enumerable, MetadataVisibility as DbMetadataVisibility,
} from '@prisma/client';
import { Container } from 'typedi';
import config from '../config';
import { AuthToken } from './token';
import { Project } from '../types/Project';
import { MetadataVisibility } from '../types/MetadataVisibility';

export class AuthContext {
  token: AuthToken | undefined;

  constructor(token?: AuthToken) {
    this.token = token;
  }

  isEventAdmin(id: string): boolean {
    // If the token has admin perms, but only for one event, compare.
    if (this.adminFlag && this.eventId) {
      return this.eventId === id;
    }

    // There was no event restriction.
    return this.adminFlag;
  }

  isProjectAdmin(project: Partial<Project>): boolean {
    // If there is no token, they can't be an admin!
    if (!this.token) return false;

    // Don't need to check for superadmins
    if (this.adminFlag && !this.eventId) return true;

    // Is the user an admin for this event
    if (project.eventId === this.eventId) return true;

    if (!this.username) return false;
    return project.members?.map((m) => m.username).includes(this.username) || false;
  }

  async isProjectAdminById(id: string): Promise<boolean> {
    const project = await Container.get(PrismaClient).project.findFirst({ where: { id } });
    if (!project) return false;
    return this.isProjectAdmin(<Partial<Project>>project);
  }

  visibilityConditions(project: Project): Enumerable<MetadataWhereInput> {
    if (this.isEventAdmin(project.eventId)) {
      return [
        { visibility: 'PUBLIC' },
        { visibility: 'PRIVATE' },
        { visibility: 'ADMIN' },
      ];
    }

    if (this.isProjectAdmin(project)) {
      return [
        { visibility: 'PUBLIC' },
        { visibility: 'PRIVATE' },
      ];
    }

    return [
      { visibility: 'PUBLIC' },
    ];
  }

  visibilityConditionsInvert(project: Project): Enumerable<MetadataWhereInput> {
    const conditions = this.visibilityConditions(project);
    const excludeConditions = (<MetadataWhereInput[]>conditions).map((elem) => elem.visibility);
    const includeConditions = Object.keys(MetadataVisibility)
      .filter((elem) => !excludeConditions.includes(<DbMetadataVisibility><unknown>elem));

    if (includeConditions.length === 0) return [{ projectId: '__never_match__' }];
    return <Enumerable<MetadataWhereInput>>includeConditions.map((elem) => ({ visibility: elem }));
  }

  canSetVisibility(project: Project, visibility: MetadataVisibility): boolean {
    const allowed = <MetadataVisibility[]> (<MetadataWhereInput[]> this.visibilityConditions(project))
      .map((elem) => elem.visibility);

    return allowed.includes(visibility);
  }

  get username(): string | undefined {
    return this.token?.u;
  }

  get eventId(): string | undefined {
    return this.token?.e;
  }

  get eventGroupId(): string | undefined {
    return this.token?.g;
  }

  get regionId(): string | undefined {
    return this.token?.r;
  }

  get adminFlag(): boolean {
    return this.token?.a || false;
  }
}

export function provideAuthContext({ req }: ExpressContext): AuthContext {
  const header = req.header('X-Showcase-Authorization') || req.header('Authorization');
  if (!header) return new AuthContext();

  const [type, jwt] = header.split(/\s+/g, 2);
  if (type !== 'Bearer') return new AuthContext();

  return new AuthContext(<AuthToken>verify(jwt, config.jwt.secret, { audience: config.jwt.audience }));
}
