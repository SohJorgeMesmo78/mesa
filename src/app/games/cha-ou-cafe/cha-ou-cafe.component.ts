import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TEA_OR_COFFEE_WORDS } from '../../content/cha-ou-cafe/words';
import { TeaOrCoffeeEngine } from '../../core/game-engine/tea-or-coffee/tea-or-coffee.engine';
import { ExperiencePreferences } from '../../core/session/session.models';
import { SessionStore } from '../../core/session/session.store';
import { BrandLogoComponent } from '../../layout/brand-logo/brand-logo.component';
import { CountdownComponent } from '../../shared/countdown/countdown.component';

@Component({
  selector: 'app-cha-ou-cafe',
  imports: [RouterLink, BrandLogoComponent, CountdownComponent],
  templateUrl: './cha-ou-cafe.component.html',
  styleUrl: './cha-ou-cafe.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChaOuCafeComponent {
  private readonly engine = inject(TeaOrCoffeeEngine);
  private readonly sessionStore = inject(SessionStore);
  readonly activeGame = this.sessionStore.activeTeaOrCoffee;
  readonly preferences = this.sessionStore.preferences;

  constructor() {
    if (!this.activeGame()) {
      this.sessionStore.setTeaOrCoffeeSession(this.engine.createSession(TEA_OR_COFFEE_WORDS));
    }
  }

  revealWord(): void {
    const session = this.activeGame();
    if (session) this.sessionStore.setTeaOrCoffeeSession(this.engine.prepareReveal(session, this.preferences().countdown));
  }

  finishCountdown(): void {
    const session = this.activeGame();
    if (session) this.sessionStore.setTeaOrCoffeeSession(this.engine.finishCountdown(session));
  }

  newRound(): void {
    const session = this.activeGame();
    if (session) this.sessionStore.setTeaOrCoffeeSession(this.engine.newRound(session, TEA_OR_COFFEE_WORDS, this.preferences().countdown));
  }

  switchLeader(): void {
    const session = this.activeGame();
    if (session) this.sessionStore.setTeaOrCoffeeSession(this.engine.switchLeader(session, TEA_OR_COFFEE_WORDS));
  }

  togglePreference(preference: keyof ExperiencePreferences): void {
    this.sessionStore.updatePreferences({ [preference]: !this.preferences()[preference] });
  }

  wordSize(word: string): 'short' | 'medium' | 'long' {
    if (word.length <= 10) return 'short';
    if (word.length <= 20) return 'medium';
    return 'long';
  }

  leaveGame(): void { this.sessionStore.clearActiveGame(); }
}
