import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GAME_CATALOG } from '../game-catalog';
import { SiteFooterComponent } from '../../layout/site-footer/site-footer.component';
import { SiteHeaderComponent } from '../../layout/site-header/site-header.component';
import { GameCardComponent } from '../../shared/game-card/game-card.component';
import { BRAND_LINKS } from '../../core/brand/brand-links';

@Component({
  selector: 'app-home',
  imports: [RouterLink, SiteHeaderComponent, SiteFooterComponent, GameCardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  readonly games = GAME_CATALOG;
  readonly links = BRAND_LINKS;
}
