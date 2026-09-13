import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { findGame } from '../../catalog/game-catalog';
import { LOCATION_CONTENT } from '../../content/onde-estou/locations';
import { LocationEngine } from '../../core/game-engine/location/location.engine';
import { LocationGameMode } from '../../core/game-engine/location/location.models';
import { Player, createPlayers } from '../../core/players/player.model';
import { SessionStore } from '../../core/session/session.store';
import { BrandLogoComponent } from '../../layout/brand-logo/brand-logo.component';
import { PlayerSetupComponent } from '../../shared/player-setup/player-setup.component';
import { PrivateRevealComponent } from '../../shared/private-reveal/private-reveal.component';
import { LocationConfigComponent } from './location-config.component';

@Component({
  selector: 'app-onde-estou',
  imports: [RouterLink, BrandLogoComponent, PlayerSetupComponent, PrivateRevealComponent, LocationConfigComponent],
  templateUrl: './onde-estou.component.html',
  styleUrl: './onde-estou.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OndeEstouComponent {
  private readonly engine = inject(LocationEngine);
  private readonly sessionStore = inject(SessionStore);
  readonly activeGame = this.sessionStore.activeLocation;
  readonly limits = findGame('onde-estou')!.players;
  readonly maxPlayers = this.limits.max ?? this.limits.min;
  readonly currentPlayer = computed(() => {
    const session = this.activeGame();
    return session?.players[session.currentPlayerIndex];
  });
  readonly currentPrivateInfo = computed(() => {
    const session = this.activeGame();
    const player = this.currentPlayer();
    return session && player ? this.engine.privateInfo(session, player.id) : null;
  });
  readonly maxImpostors = computed(() => this.engine.maxImpostors(this.activeGame()?.players.length ?? 3));
  readonly impostors = computed(() => {
    const session = this.activeGame();
    return session?.players.filter((player) => session.impostorPlayerIds.includes(player.id)) ?? [];
  });

  constructor() {
    if (!this.activeGame()) this.sessionStore.setLocationSession(this.engine.createSetup(createPlayers(3)));
  }

  updatePlayers(players: Player[]): void {
    const session = this.activeGame();
    if (!session) return;
    this.sessionStore.setLocationSession(this.engine.updateSetup(session, players, {
      ...session.config,
      impostorCount: Math.min(session.config.impostorCount, this.engine.maxImpostors(players.length)),
    }));
  }

  setImpostorCount(impostorCount: number): void { this.updateConfig({ impostorCount }); }
  setMode(mode: LocationGameMode): void { this.updateConfig({ mode }); }
  setGiveHint(giveHint: boolean): void { this.updateConfig({ giveHint }); }

  startRound(players: Player[]): void {
    const session = this.activeGame();
    if (!session) return;
    const configured = this.engine.updateSetup(session, players, session.config);
    this.sessionStore.setLocationSession(this.engine.startRound(configured, LOCATION_CONTENT));
  }

  hideCurrent(): void {
    const session = this.activeGame();
    if (session) this.sessionStore.setLocationSession(this.engine.hideCurrent(session));
  }

  showResults(): void {
    const session = this.activeGame();
    if (session) this.sessionStore.setLocationSession(this.engine.showResults(session));
  }

  newRound(): void {
    const session = this.activeGame();
    if (session) this.sessionStore.setLocationSession(this.engine.startRound(session, LOCATION_CONTENT));
  }

  leaveGame(): void { this.sessionStore.clearActiveGame(); }

  private updateConfig(changes: Partial<{ impostorCount: number; mode: LocationGameMode; giveHint: boolean }>): void {
    const session = this.activeGame();
    if (!session) return;
    this.sessionStore.setLocationSession(this.engine.updateSetup(session, session.players, { ...session.config, ...changes }));
  }
}
