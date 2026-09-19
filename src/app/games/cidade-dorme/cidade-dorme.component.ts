import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { findGame } from '../../catalog/game-catalog';
import { CitySleepsEngine } from '../../core/game-engine/city-sleeps/city-sleeps.engine';
import { CITY_SLEEPS_ROLES, CitySleepsConfig, CitySleepsRole, NightAction, RitualTarget } from '../../core/game-engine/city-sleeps/city-sleeps.models';
import { createPlayers, Player } from '../../core/players/player.model';
import { SessionStore } from '../../core/session/session.store';
import { BrandLogoComponent } from '../../layout/brand-logo/brand-logo.component';
import { PlayerSetupComponent } from '../../shared/player-setup/player-setup.component';
import { PrivateRevealComponent } from '../../shared/private-reveal/private-reveal.component';

@Component({
  selector: 'app-cidade-dorme',
  imports: [RouterLink, BrandLogoComponent, PlayerSetupComponent, PrivateRevealComponent],
  templateUrl: './cidade-dorme.component.html',
  styleUrl: './cidade-dorme.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CidadeDormeComponent {
  readonly engine = inject(CitySleepsEngine);
  private readonly store = inject(SessionStore);
  private holdTimer: ReturnType<typeof setTimeout> | null = null;
  readonly game = this.store.activeCitySleeps;
  readonly roles = CITY_SLEEPS_ROLES;
  readonly limits = findGame('cidade-dorme')!.players;
  readonly ritualTargets = signal<readonly RitualTarget[]>(this.engine.ritualTargets());
  readonly selectedTarget = signal<string | null>(null);
  readonly selectedSymbol = signal<'moon' | 'star' | 'key' | null>(null);
  readonly currentPlayer = computed(() => { const game = this.game(); return game ? game.players[game.currentPlayerIndex] : undefined; });
  readonly rolePlayer = computed(() => { const game = this.game(); return game ? game.players[game.roleRevealIndex] : undefined; });
  readonly currentRole = computed(() => { const game = this.game(); const player = this.currentPlayer(); return game && player ? this.engine.roleFor(game, player.id) : null; });
  readonly alivePlayers = computed(() => { const game = this.game(); return game ? this.engine.alivePlayers(game) : []; });
  readonly targets = computed(() => { const game = this.game(); const player = this.currentPlayer(); return game && player ? this.engine.validTargets(game, player.id) : []; });
  readonly voteTargets = computed(() => { const player = this.currentPlayer(); return this.alivePlayers().filter((candidate) => candidate.id !== player?.id); });
  readonly eliminatedAtNight = computed(() => this.playerById(this.game()?.lastNightResult?.eliminatedPlayerId ?? null));
  readonly eliminatedByVote = computed(() => this.playerById(this.game()?.lastVoteResult?.eliminatedPlayerId ?? null));

  constructor() { if (!this.game()) this.store.setCitySleepsSession(this.engine.createSetup(createPlayers(5))); }

  updatePlayers(players: Player[]): void {
    const game = this.game(); if (!game) return;
    const killerCount = this.engine.suggestedKillers(players.length);
    this.save(this.engine.updateSetup(game, players, { ...game.config, killerCount }));
  }
  setConfig(change: Partial<CitySleepsConfig>): void { const game = this.game(); if (game) this.save(this.engine.updateSetup(game, game.players, { ...game.config, ...change })); }
  start(players: Player[]): void { const game = this.game(); if (game) this.save(this.engine.startGame(this.engine.updateSetup(game, players, game.config))); }
  finishRole(): void { const game = this.game(); if (game) this.save(this.engine.finishRoleReveal(game)); }
  startNight(): void { const game = this.game(); if (game) { this.resetPrivate(); this.save(this.engine.startNight(game)); } }
  beginNightTurn(): void { const game = this.game(); if (game) { this.resetPrivate(); this.save(this.engine.beginNightTurn(game)); } }
  advanceNightRitual(): void { const game = this.game(); if (game) this.save(this.engine.advanceNightRitual(game)); }
  submitAction(): void {
    const game = this.game(); const role = this.currentRole(); if (!game || !role) return;
    let action: NightAction;
    if (role === 'citizen') { const symbol = this.selectedSymbol(); if (!symbol) return; action = { kind: 'citizen', symbol }; }
    else { const targetPlayerId = this.selectedTarget(); if (!targetPlayerId) return; action = { kind: role, targetPlayerId } as NightAction; }
    this.save(this.engine.submitNightAction(game, action));
  }
  acknowledgeInvestigation(): void { const game = this.game(); if (game) this.save(this.engine.acknowledgeInvestigation(game)); }
  investigationText(): string { const game = this.game(); const player = this.currentPlayer(); return game && player && this.engine.investigationTeam(game, player.id) === 'city' ? 'É do time da cidade' : 'Não é do time da cidade'; }
  startHold(): void { this.cancelHold(); this.holdTimer = setTimeout(() => this.finishPrivateTurn(), 1100); }
  cancelHold(): void { if (this.holdTimer) clearTimeout(this.holdTimer); this.holdTimer = null; }
  finishPrivateTurn(): void { this.cancelHold(); const game = this.game(); if (!game) return; this.resetPrivate(); this.save(game.phase === 'night-confirm' ? this.engine.finishNightTurn(game) : this.engine.finishVoteTurn(game)); }
  startDay(): void { const game = this.game(); if (game) this.save(this.engine.startDay(game)); }
  startVoting(): void { const game = this.game(); if (game) { this.resetPrivate(); this.save(this.engine.startVoting(game)); } }
  beginVoteTurn(): void { const game = this.game(); if (game) { this.resetPrivate(); this.save(this.engine.beginVoteTurn(game)); } }
  advanceVoteRitual(): void { const game = this.game(); if (game) this.save(this.engine.advanceVoteRitual(game)); }
  submitVote(target: string | null): void { const game = this.game(); if (game) this.save(this.engine.submitVote(game, target)); }
  nextNight(): void { const game = this.game(); if (game) this.save(this.engine.nextNight(game)); }
  newGame(): void { const game = this.game(); if (game) this.save(this.engine.startGame(game)); }
  roleName(role: CitySleepsRole): string { return this.roles[role].name; }
  stateFor(playerId: string) { return this.game()?.playerStates.find((state) => state.playerId === playerId); }
  leave(): void { this.store.clearActiveGame(); }
  private resetPrivate(): void { this.selectedTarget.set(null); this.selectedSymbol.set(null); this.ritualTargets.set(this.engine.ritualTargets()); }
  private save(game: NonNullable<ReturnType<typeof this.game>>): void { this.store.setCitySleepsSession(game); }
  private playerById(id: string | null): Player | undefined { return id ? this.game()?.players.find((player) => player.id === id) : undefined; }
}
