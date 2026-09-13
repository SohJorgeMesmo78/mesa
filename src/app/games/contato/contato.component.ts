import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CONTACT_WORDS } from '../../content/contato/words';
import { ContactEngine } from '../../core/game-engine/contact/contact.engine';
import { ExperiencePreferences } from '../../core/session/session.models';
import { SessionStore } from '../../core/session/session.store';
import { BrandLogoComponent } from '../../layout/brand-logo/brand-logo.component';
import { CountdownComponent } from '../../shared/countdown/countdown.component';

@Component({ selector: 'app-contato', imports: [RouterLink, BrandLogoComponent, CountdownComponent], templateUrl: './contato.component.html', styleUrl: './contato.component.scss', changeDetection: ChangeDetectionStrategy.OnPush })
export class ContatoComponent {
  private readonly engine = inject(ContactEngine); private readonly store = inject(SessionStore);
  readonly game = this.store.activeContact; readonly preferences = this.store.preferences;
  constructor() {
    const restored = this.game();
    if (!restored) this.store.setContactSession(this.engine.create(CONTACT_WORDS));
    else if (restored.phase !== 'ready') this.store.setContactSession({ ...restored, phase: 'ready' });
  }
  reveal(): void { const game = this.game(); if (game) this.store.setContactSession(this.engine.reveal(game, this.preferences().countdown)); }
  finishCountdown(): void { const game = this.game(); if (game) this.store.setContactSession(this.engine.finishCountdown(game)); }
  newRound(): void { const game = this.game(); if (game) this.store.setContactSession(this.engine.newRound(game, CONTACT_WORDS)); }
  toggle(key: keyof ExperiencePreferences): void { this.store.updatePreferences({ [key]: !this.preferences()[key] }); }
  leave(): void { this.store.clearActiveGame(); }
}
