import { ImpostorSession } from '../game-engine/impostor/impostor.models';
import { ItoSession } from '../game-engine/ito/ito.models';
import { HotPotatoSession } from '../game-engine/hot-potato/hot-potato.models';
import { ImpostorQuestionSession } from '../game-engine/impostor-question/impostor-question.models';
import { TeaOrCoffeeSession } from '../game-engine/tea-or-coffee/tea-or-coffee.models';
import { LocationSession } from '../game-engine/location/location.models';
import { ContactSession } from '../game-engine/contact/contact.models';
import { RatingSession } from '../game-engine/rating/rating.models';
import { WordListSession } from '../game-engine/word-list/word-list.models';
import { LetterChainSession } from '../game-engine/letter-chain/letter-chain.models';
import { CitySleepsSession } from '../game-engine/city-sleeps/city-sleeps.models';

export const SESSION_SCHEMA_VERSION = 12 as const;

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

export type ActiveGameSession = WhoAmISession | ItoSession | ImpostorSession | HotPotatoSession | ImpostorQuestionSession | TeaOrCoffeeSession | LocationSession | ContactSession | RatingSession | WordListSession | LetterChainSession | CitySleepsSession;

export interface MesaSession {
  readonly version: typeof SESSION_SCHEMA_VERSION;
  readonly preferences: ExperiencePreferences;
  readonly activeGame: ActiveGameSession | null;
}
