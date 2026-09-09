import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HOT_POTATO_THEMES } from '../../content/batata-quente/themes';
import { AudioService } from '../../core/audio/audio.service';
import { HotPotatoEngine } from '../../core/game-engine/hot-potato/hot-potato.engine';
import { HOT_POTATO_DURATIONS, HotPotatoDuration } from '../../core/game-engine/hot-potato/hot-potato.models';
import { HapticsService } from '../../core/haptics/haptics.service';
import { createPlayers, Player } from '../../core/players/player.model';
import { ExperiencePreferences } from '../../core/session/session.models';
import { SessionStore } from '../../core/session/session.store';
import { BrandLogoComponent } from '../../layout/brand-logo/brand-logo.component';
import { PlayerSetupComponent } from '../../shared/player-setup/player-setup.component';
import { TimerComponent } from '../../shared/timer/timer.component';

@Component({
  selector: 'app-batata-quente',
  imports: [RouterLink, BrandLogoComponent, PlayerSetupComponent, TimerComponent],
  templateUrl: './batata-quente.component.html',
  styleUrl: './batata-quente.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BatataQuenteComponent {
  private readonly engine = inject(HotPotatoEngine);
  private readonly sessionStore = inject(SessionStore);
  private readonly audio = inject(AudioService);
  private readonly haptics = inject(HapticsService);
  readonly activeGame = this.sessionStore.activeHotPotato;
  readonly preferences = this.sessionStore.preferences;
  readonly durations = HOT_POTATO_DURATIONS;
  readonly currentPlayer = computed(() => {
    const session = this.activeGame();
    return session?.players[session.currentPlayerIndex];
  });
  readonly loser = computed(() => {
    const session = this.activeGame();
    return session?.players.find((player) => player.id === session.loserPlayerId);
  });

  constructor() {
    const restored = this.activeGame();
    if (!restored) {
      this.sessionStore.setHotPotatoSession(this.engine.createSetup(createPlayers(4), HOT_POTATO_THEMES));
    } else if (restored.phase === 'playing') {
      this.sessionStore.setHotPotatoSession(this.engine.reconcile(restored, Date.now()));
    }
  }

  updatePlayers(players: Player[]): void {
    const session = this.activeGame();
    if (session?.phase === 'setup') this.sessionStore.setHotPotatoSession(this.engine.updateSetup(session, players, session.durationSeconds));
  }

  setDuration(duration: HotPotatoDuration): void {
    const session = this.activeGame();
    if (session?.phase === 'setup') this.sessionStore.setHotPotatoSession(this.engine.updateSetup(session, session.players, duration));
  }

  prepare(players: Player[]): void {
    const session = this.activeGame();
    if (session?.phase === 'setup') this.sessionStore.setHotPotatoSession(this.engine.prepare(session, players));
  }

  changeTheme(): void {
    const session = this.activeGame();
    if (session) this.sessionStore.setHotPotatoSession(this.engine.changeTheme(session, HOT_POTATO_THEMES));
  }

  startRound(): void {
    const session = this.activeGame();
    if (!session) return;
    this.sessionStore.setHotPotatoSession(this.engine.startRound(session, Date.now()));
    if (this.preferences().sound) this.audio.beep(520, .08);
  }

  passTurn(): void {
    const session = this.activeGame();
    if (!session) return;
    const next = this.engine.passTurn(session, Date.now());
    this.sessionStore.setHotPotatoSession(next);
    if (next.phase === 'playing' && this.preferences().haptics) this.haptics.vibrate(45);
    if (next.phase === 'result') this.finishFeedback();
  }

  handleTick(seconds: number): void {
    if (!this.preferences().sound || seconds <= 0 || seconds > 10) return;
    const frequency = seconds <= 3 ? 1040 : 760;
    this.audio.beep(frequency, .055);
    if (seconds <= 3) this.audio.beep(frequency + 100, .055, .32);
  }

  finishRound(): void {
    const session = this.activeGame();
    if (!session || session.phase !== 'playing') return;
    const result = this.engine.reconcile(session, Date.now());
    if (result.phase !== 'result') return;
    this.sessionStore.setHotPotatoSession(result);
    this.finishFeedback();
  }

  playAgain(): void {
    const session = this.activeGame();
    if (session) this.sessionStore.setHotPotatoSession(this.engine.prepareNextRound(session, HOT_POTATO_THEMES));
  }

  togglePreference(preference: 'sound' | 'haptics'): void {
    this.sessionStore.updatePreferences({ [preference]: !this.preferences()[preference] } satisfies Partial<ExperiencePreferences>);
  }

  leaveGame(): void { this.sessionStore.clearActiveGame(); }

  private finishFeedback(): void {
    if (this.preferences().sound) this.audio.beep(160, .65);
    if (this.preferences().haptics) this.haptics.vibrate([120, 70, 220, 70, 420]);
  }
}
