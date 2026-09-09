export type TeaOrCoffeePhase = 'ready' | 'countdown' | 'revealed';

export interface TeaOrCoffeeSession {
  readonly game: 'cha-ou-cafe';
  readonly phase: TeaOrCoffeePhase;
  readonly word: string;
  readonly round: number;
}
