import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { findGame } from '../game-catalog';
import { SiteFooterComponent } from '../../layout/site-footer/site-footer.component';
import { SiteHeaderComponent } from '../../layout/site-header/site-header.component';
import { GameArtworkComponent } from '../../shared/game-artwork/game-artwork.component';

@Component({
  selector: 'app-game-details',
  imports: [RouterLink, SiteHeaderComponent, SiteFooterComponent, GameArtworkComponent],
  templateUrl: './game-details.component.html',
  styleUrl: './game-details.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameDetailsComponent {
  private readonly title = inject(Title);
  readonly slug = input.required<string>();
  readonly game = computed(() => findGame(this.slug()));

  constructor() {
    effect(() => this.title.setTitle(this.game() ? `${this.game()?.name} — Mesa` : 'Jogo não encontrado — Mesa'));
  }

  playerLabel(): string {
    const players = this.game()?.players;
    if (!players) return '';
    return players.max ? `${players.min}–${players.max} pessoas` : `${players.min}+ pessoas`;
  }
}
