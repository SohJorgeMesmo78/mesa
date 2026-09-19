import { Injectable } from '@angular/core';
import { normalizePlayers, Player } from '../../players/player.model';
import { RandomService } from '../../random/random.service';
import { CITY_SLEEPS_ROLES, CitySleepsConfig, CitySleepsPlayerState, CitySleepsRole, CitySleepsSession, CitySleepsWinner, NightAction, RitualTarget, VoteResult } from './city-sleeps.models';

export const NIGHT_RITUAL_STEPS = 2;

@Injectable({ providedIn: 'root' })
export class CitySleepsEngine {
  constructor(private readonly random: RandomService) {}
  suggestedKillers(count: number): number { return count >= 11 ? 3 : count >= 8 ? 2 : 1; }
  maxKillers(count: number): number { return Math.max(1, Math.floor((count - 1) / 2)); }
  createSetup(players: readonly Player[]): CitySleepsSession {
    this.assertPlayers(players);
    return { game: 'cidade-dorme', phase: 'setup', players: normalizePlayers(players), config: { killerCount: this.suggestedKillers(players.length), doctorEnabled: true, detectiveEnabled: true, revealRoleOnDeath: false }, playerStates: [], currentPlayerIndex: 0, ritualStep: 0, roleRevealIndex: 0, nightNumber: 0, actions: {}, votes: {}, lastNightResult: null, lastVoteResult: null, winner: null };
  }
  updateSetup(session: CitySleepsSession, players: readonly Player[], config: CitySleepsConfig): CitySleepsSession { this.assertPhase(session, 'setup'); this.assertPlayers(players); this.assertConfig(players.length, config); return { ...session, players: normalizePlayers(players), config }; }
  startGame(session: CitySleepsSession): CitySleepsSession {
    if (session.phase !== 'setup' && session.phase !== 'game-over') throw new Error('A partida não pode começar agora.');
    this.assertPlayers(session.players); this.assertConfig(session.players.length, session.config);
    const roles: CitySleepsRole[] = [...Array.from({ length: session.config.killerCount }, () => 'killer' as const), ...(session.config.doctorEnabled ? ['doctor' as const] : []), ...(session.config.detectiveEnabled ? ['detective' as const] : [])];
    while (roles.length < session.players.length) roles.push('citizen');
    const shuffled = this.random.shuffle(roles);
    const playerStates = session.players.map((player, index): CitySleepsPlayerState => ({ playerId: player.id, role: shuffled[index], team: CITY_SLEEPS_ROLES[shuffled[index]].team, alive: true }));
    return { ...session, phase: 'role-handoff', playerStates, roleRevealIndex: 0, currentPlayerIndex: 0, ritualStep: 0, nightNumber: 0, actions: {}, votes: {}, lastNightResult: null, lastVoteResult: null, winner: null };
  }
  roleFor(session: CitySleepsSession, playerId: string): CitySleepsRole { return this.stateFor(session, playerId).role; }
  finishRoleReveal(session: CitySleepsSession): CitySleepsSession { this.assertPhase(session, 'role-handoff'); return session.roleRevealIndex >= session.players.length - 1 ? { ...session, phase: 'night-intro' } : { ...session, roleRevealIndex: session.roleRevealIndex + 1 }; }
  startNight(session: CitySleepsSession): CitySleepsSession { this.assertPhase(session, 'night-intro'); return { ...session, phase: 'night-handoff', currentPlayerIndex: this.aliveIndexes(session)[0], nightNumber: session.nightNumber + 1, actions: {}, votes: {}, ritualStep: 0, lastNightResult: null, lastVoteResult: null }; }
  beginNightTurn(session: CitySleepsSession): CitySleepsSession { this.assertPhase(session, 'night-handoff'); return { ...session, phase: 'night-ritual', ritualStep: 0 }; }
  advanceNightRitual(session: CitySleepsSession): CitySleepsSession { this.assertPhase(session, 'night-ritual'); return session.ritualStep + 1 >= NIGHT_RITUAL_STEPS ? { ...session, phase: 'night-action' } : { ...session, ritualStep: session.ritualStep + 1 }; }
  validTargets(session: CitySleepsSession, actorId: string): Player[] { const role = this.roleFor(session, actorId); return this.alivePlayers(session).filter((player) => role === 'doctor' || player.id !== actorId); }
  submitNightAction(session: CitySleepsSession, action: NightAction): CitySleepsSession {
    this.assertPhase(session, 'night-action'); const actor = this.currentPlayer(session); const role = this.roleFor(session, actor.id);
    if (action.kind !== role && !(role === 'citizen' && action.kind === 'citizen')) throw new Error('A ação não corresponde ao papel.');
    if (action.kind !== 'citizen' && !this.validTargets(session, actor.id).some((target) => target.id === action.targetPlayerId)) throw new Error('Alvo inválido.');
    return { ...session, actions: { ...session.actions, [actor.id]: action }, phase: role === 'detective' ? 'detective-result' : 'night-confirm' };
  }
  investigationTeam(session: CitySleepsSession, detectiveId: string): 'city' | 'evil' { const action = session.actions[detectiveId]; if (!action || action.kind !== 'detective') throw new Error('A investigação ainda não foi registrada.'); return this.stateFor(session, action.targetPlayerId).team; }
  acknowledgeInvestigation(session: CitySleepsSession): CitySleepsSession { this.assertPhase(session, 'detective-result'); return { ...session, phase: 'night-confirm' }; }
  finishNightTurn(session: CitySleepsSession): CitySleepsSession { this.assertPhase(session, 'night-confirm'); const indexes = this.aliveIndexes(session); const position = indexes.indexOf(session.currentPlayerIndex); return position < indexes.length - 1 ? { ...session, phase: 'night-handoff', currentPlayerIndex: indexes[position + 1], ritualStep: 0 } : this.resolveNight(session); }
  resolveNight(session: CitySleepsSession): CitySleepsSession {
    const attacks = Object.values(session.actions).filter((action): action is Extract<NightAction, { kind: 'killer' }> => action.kind === 'killer').map((action) => action.targetPlayerId);
    if (!attacks.length) throw new Error('Nenhum ataque foi registrado.'); const attackTarget = this.mostVoted(attacks);
    const protections = Object.values(session.actions).filter((action): action is Extract<NightAction, { kind: 'doctor' }> => action.kind === 'doctor').map((action) => action.targetPlayerId);
    const protectedAttack = protections.includes(attackTarget); const playerStates = protectedAttack ? session.playerStates : this.kill(session.playerStates, attackTarget); const winner = this.winnerFor(playerStates);
    return { ...session, playerStates, winner, phase: winner ? 'game-over' : 'night-result', lastNightResult: { eliminatedPlayerId: protectedAttack ? null : attackTarget, protected: protectedAttack } };
  }
  startDay(session: CitySleepsSession): CitySleepsSession { this.assertPhase(session, 'night-result'); return { ...session, phase: 'day' }; }
  startVoting(session: CitySleepsSession): CitySleepsSession { this.assertPhase(session, 'day'); return { ...session, phase: 'vote-handoff', currentPlayerIndex: this.aliveIndexes(session)[0], votes: {}, ritualStep: 0 }; }
  beginVoteTurn(session: CitySleepsSession): CitySleepsSession { this.assertPhase(session, 'vote-handoff'); return { ...session, phase: 'vote-ritual', ritualStep: 0 }; }
  advanceVoteRitual(session: CitySleepsSession): CitySleepsSession { this.assertPhase(session, 'vote-ritual'); return session.ritualStep + 1 >= NIGHT_RITUAL_STEPS ? { ...session, phase: 'vote-action' } : { ...session, ritualStep: session.ritualStep + 1 }; }
  submitVote(session: CitySleepsSession, targetId: string | null): CitySleepsSession { this.assertPhase(session, 'vote-action'); const voter = this.currentPlayer(session); if (targetId === voter.id || (targetId !== null && !this.alivePlayers(session).some((player) => player.id === targetId))) throw new Error('Voto inválido.'); return { ...session, votes: { ...session.votes, [voter.id]: targetId }, phase: 'vote-confirm' }; }
  finishVoteTurn(session: CitySleepsSession): CitySleepsSession { this.assertPhase(session, 'vote-confirm'); const indexes = this.aliveIndexes(session); const position = indexes.indexOf(session.currentPlayerIndex); return position < indexes.length - 1 ? { ...session, phase: 'vote-handoff', currentPlayerIndex: indexes[position + 1], ritualStep: 0 } : this.resolveVote(session); }
  resolveVote(session: CitySleepsSession): CitySleepsSession {
    const counts = new Map<string | null, number>(); Object.values(session.votes).forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1)); const highest = Math.max(...counts.values()); const leaders = [...counts.entries()].filter(([, count]) => count === highest).map(([id]) => id); const eliminated = leaders.length === 1 && leaders[0] !== null ? leaders[0] : null;
    const result: VoteResult = { eliminatedPlayerId: eliminated, tied: leaders.length > 1, skipped: leaders.includes(null) }; const playerStates = eliminated ? this.kill(session.playerStates, eliminated) : session.playerStates; const winner = this.winnerFor(playerStates);
    return { ...session, playerStates, lastVoteResult: result, winner, phase: winner ? 'game-over' : 'vote-result' };
  }
  nextNight(session: CitySleepsSession): CitySleepsSession { this.assertPhase(session, 'vote-result'); return { ...session, phase: 'night-intro', actions: {}, votes: {} }; }
  winnerFor(states: readonly CitySleepsPlayerState[]): CitySleepsWinner { const alive = states.filter((state) => state.alive); const killers = alive.filter((state) => state.role === 'killer').length; return killers === 0 ? 'city' : killers >= alive.length - killers ? 'evil' : null; }
  alivePlayers(session: CitySleepsSession): Player[] { const ids = new Set(session.playerStates.filter((state) => state.alive).map((state) => state.playerId)); return session.players.filter((player) => ids.has(player.id)); }
  currentPlayer(session: CitySleepsSession): Player { const player = session.players[session.currentPlayerIndex]; if (!player) throw new Error('Jogador atual inválido.'); return player; }
  ritualTargets(): readonly RitualTarget[] { return [{ x: this.random.integer(18, 82), y: this.random.integer(20, 75), color: 'red' }, { x: this.random.integer(18, 82), y: this.random.integer(20, 75), color: 'yellow' }]; }
  private mostVoted(ids: readonly string[]): string { const counts = new Map<string, number>(); ids.forEach((id) => counts.set(id, (counts.get(id) ?? 0) + 1)); const highest = Math.max(...counts.values()); return this.random.pick([...counts.entries()].filter(([, count]) => count === highest).map(([id]) => id)); }
  private aliveIndexes(session: CitySleepsSession): number[] { const ids = new Set(session.playerStates.filter((state) => state.alive).map((state) => state.playerId)); return session.players.map((player, index) => ids.has(player.id) ? index : -1).filter((index) => index >= 0); }
  private stateFor(session: CitySleepsSession, playerId: string): CitySleepsPlayerState { const state = session.playerStates.find((item) => item.playerId === playerId); if (!state) throw new Error('Papel não encontrado.'); return state; }
  private kill(states: readonly CitySleepsPlayerState[], playerId: string): CitySleepsPlayerState[] { return states.map((state) => state.playerId === playerId ? { ...state, alive: false } : state); }
  private assertPlayers(players: readonly Player[]): void { if (players.length < 5 || players.length > 12) throw new RangeError('Cidade Dorme precisa de 5 a 12 participantes.'); if (new Set(players.map((p) => p.id)).size !== players.length) throw new Error('Participantes duplicados.'); }
  private assertConfig(count: number, config: CitySleepsConfig): void { const specials = config.killerCount + Number(config.doctorEnabled) + Number(config.detectiveEnabled); if (!Number.isInteger(config.killerCount) || config.killerCount < 1 || config.killerCount > this.maxKillers(count)) throw new RangeError('Quantidade de assassinos inválida.'); if (specials > count) throw new RangeError('Não há participantes suficientes para essa composição.'); }
  private assertPhase(session: CitySleepsSession, phase: CitySleepsSession['phase']): void { if (session.phase !== phase) throw new Error(`A ação não é permitida na etapa ${session.phase}.`); }
}
