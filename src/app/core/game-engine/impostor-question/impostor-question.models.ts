import { Player } from '../../players/player.model';

export interface QuestionPair {
  readonly id: string;
  readonly questionA: string;
  readonly questionB: string;
}

export type AnswerMode = 'spoken' | 'written';
export interface ImpostorQuestionConfig {
  readonly impostorCount: number;
  readonly answerMode: AnswerMode;
}
export type ImpostorQuestionPhase = 'setup' | 'handoff' | 'discussion' | 'majority-reveal' | 'results';
export interface QuestionReveal { readonly kind: 'question'; readonly text: string; }

export interface ImpostorQuestionSession {
  readonly game: 'pergunta-do-impostor';
  readonly phase: ImpostorQuestionPhase;
  readonly players: readonly Player[];
  readonly config: ImpostorQuestionConfig;
  readonly pair: QuestionPair | null;
  readonly majorityQuestion: string | null;
  readonly impostorQuestion: string | null;
  readonly impostorPlayerIds: readonly string[];
  readonly answers: Readonly<Record<string, string>>;
  readonly currentPlayerIndex: number;
  readonly round: number;
}
