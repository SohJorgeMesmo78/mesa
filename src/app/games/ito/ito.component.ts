import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { findGame } from '../../catalog/game-catalog';
import { ITO_THEMES } from '../../content/ito/themes';
import { ItoEngine } from '../../core/game-engine/ito/ito.engine';
import { createPlayers, Player } from '../../core/players/player.model';
import { SessionStore } from '../../core/session/session.store';
import { BrandLogoComponent } from '../../layout/brand-logo/brand-logo.component';
import { PlayerSetupComponent } from '../../shared/player-setup/player-setup.component';
import { PrivateRevealComponent } from '../../shared/private-reveal/private-reveal.component';
import { ItoClueChange, ItoOrderEditorComponent, ItoOrderMove } from './ito-order-editor.component';
import { ItoResultComponent } from './ito-result.component';

@Component({
  selector: 'app-ito',
  imports: [RouterLink, BrandLogoComponent, PlayerSetupComponent, PrivateRevealComponent, ItoOrderEditorComponent, ItoResultComponent],
  templateUrl: './ito.component.html',
  styleUrl: './ito.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItoComponent {
  private readonly engine = inject(ItoEngine);
  private readonly sessionStore = inject(SessionStore);
  readonly activeGame = this.sessionStore.activeIto;
  readonly playerLimits = findGame('ito')!.players;
  readonly maxPlayers = this.playerLimits.max ?? this.playerLimits.min;
  readonly currentPlayer = computed(() => {
    const session = this.activeGame();
    return session?.players[session.currentPlayerIndex];
  });
  readonly currentNumber = computed(() => {
    const session = this.activeGame();
    const player = this.currentPlayer();
    return session?.assignments.find((assignment) => assignment.playerId === player?.id)?.number;
  });
  readonly correctOrder = computed(() => {
    const session = this.activeGame();
    return session && session.assignments.length === session.players.length
      ? this.engine.correctOrder(session)
      : [];
  });
  readonly score = computed(() => {
    const session = this.activeGame();
    return session && session.assignments.length === session.players.length
      ? this.engine.score(session)
      : { correctPairs: 0, totalPairs: 0, points: 0, problematicPlayerIds: [] };
  });

  constructor() {
    if (!this.activeGame()) this.sessionStore.setItoSession(this.engine.createSetup(createPlayers(2)));
  }

  updatePlayers(players: Player[]): void {
    const session = this.activeGame();
    if (session) this.sessionStore.setItoSession(this.engine.updatePlayers(session, players));
  }

  startRound(players: Player[]): void {
    const session = this.activeGame();
    if (!session) return;
    const configured = this.engine.updatePlayers(session, players);
    this.sessionStore.setItoSession(this.engine.startRound(configured, ITO_THEMES));
  }

  updateClue(change: ItoClueChange): void {
    const session = this.activeGame();
    if (session) this.sessionStore.setItoSession(this.engine.updateClue(session, change.playerId, change.clue));
  }

  movePlayer(move: ItoOrderMove): void {
    const session = this.activeGame();
    if (session) this.sessionStore.setItoSession(this.engine.movePlayer(session, move.playerId, move.targetIndex));
  }

  hideCurrent(): void {
    const session = this.activeGame();
    if (session) this.sessionStore.setItoSession(this.engine.hideCurrent(session));
  }

  changeTheme(): void {
    const session = this.activeGame();
    if (session) this.sessionStore.setItoSession(this.engine.changeTheme(session, ITO_THEMES));
  }

  showResults(): void {
    const session = this.activeGame();
    if (session) this.sessionStore.setItoSession(this.engine.showResults(session));
  }

  revealNumber(playerId: string): void {
    const session = this.activeGame();
    if (session) this.sessionStore.setItoSession(this.engine.revealNumber(session, playerId));
  }

  toggleCorrectOrder(): void {
    const session = this.activeGame();
    if (session) this.sessionStore.setItoSession(this.engine.toggleCorrectOrder(session));
  }

  newRound(): void {
    const session = this.activeGame();
    if (session) this.sessionStore.setItoSession(this.engine.startRound(session, ITO_THEMES));
  }

  leaveGame(): void {
    this.sessionStore.clearActiveGame();
  }
}
