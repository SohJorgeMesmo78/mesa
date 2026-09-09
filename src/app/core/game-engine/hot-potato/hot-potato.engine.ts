import { Injectable } from '@angular/core';
import { normalizePlayers, Player } from '../../players/player.model';
import { RandomService } from '../../random/random.service';
import { HOT_POTATO_DURATIONS, HotPotatoDuration, HotPotatoSession, HotPotatoTheme } from './hot-potato.models';

@Injectable({ providedIn: 'root' })
export class HotPotatoEngine {
  constructor(private readonly random: RandomService) {}

  createSetup(players: readonly Player[], themes: readonly HotPotatoTheme[]): HotPotatoSession {
    this.assertPlayers(players);
    return { game: 'batata-quente', phase: 'setup', players: normalizePlayers(players), durationSeconds: 60, theme: this.pickTheme(themes), currentPlayerIndex: 0, roundStartedAt: null, loserPlayerId: null, round: 0 };
  }

  updateSetup(session: HotPotatoSession, players: readonly Player[], durationSeconds: HotPotatoDuration): HotPotatoSession {
    if (session.phase !== 'setup') throw new Error('A configuração não pode mudar durante a rodada.');
    this.assertPlayers(players);
    if (!(HOT_POTATO_DURATIONS as readonly number[]).includes(durationSeconds)) throw new RangeError('Escolha uma duração disponível.');
    return { ...session, players: normalizePlayers(players), durationSeconds };
  }

  prepare(session: HotPotatoSession, players: readonly Player[]): HotPotatoSession {
    if (session.phase !== 'setup') throw new Error('A partida já foi configurada.');
    this.assertPlayers(players);
    return { ...session, phase: 'ready', players: normalizePlayers(players) };
  }

  changeTheme(session: HotPotatoSession, themes: readonly HotPotatoTheme[]): HotPotatoSession {
    if (session.phase !== 'setup' && session.phase !== 'ready') throw new Error('O tema não pode mudar durante a rodada.');
    return { ...session, theme: this.pickTheme(themes, session.theme) };
  }

  startRound(session: HotPotatoSession, now: number): HotPotatoSession {
    if (session.phase !== 'ready') throw new Error('Finalize a configuração antes de começar.');
    if (!Number.isFinite(now) || now < 0) throw new RangeError('Horário de início inválido.');
    return { ...session, phase: 'playing', currentPlayerIndex: 0, roundStartedAt: now, loserPlayerId: null, round: session.round + 1 };
  }

  passTurn(session: HotPotatoSession, now: number): HotPotatoSession {
    const current = this.reconcile(session, now);
    return current.phase === 'playing'
      ? { ...current, currentPlayerIndex: (current.currentPlayerIndex + 1) % current.players.length }
      : current;
  }

  reconcile(session: HotPotatoSession, now: number): HotPotatoSession {
    if (session.phase !== 'playing' || this.remainingSeconds(session, now) > 0) return session;
    return { ...session, phase: 'result', loserPlayerId: session.players[session.currentPlayerIndex].id };
  }

  remainingSeconds(session: HotPotatoSession, now: number): number {
    if (session.phase !== 'playing' || session.roundStartedAt === null) return session.phase === 'result' ? 0 : session.durationSeconds;
    return Math.max(0, Math.ceil((session.durationSeconds * 1000 - Math.max(0, now - session.roundStartedAt)) / 1000));
  }

  prepareNextRound(session: HotPotatoSession, themes: readonly HotPotatoTheme[]): HotPotatoSession {
    if (session.phase !== 'result') throw new Error('A rodada atual ainda não terminou.');
    return { ...session, phase: 'ready', theme: this.pickTheme(themes, session.theme), currentPlayerIndex: 0, roundStartedAt: null, loserPlayerId: null };
  }

  private pickTheme(themes: readonly HotPotatoTheme[], previous?: HotPotatoTheme): HotPotatoTheme {
    if (themes.length === 0) throw new Error('Nenhum tema de Batata Quente foi cadastrado.');
    const candidates = themes.length > 1 && previous ? themes.filter((theme) => theme.text !== previous.text) : themes;
    return this.random.pick(candidates);
  }

  private assertPlayers(players: readonly Player[]): void {
    if (players.length < 2 || players.length > 12) throw new RangeError('Batata Quente precisa de 2 a 12 participantes.');
    if (new Set(players.map((player) => player.id)).size !== players.length) throw new Error('Os participantes precisam ter identificadores únicos.');
  }
}
