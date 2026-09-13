import { Player } from '../../players/player.model';
export type RatingMode = 'pairs' | 'one-vs-all';
export interface RatingTheme { readonly id: string; readonly prompt: string; readonly low: string; readonly high: string; }
export interface RatingAssignment { readonly playerId: string; readonly grade: number; }
export interface RatingSession {
  readonly game: 'qual-e-a-nota'; readonly phase: 'setup' | 'theme' | 'handoff' | 'discussion';
  readonly mode: RatingMode; readonly players: readonly Player[]; readonly theme: RatingTheme | null;
  readonly assignments: readonly RatingAssignment[]; readonly currentPlayerIndex: number; readonly round: number;
}
