import { Player } from '../../players/player.model';

export interface ItoTheme {
  readonly id: string;
  readonly prompt: string;
  readonly low: string;
  readonly high: string;
}

export interface ItoAssignment {
  readonly playerId: string;
  readonly number: number;
}

export interface ItoScore {
  readonly correctPairs: number;
  readonly totalPairs: number;
  readonly points: number;
  readonly problematicPlayerIds: readonly string[];
}

export type ItoPhase = 'setup' | 'handoff' | 'collective' | 'results';

export interface ItoSession {
  readonly game: 'ito';
  readonly phase: ItoPhase;
  readonly players: readonly Player[];
  readonly theme: ItoTheme | null;
  readonly assignments: readonly ItoAssignment[];
  readonly clues: Readonly<Record<string, string>>;
  readonly guessedOrder: readonly string[];
  readonly revealedPlayerIds: readonly string[];
  readonly showCorrectOrder: boolean;
  readonly currentPlayerIndex: number;
  readonly round: number;
}
