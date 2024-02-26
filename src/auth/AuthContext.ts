import { verify } from 'jsonwebtoken';
import { ExpressContext } from 'apollo-server-express/dist/ApolloServer';
import {
  PrismaClient, MetadataWhereInput, Enumerable, MetadataVisibility as DbMetadataVisibility,
} from '@prisma/client';
import { Container } from 'typedi';
import config from '../config';
import { AuthToken } from './AuthToken';
import { Project } from '../types/Project';
import { MetadataVisibility } from '../types/MetadataVisibility';

export class AuthContext {
  token: AuthToken | undefined;

  constructor(token?: AuthToken) {
    this.token = token;
  }

  isGlobalAdmin(): boolean {
    return this.adminFlag && !this.eventId;
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
    return project.members?.map((m) => m.username.toLowerCase()).includes(this.username.toLowerCase()) || false;
  }

  async isEventParticipant(eventId: string): Promise<boolean> {
    return await Container.get(PrismaClient).project.count({
      where: {
        eventId,
        members: {
          some: {
            username: { equals: this.username, mode: 'insensitive' },
          },
        },
      },
    }) > 0;
  }

  async isProjectAdminById(id: string): Promise<boolean> {
    const project = await Container.get(PrismaClient).project.findFirst({ where: { id }, include: { members: true } });
    if (!project) return false;
    return this.isProjectAdmin(<Partial<Project>><unknown>project);
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

  async isJudgeForProject(project: Project): Promise<boolean> {
    if (!this.token?.j) return false;

    const judgingPool = await Container.get(PrismaClient).judgingPool.findFirst({ where: { id: this.token.j } });
    if (!judgingPool) return false;

    if (judgingPool.eventId && project.eventId !== judgingPool.eventId) return false;
    if (judgingPool.eventGroupId && project.eventGroupId !== judgingPool.eventGroupId) return false;
    if (judgingPool.regionId && project.regionId !== judgingPool.regionId) return false;
    if (judgingPool.programId && project.programId !== judgingPool.programId) return false;

    return true;
  }

  canSetVisibility(project: Project, visibility: MetadataVisibility): boolean {
    const allowed = <MetadataVisibility[]> (<MetadataWhereInput[]> this.visibilityConditions(project))
      .map((elem) => elem.visibility);

    return allowed.includes(visibility);
  }

  get username(): string | undefined {
    return this.token?.u || this.token?.sub;
  }

  get eventId(): string | undefined {
    return this.token?.e;
  }

  get programId(): string | undefined {
    return this.token?.p;
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

  get judgingPoolId(): string | undefined {
    return this.token?.j;
  }

  get judgingPoolCanViewResults(): boolean {
    return this.token?.jvr || false;
  }

  get judgingPoolCanUploadMedia(): boolean {
    return this.token?.jum || false;
  }
}

export function provideAuthContext(ctx?: ExpressContext): AuthContext {
  if (!ctx?.req) return new AuthContext();

  const { req } = ctx;

  const header = req.header('X-Showcase-Authorization') || req.header('Authorization');
  if (!header) return new AuthContext();

  const [type, jwt] = header.split(/\s+/g, 2);
  if (type !== 'Bearer') return new AuthContext();

  return new AuthContext(<AuthToken>verify(jwt, config.jwt.secret, { audience: config.jwt.audience }));
}
