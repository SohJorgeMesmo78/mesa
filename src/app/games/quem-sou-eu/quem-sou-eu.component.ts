import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WHO_AM_I_IDENTITIES } from '../../content/quem-sou-eu/identities';
import { RandomService } from '../../core/random/random.service';
import { ExperiencePreferences } from '../../core/session/session.models';
import { SessionStore } from '../../core/session/session.store';
import { BrandLogoComponent } from '../../layout/brand-logo/brand-logo.component';
import { CountdownComponent } from '../../shared/countdown/countdown.component';

@Component({
  selector: 'app-quem-sou-eu',
  imports: [RouterLink, BrandLogoComponent, CountdownComponent],
  templateUrl: './quem-sou-eu.component.html',
  styleUrl: './quem-sou-eu.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuemSouEuComponent {
  private readonly random = inject(RandomService);
  readonly sessionStore = inject(SessionStore);
  readonly activeGame = this.sessionStore.activeWhoAmI;
  readonly preferences = this.sessionStore.preferences;

  startRound(): void {
    const identity = this.random.pick(WHO_AM_I_IDENTITIES, this.activeGame()?.identity);
    this.sessionStore.beginWhoAmIRound(identity);
  }

  finishCountdown(): void { this.sessionStore.revealWhoAmI(); }

  togglePreference(preference: keyof ExperiencePreferences): void {
    this.sessionStore.updatePreferences({ [preference]: !this.preferences()[preference] });
  }

  identitySize(identity: string): 'short' | 'medium' | 'long' {
    if (identity.length <= 10) return 'short';
    if (identity.length <= 18) return 'medium';
    return 'long';
  }

  leaveGame(): void { this.sessionStore.clearActiveGame(); }
}
