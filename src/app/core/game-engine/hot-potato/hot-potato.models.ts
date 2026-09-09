import { Player } from '../../players/player.model';

export const HOT_POTATO_DURATIONS = [30, 60, 90, 120] as const;
export type HotPotatoDuration = typeof HOT_POTATO_DURATIONS[number];
export type HotPotatoPhase = 'setup' | 'ready' | 'playing' | 'result';

export interface HotPotatoTheme { readonly text: string; }

export interface HotPotatoSession {
  readonly game: 'batata-quente';
  readonly phase: HotPotatoPhase;
  readonly players: readonly Player[];
  readonly durationSeconds: HotPotatoDuration;
  readonly theme: HotPotatoTheme;
  readonly currentPlayerIndex: number;
  readonly roundStartedAt: number | null;
  readonly loserPlayerId: string | null;
  readonly round: number;
}
