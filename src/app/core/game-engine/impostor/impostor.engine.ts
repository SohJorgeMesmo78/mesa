import { Injectable } from '@angular/core';
import { RandomService } from '../../random/random.service';
import { normalizePlayers, Player } from '../../players/player.model';
import { ImpostorConfig, ImpostorContent, ImpostorPrivateInfo, ImpostorSession } from './impostor.models';

const IMPOSTOR_MIN_PLAYERS = 3;
const IMPOSTOR_MAX_PLAYERS = 12;

@Injectable({ providedIn: 'root' })
export class ImpostorEngine {
  constructor(private readonly random: RandomService) {}

  createSetup(players: readonly Player[]): ImpostorSession {
    this.assertPlayers(players);
    return {
      game: 'impostor',
      phase: 'setup',
      players: normalizePlayers(players),
      config: { impostorCount: 1, mode: 'classic', giveHint: true },
      word: null,
      hint: null,
      alternativeWord: null,
      impostorPlayerIds: [],
      currentPlayerIndex: 0,
      round: 0,
    };
  }

  updateSetup(
    session: ImpostorSession,
    players: readonly Player[],
    config: ImpostorConfig,
  ): ImpostorSession {
    this.assertPhase(session, 'setup');
    this.assertPlayers(players);
    this.assertConfig(players.length, config);
    return { ...session, players: [...players], config };
  }

  startRound(session: ImpostorSession, content: readonly ImpostorContent[]): ImpostorSession {
    if (session.phase !== 'setup' && session.phase !== 'results') {
      throw new Error(`Uma nova rodada não pode começar na etapa ${session.phase}.`);
    }
    this.assertPlayers(session.players);
    this.assertConfig(session.players.length, session.config);
    const players = normalizePlayers(session.players);
    const entry = this.pickContent(content, session.word ?? undefined);
    const impostorPlayerIds = this.random
      .shuffle(players)
      .slice(0, session.config.impostorCount)
      .map((player) => player.id);
    const hint = session.config.mode === 'classic' && session.config.giveHint
      ? this.random.pick(entry.classicHints)
      : null;
    const alternativeWord = session.config.mode === 'blind'
      ? this.random.pick(entry.blindWords)
      : null;
    return {
      ...session,
      players,
      phase: 'handoff',
      word: entry.word,
      hint,
      alternativeWord,
      impostorPlayerIds,
      currentPlayerIndex: 0,
      round: session.round + 1,
    };
  }

  hideCurrent(session: ImpostorSession): ImpostorSession {
    this.assertPhase(session, 'handoff');
    const isLastPlayer = session.currentPlayerIndex >= session.players.length - 1;
    return isLastPlayer
      ? { ...session, phase: 'discussion' }
      : { ...session, phase: 'handoff', currentPlayerIndex: session.currentPlayerIndex + 1 };
  }

  showResults(session: ImpostorSession): ImpostorSession {
    this.assertPhase(session, 'discussion');
    return { ...session, phase: 'results' };
  }

  privateInfo(session: ImpostorSession, playerId: string): ImpostorPrivateInfo {
    if (session.phase !== 'handoff') throw new Error('A informação privada só existe durante a distribuição.');
    const isImpostor = session.impostorPlayerIds.includes(playerId);
    if (session.config.mode === 'blind') {
      const word = isImpostor ? session.alternativeWord : session.word;
      if (!word) throw new Error('A palavra privada da rodada não está disponível.');
      return { kind: 'word', word };
    }
    if (isImpostor) return { kind: 'impostor', hint: session.hint };
    if (!session.word) throw new Error('A palavra da rodada não está disponível.');
    return { kind: 'word', word: session.word };
  }

  maxImpostors(playerCount: number): number {
    return Math.max(1, Math.floor((playerCount - 1) / 2));
  }

  private pickContent(content: readonly ImpostorContent[], previousWord?: string): ImpostorContent {
    if (content.length === 0) throw new Error('Nenhuma palavra de Impostor foi cadastrada.');
    const candidates = content.length > 1 && previousWord
      ? content.filter((entry) => entry.word !== previousWord)
      : content;
    return this.random.pick(candidates);
  }

  private assertPlayers(players: readonly Player[]): void {
    if (players.length < IMPOSTOR_MIN_PLAYERS || players.length > IMPOSTOR_MAX_PLAYERS) {
      throw new RangeError(`Impostor precisa de ${IMPOSTOR_MIN_PLAYERS} a ${IMPOSTOR_MAX_PLAYERS} participantes.`);
    }
    if (new Set(players.map((player) => player.id)).size !== players.length) {
      throw new Error('Os participantes precisam ter identificadores únicos.');
    }
  }

  private assertConfig(playerCount: number, config: ImpostorConfig): void {
    const maximum = this.maxImpostors(playerCount);
    if (!Number.isInteger(config.impostorCount)
      || config.impostorCount < 1
      || config.impostorCount > maximum) {
      throw new RangeError(`Escolha entre 1 e ${maximum} impostores.`);
    }
    if (config.mode !== 'classic' && config.mode !== 'blind') {
      throw new Error('Escolha um modo válido para o Impostor.');
    }
  }

  private assertPhase(session: ImpostorSession, phase: ImpostorSession['phase']): void {
    if (session.phase !== phase) throw new Error(`A ação não é permitida na etapa ${session.phase}.`);
  }
}
