/**
 * Manual type declarations for modules without official @types packages
 * or to augment existing type definitions
 */

declare module 'passport-google-oauth20' {
  import { Strategy as PassportStrategy } from 'passport-strategy';
  import { Request } from 'express';

  export interface Profile {
    id: string;
    displayName: string;
    name?: {
      familyName?: string;
      givenName?: string;
      middleName?: string;
    };
    emails?: Array<{
      value: string;
      verified?: boolean;
    }>;
    photos?: Array<{
      value: string;
    }>;
    provider: string;
    _raw: string;
    _json: any;
  }

  export interface StrategyOptions {
    clientID: string;
    clientSecret: string;
    callbackURL: string;
    scope?: string[];
    passReqToCallback?: boolean;
  }

  export type VerifyCallback = (
    err?: Error | null,
    user?: any,
    info?: any
  ) => void;

  export type VerifyFunction = (
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback
  ) => void;

  export class Strategy extends PassportStrategy {
    constructor(options: StrategyOptions, verify: VerifyFunction);
    name: string;
    authenticate(req: Request, options?: any): void;
  }
}

declare module 'passport-facebook' {
  import { Strategy as PassportStrategy } from 'passport-strategy';
  import { Request } from 'express';

  export interface Profile {
    id: string;
    displayName: string;
    name?: {
      familyName?: string;
      givenName?: string;
      middleName?: string;
    };
    emails?: Array<{
      value: string;
    }>;
    photos?: Array<{
      value: string;
    }>;
    provider: string;
    _raw: string;
    _json: any;
  }

  export interface StrategyOptions {
    clientID: string;
    clientSecret: string;
    callbackURL: string;
    profileFields?: string[];
    scope?: string[];
    passReqToCallback?: boolean;
  }

  export type VerifyCallback = (
    err?: Error | null,
    user?: any,
    info?: any
  ) => void;

  export type VerifyFunction = (
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback
  ) => void;

  export class Strategy extends PassportStrategy {
    constructor(options: StrategyOptions, verify: VerifyFunction);
    name: string;
    authenticate(req: Request, options?: any): void;
  }
}

declare module 'bcryptjs' {
  export function genSaltSync(rounds?: number): string;
  export function genSalt(rounds?: number): Promise<string>;
  export function genSalt(rounds: number, callback: (err: Error, salt: string) => void): void;
  
  export function hashSync(data: string | Buffer, salt: string | number): string;
  export function hash(data: string | Buffer, salt: string | number): Promise<string>;
  export function hash(
    data: string | Buffer,
    salt: string | number,
    callback: (err: Error, encrypted: string) => void
  ): void;
  
  export function compareSync(data: string | Buffer, encrypted: string): boolean;
  export function compare(data: string | Buffer, encrypted: string): Promise<boolean>;
  export function compare(
    data: string | Buffer,
    encrypted: string,
    callback: (err: Error, same: boolean) => void
  ): void;
  
  export function getRounds(encrypted: string): number;
}
