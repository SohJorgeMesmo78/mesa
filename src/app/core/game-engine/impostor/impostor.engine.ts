import { Injectable } from '@angular/core';
import { RandomService } from '../../random/random.service';
import { normalizePlayers, Player } from '../../players/player.model';
import { ImpostorConfig, ImpostorContent, ImpostorSession } from './impostor.models';

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
      config: { impostorCount: 1, hintsEnabled: true },
      word: null,
      hint: null,
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
    const hint = session.config.hintsEnabled ? this.random.pick(entry.hints) : null;
    return {
      ...session,
      players,
      phase: 'handoff',
      word: entry.word,
      hint,
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
  }

  private assertPhase(session: ImpostorSession, phase: ImpostorSession['phase']): void {
    if (session.phase !== phase) throw new Error(`A ação não é permitida na etapa ${session.phase}.`);
  }
}
