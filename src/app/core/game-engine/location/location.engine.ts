import { Injectable } from '@angular/core';
import { normalizePlayers, Player } from '../../players/player.model';
import { RandomService } from '../../random/random.service';
import { LocationConfig, LocationContent, LocationPrivateInfo, LocationSession } from './location.models';

const MIN_PLAYERS = 3;
const MAX_PLAYERS = 12;

@Injectable({ providedIn: 'root' })
export class LocationEngine {
  constructor(private readonly random: RandomService) {}

  createSetup(players: readonly Player[]): LocationSession {
    this.assertPlayers(players);
    return {
      game: 'onde-estou', phase: 'setup', players: normalizePlayers(players),
      config: { impostorCount: 1, mode: 'classic', giveHint: true }, location: null, hint: null,
      alternativeLocation: null,
      impostorPlayerIds: [], currentPlayerIndex: 0, round: 0,
    };
  }

  updateSetup(session: LocationSession, players: readonly Player[], config: LocationConfig): LocationSession {
    this.assertPhase(session, 'setup');
    this.assertPlayers(players);
    this.assertConfig(players.length, config);
    return { ...session, players: normalizePlayers(players), config };
  }

  startRound(session: LocationSession, content: readonly LocationContent[]): LocationSession {
    if (session.phase !== 'setup' && session.phase !== 'results') {
      throw new Error(`Uma nova rodada não pode começar na etapa ${session.phase}.`);
    }
    this.assertPlayers(session.players);
    this.assertConfig(session.players.length, session.config);
    const players = normalizePlayers(session.players);
    const entry = this.pickContent(content, session.location ?? undefined);
    const impostorPlayerIds = this.random.shuffle(players)
      .slice(0, session.config.impostorCount)
      .map((player) => player.id);
    return {
      ...session,
      players,
      phase: 'handoff',
      location: entry.location,
      hint: session.config.mode === 'classic' && session.config.giveHint
        ? this.random.pick(entry.classicHints)
        : null,
      alternativeLocation: session.config.mode === 'blind'
        ? this.random.pick(entry.blindLocations)
        : null,
      impostorPlayerIds,
      currentPlayerIndex: 0,
      round: session.round + 1,
    };
  }

  privateInfo(session: LocationSession, playerId: string): LocationPrivateInfo {
    this.assertPhase(session, 'handoff');
    const isImpostor = session.impostorPlayerIds.includes(playerId);
    if (session.config.mode === 'blind') {
      const location = isImpostor ? session.alternativeLocation : session.location;
      if (!location) throw new Error('O local privado da rodada não está disponível.');
      return { kind: 'location', location };
    }
    if (isImpostor) return { kind: 'impostor', hint: session.hint };
    if (!session.location) throw new Error('O local da rodada não está disponível.');
    return { kind: 'location', location: session.location };
  }

  hideCurrent(session: LocationSession): LocationSession {
    this.assertPhase(session, 'handoff');
    return session.currentPlayerIndex >= session.players.length - 1
      ? { ...session, phase: 'discussion' }
      : { ...session, currentPlayerIndex: session.currentPlayerIndex + 1 };
  }

  showResults(session: LocationSession): LocationSession {
    this.assertPhase(session, 'discussion');
    return { ...session, phase: 'results' };
  }

  maxImpostors(playerCount: number): number {
    return Math.max(1, Math.floor((playerCount - 1) / 2));
  }

  private pickContent(content: readonly LocationContent[], previous?: string): LocationContent {
    const valid = content.filter((entry) => entry.location.trim()
      && entry.classicHints.some((hint) => hint.trim())
      && entry.blindLocations.some((location) => location.trim() && location !== entry.location));
    if (valid.length === 0) throw new Error('Nenhum local válido foi cadastrado.');
    const candidates = valid.length > 1 && previous
      ? valid.filter((entry) => entry.location !== previous)
      : valid;
    return this.random.pick(candidates);
  }

  private assertPlayers(players: readonly Player[]): void {
    if (players.length < MIN_PLAYERS || players.length > MAX_PLAYERS) {
      throw new RangeError(`Onde Estou precisa de ${MIN_PLAYERS} a ${MAX_PLAYERS} participantes.`);
    }
    if (new Set(players.map((player) => player.id)).size !== players.length) {
      throw new Error('Os participantes precisam ter identificadores únicos.');
    }
  }

  private assertConfig(playerCount: number, config: LocationConfig): void {
    const maximum = this.maxImpostors(playerCount);
    if (!Number.isInteger(config.impostorCount) || config.impostorCount < 1 || config.impostorCount > maximum) {
      throw new RangeError(`Escolha entre 1 e ${maximum} impostores.`);
    }
    if (config.mode !== 'classic' && config.mode !== 'blind') throw new Error('Escolha um modo válido para Onde Estou.');
  }

  private assertPhase(session: LocationSession, phase: LocationSession['phase']): void {
    if (session.phase !== phase) throw new Error(`A ação não é permitida na etapa ${session.phase}.`);
  }
}
