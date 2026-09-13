import { Player } from '../../players/player.model';

export interface LocationContent {
  readonly location: string;
  readonly classicHints: readonly string[];
  readonly blindLocations: readonly string[];
}

export type LocationGameMode = 'classic' | 'blind';

export interface LocationConfig {
  readonly impostorCount: number;
  readonly mode: LocationGameMode;
  readonly giveHint: boolean;
}

export type LocationPrivateInfo =
  | { readonly kind: 'location'; readonly location: string }
  | { readonly kind: 'impostor'; readonly hint: string | null };

export type LocationPhase = 'setup' | 'handoff' | 'discussion' | 'results';

export interface LocationSession {
  readonly game: 'onde-estou';
  readonly phase: LocationPhase;
  readonly players: readonly Player[];
  readonly config: LocationConfig;
  readonly location: string | null;
  readonly hint: string | null;
  readonly alternativeLocation: string | null;
  readonly impostorPlayerIds: readonly string[];
  readonly currentPlayerIndex: number;
  readonly round: number;
}
