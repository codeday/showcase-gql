import { verify } from 'jsonwebtoken';
import { ExpressContext } from 'apollo-server-express/dist/ApolloServer';
import { PrismaClient } from '@prisma/client';
import { Container } from 'typedi';
import config from '../config';
import { AuthToken } from './token';

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

  async isProjectAdmin(id: string): Promise<boolean> {
    // If there is no token, they can't be an admin!
    if (!this.token) return false;

    // Don't need to check for superadmins
    if (this.adminFlag && !this.eventId) return true;

    return (await Container.get(PrismaClient).project.count({
      where: {
        id,
        OR: [
          // Can edit teams where the tokenholder is a member
          {
            members: {
              some: { username: this.username },
            },
          },

          // If tokenholder is an event admin, all teams at the event are also editable
          ...(this.adminFlag ? [{
            eventId: this.eventId,
          }] : []),
        ],
      },
    })) > 0;
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
