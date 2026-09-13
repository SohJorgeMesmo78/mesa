import { Injectable } from '@angular/core';
import { Player } from '../../players/player.model';
import { RandomService } from '../../random/random.service';
import { RatingMode, RatingSession, RatingTheme } from './rating.models';

@Injectable({ providedIn: 'root' })
export class RatingEngine {
  constructor(private readonly random: RandomService) {}
  create(players: readonly Player[]): RatingSession { return { game: 'qual-e-a-nota', phase: 'setup', mode: 'pairs', players, theme: null, assignments: [], currentPlayerIndex: 0, round: 0 }; }
  configure(session: RatingSession, players: readonly Player[], mode: RatingMode): RatingSession { return { ...session, players, mode, phase: 'setup', theme: null, assignments: [], currentPlayerIndex: 0 }; }
  start(session: RatingSession, themes: readonly RatingTheme[]): RatingSession {
    if (session.mode === 'pairs' && session.players.length < 2) throw new RangeError('São necessárias ao menos duas duplas.');
    const recipients = session.mode === 'one-vs-all' ? session.players.slice(0, 1) : session.players;
    return { ...session, phase: 'theme', theme: this.random.pick(themes, session.theme ?? undefined), assignments: recipients.map((player) => ({ playerId: player.id, grade: this.random.integer(1, 10) })), currentPlayerIndex: 0, round: session.round + 1 };
  }
  acceptTheme(session: RatingSession): RatingSession { return { ...session, phase: 'handoff' }; }
  next(session: RatingSession): RatingSession { const next = session.currentPlayerIndex + 1; return next < session.assignments.length ? { ...session, currentPlayerIndex: next } : { ...session, phase: 'discussion' }; }
}
