import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { findGame } from '../../catalog/game-catalog';
import { IMPOSTOR_CONTENT } from '../../content/impostor/words';
import { ImpostorEngine } from '../../core/game-engine/impostor/impostor.engine';
import { ImpostorMode } from '../../core/game-engine/impostor/impostor.models';
import { Player, createPlayers } from '../../core/players/player.model';
import { SessionStore } from '../../core/session/session.store';
import { BrandLogoComponent } from '../../layout/brand-logo/brand-logo.component';
import { PlayerSetupComponent } from '../../shared/player-setup/player-setup.component';
import { PrivateRevealComponent } from '../../shared/private-reveal/private-reveal.component';
import { ImpostorConfigComponent } from './impostor-config.component';

@Component({
  selector: 'app-impostor',
  imports: [RouterLink, BrandLogoComponent, PlayerSetupComponent, PrivateRevealComponent, ImpostorConfigComponent],
  templateUrl: './impostor.component.html',
  styleUrl: './impostor.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImpostorComponent {
  private readonly engine = inject(ImpostorEngine);
  private readonly sessionStore = inject(SessionStore);
  readonly activeGame = this.sessionStore.activeImpostor;
  readonly playerLimits = findGame('impostor')!.players;
  readonly maxPlayers = this.playerLimits.max ?? this.playerLimits.min;
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
    if (!this.activeGame()) this.sessionStore.setImpostorSession(this.engine.createSetup(createPlayers(3)));
  }

  updatePlayers(players: Player[]): void {
    const session = this.activeGame();
    if (!session) return;
    const impostorCount = Math.min(session.config.impostorCount, this.engine.maxImpostors(players.length));
    this.sessionStore.setImpostorSession(this.engine.updateSetup(session, players, {
      ...session.config,
      impostorCount,
    }));
  }

  setImpostorCount(impostorCount: number): void {
    const session = this.activeGame();
    if (!session) return;
    this.sessionStore.setImpostorSession(this.engine.updateSetup(session, session.players, {
      ...session.config,
      impostorCount,
    }));
  }

  setMode(mode: ImpostorMode): void {
    this.updateConfig({ mode });
  }

  setGiveHint(giveHint: boolean): void {
    this.updateConfig({ giveHint });
  }

  startRound(players: Player[]): void {
    const session = this.activeGame();
    if (!session) return;
    const configured = this.engine.updateSetup(session, players, session.config);
    this.sessionStore.setImpostorSession(this.engine.startRound(configured, IMPOSTOR_CONTENT));
  }

  hideCurrent(): void {
    const session = this.activeGame();
    if (session) this.sessionStore.setImpostorSession(this.engine.hideCurrent(session));
  }

  showResults(): void {
    const session = this.activeGame();
    if (session) this.sessionStore.setImpostorSession(this.engine.showResults(session));
  }

  newRound(): void {
    const session = this.activeGame();
    if (session) this.sessionStore.setImpostorSession(this.engine.startRound(session, IMPOSTOR_CONTENT));
  }

  leaveGame(): void {
    this.sessionStore.clearActiveGame();
  }

  private updateConfig(changes: Partial<{ mode: ImpostorMode; giveHint: boolean }>): void {
    const session = this.activeGame();
    if (!session) return;
    this.sessionStore.setImpostorSession(this.engine.updateSetup(session, session.players, {
      ...session.config,
      ...changes,
    }));
  }
}
