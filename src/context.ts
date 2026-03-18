import { Request } from 'express';
import { AuthContext, provideAuthContext } from './auth/AuthContext';

export interface Context {
  auth: AuthContext
}

export function createContext(expressContext?: { req?: Request }): Context {
  return {
    auth: provideAuthContext(expressContext),
  };
}
