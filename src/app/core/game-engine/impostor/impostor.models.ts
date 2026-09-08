import { Player } from '../../players/player.model';

export interface ImpostorContent {
  readonly word: string;
  readonly hints: readonly string[];
}

export interface ImpostorConfig {
  readonly impostorCount: number;
  readonly hintsEnabled: boolean;
}

export type ImpostorPhase = 'setup' | 'handoff' | 'discussion' | 'results';

export interface ImpostorSession {
  readonly game: 'impostor';
  readonly phase: ImpostorPhase;
  readonly players: readonly Player[];
  readonly config: ImpostorConfig;
  readonly word: string | null;
  readonly hint: string | null;
  readonly impostorPlayerIds: readonly string[];
  readonly currentPlayerIndex: number;
  readonly round: number;
}
