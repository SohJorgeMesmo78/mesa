import { Injectable } from '@angular/core';
import { normalizePlayers, Player } from '../../players/player.model';
import { RandomService } from '../../random/random.service';
import { ImpostorQuestionConfig, ImpostorQuestionSession, QuestionPair, QuestionReveal } from './impostor-question.models';

@Injectable({ providedIn: 'root' })
export class ImpostorQuestionEngine {
  constructor(private readonly random: RandomService) {}

  createSetup(players: readonly Player[]): ImpostorQuestionSession {
    this.assertPlayers(players);
    return { game: 'pergunta-do-impostor', phase: 'setup', players: normalizePlayers(players), config: { impostorCount: 1, answerMode: 'spoken' }, pair: null, majorityQuestion: null, impostorQuestion: null, impostorPlayerIds: [], answers: {}, currentPlayerIndex: 0, round: 0 };
  }

  updateSetup(session: ImpostorQuestionSession, players: readonly Player[], config: ImpostorQuestionConfig): ImpostorQuestionSession {
    this.assertPhase(session, 'setup');
    this.assertPlayers(players);
    this.assertConfig(players.length, config);
    return { ...session, players: normalizePlayers(players), config };
  }

  startRound(session: ImpostorQuestionSession, pairs: readonly QuestionPair[]): ImpostorQuestionSession {
    if (session.phase !== 'setup' && session.phase !== 'results') throw new Error('Uma nova rodada não pode começar nesta etapa.');
    this.assertPlayers(session.players);
    this.assertConfig(session.players.length, session.config);
    const players = normalizePlayers(session.players);
    const pair = this.pickPair(pairs, session.pair?.id);
    const firstIsMajority = this.random.integer(0, 1) === 0;
    const impostorPlayerIds = this.random.shuffle(players).slice(0, session.config.impostorCount).map((player) => player.id);
    return {
      ...session, phase: 'handoff', players, pair,
      majorityQuestion: firstIsMajority ? pair.questionA : pair.questionB,
      impostorQuestion: firstIsMajority ? pair.questionB : pair.questionA,
      impostorPlayerIds, answers: {}, currentPlayerIndex: 0, round: session.round + 1,
    };
  }

  privateInfo(session: ImpostorQuestionSession, playerId: string): QuestionReveal {
    this.assertPhase(session, 'handoff');
    const text = session.impostorPlayerIds.includes(playerId) ? session.impostorQuestion : session.majorityQuestion;
    if (!text) throw new Error('A pergunta privada não está disponível.');
    return { kind: 'question', text };
  }

  hideCurrent(session: ImpostorQuestionSession, answer?: string): ImpostorQuestionSession {
    this.assertPhase(session, 'handoff');
    const player = session.players[session.currentPlayerIndex];
    const answers = session.config.answerMode === 'written'
      ? { ...session.answers, [player.id]: this.normalizeAnswer(answer) }
      : session.answers;
    return session.currentPlayerIndex >= session.players.length - 1
      ? { ...session, answers, phase: session.config.answerMode === 'written' ? 'majority-reveal' : 'discussion' }
      : { ...session, answers, currentPlayerIndex: session.currentPlayerIndex + 1 };
  }

  revealMajorityQuestion(session: ImpostorQuestionSession): ImpostorQuestionSession {
    this.assertPhase(session, 'discussion');
    return { ...session, phase: 'majority-reveal' };
  }

  showResults(session: ImpostorQuestionSession): ImpostorQuestionSession {
    this.assertPhase(session, 'majority-reveal');
    return { ...session, phase: 'results' };
  }

  maxImpostors(playerCount: number): number { return Math.max(1, Math.floor((playerCount - 1) / 2)); }

  private pickPair(pairs: readonly QuestionPair[], previousId?: string): QuestionPair {
    if (pairs.length === 0) throw new Error('Nenhum par de perguntas foi cadastrado.');
    const candidates = pairs.length > 1 && previousId ? pairs.filter((pair) => pair.id !== previousId) : pairs;
    return this.random.pick(candidates);
  }

  private assertPlayers(players: readonly Player[]): void {
    if (players.length < 3 || players.length > 12) throw new RangeError('Pergunta Errada precisa de 3 a 12 participantes.');
    if (new Set(players.map((player) => player.id)).size !== players.length) throw new Error('Os participantes precisam ter identificadores únicos.');
  }

  private assertConfig(playerCount: number, config: ImpostorQuestionConfig): void {
    const maximum = this.maxImpostors(playerCount);
    if (!Number.isInteger(config.impostorCount) || config.impostorCount < 1 || config.impostorCount > maximum) throw new RangeError(`Escolha entre 1 e ${maximum} impostores.`);
    if (config.answerMode !== 'spoken' && config.answerMode !== 'written') throw new Error('O modo de respostas é inválido.');
  }

  private normalizeAnswer(answer?: string): string {
    const normalized = answer?.trim() ?? '';
    if (!normalized) throw new Error('Escreva uma resposta antes de continuar.');
    if (normalized.length > 160) throw new RangeError('A resposta pode ter no máximo 160 caracteres.');
    return normalized;
  }

  private assertPhase(session: ImpostorQuestionSession, phase: ImpostorQuestionSession['phase']): void {
    if (session.phase !== phase) throw new Error(`A ação não é permitida na etapa ${session.phase}.`);
  }
}
