export type GameCategory = 'Adivinhação' | 'Cooperativo' | 'Dedução' | 'Blefe' | 'Agilidade' | 'Conversa';

export type GameComplexity = 'easy' | 'medium' | 'hard';
export type GameEngineType = 'identity-reveal' | 'scale-ordering' | 'hidden-role' | 'timed-turns' | 'question-pairs' | 'comparison-reveal';
export type GameFeature =
  | 'countdown'
  | 'audio'
  | 'haptics'
  | 'timer'
  | 'private-reveal'
  | 'player-setup';
export type GameAvailability = 'available' | 'coming-soon';

export interface GameDefinition {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly shortDescription: string;
  readonly fullDescription: string;
  readonly players: { readonly min: number; readonly max?: number };
  readonly estimatedMinutes?: number;
  readonly categories: readonly GameCategory[];
  readonly complexity: GameComplexity;
  readonly deviceMode: 'single-device' | 'multi-device';
  readonly vibe: readonly string[];
  readonly goodFor: readonly string[];
  readonly engine: GameEngineType;
  readonly features: readonly GameFeature[];
  readonly availability: GameAvailability;
  readonly accent: string;
  readonly instructions: readonly string[];
  readonly appResponsibility: string;
  readonly example?: readonly string[];
  readonly modes?: readonly {
    readonly name: string;
    readonly description: string;
  }[];
}
