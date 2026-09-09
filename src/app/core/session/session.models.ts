import { ImpostorSession } from '../game-engine/impostor/impostor.models';
import { ItoSession } from '../game-engine/ito/ito.models';
import { HotPotatoSession } from '../game-engine/hot-potato/hot-potato.models';
import { ImpostorQuestionSession } from '../game-engine/impostor-question/impostor-question.models';
import { TeaOrCoffeeSession } from '../game-engine/tea-or-coffee/tea-or-coffee.models';

export const SESSION_SCHEMA_VERSION = 8 as const;

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

export type ActiveGameSession = WhoAmISession | ItoSession | ImpostorSession | HotPotatoSession | ImpostorQuestionSession | TeaOrCoffeeSession;

export interface MesaSession {
  readonly version: typeof SESSION_SCHEMA_VERSION;
  readonly preferences: ExperiencePreferences;
  readonly activeGame: ActiveGameSession | null;
}
