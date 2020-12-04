import { ExpressContext } from 'apollo-server-express/dist/ApolloServer';
import { AuthContext, provideAuthContext } from './auth/AuthContext';

export interface Context {
  auth: AuthContext
}

export function createContext(expressContext?: ExpressContext) : Context {
  return {
    auth: provideAuthContext(expressContext),
  };
}
