import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { findGame } from '../../catalog/game-catalog';
import { BrandLogoComponent } from '../../layout/brand-logo/brand-logo.component';

@Component({
  selector: 'app-game-unavailable',
  imports: [RouterLink, BrandLogoComponent],
  templateUrl: './game-unavailable.component.html',
  styleUrl: './game-unavailable.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameUnavailableComponent {
  readonly slug = input.required<string>();
  readonly game = computed(() => findGame(this.slug()));
}
