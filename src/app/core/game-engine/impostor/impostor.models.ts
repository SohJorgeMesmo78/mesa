import { Player } from '../../players/player.model';

export interface ImpostorContent {
  readonly word: string;
  readonly classicHints: readonly string[];
  readonly blindWords: readonly string[];
}

export type ImpostorMode = 'classic' | 'blind';

export interface ImpostorConfig {
  readonly impostorCount: number;
  readonly mode: ImpostorMode;
  readonly giveHint: boolean;
}

export type ImpostorPrivateInfo =
  | { readonly kind: 'word'; readonly word: string }
  | { readonly kind: 'impostor'; readonly hint: string | null };

export type ImpostorPhase = 'setup' | 'handoff' | 'discussion' | 'results';

export interface ImpostorSession {
  readonly game: 'impostor';
  readonly phase: ImpostorPhase;
  readonly players: readonly Player[];
  readonly config: ImpostorConfig;
  readonly word: string | null;
  readonly hint: string | null;
  readonly alternativeWord: string | null;
  readonly impostorPlayerIds: readonly string[];
  readonly currentPlayerIndex: number;
  readonly round: number;
}
