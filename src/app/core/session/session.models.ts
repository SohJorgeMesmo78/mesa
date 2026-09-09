import { ImpostorSession } from '../game-engine/impostor/impostor.models';
import { ItoSession } from '../game-engine/ito/ito.models';
import { HotPotatoSession } from '../game-engine/hot-potato/hot-potato.models';

export const SESSION_SCHEMA_VERSION = 5 as const;

export interface ExperiencePreferences {
  readonly countdown: boolean;
  readonly sound: boolean;
  readonly haptics: boolean;
}

export interface WhoAmISession {
  readonly game: 'quem-sou-eu';
  readonly phase: 'countdown' | 'revealed';
  readonly identity: string;
  readonly round: number;
}

export type ActiveGameSession = WhoAmISession | ItoSession | ImpostorSession | HotPotatoSession;

export interface MesaSession {
  readonly version: typeof SESSION_SCHEMA_VERSION;
  readonly preferences: ExperiencePreferences;
  readonly activeGame: ActiveGameSession | null;
}
