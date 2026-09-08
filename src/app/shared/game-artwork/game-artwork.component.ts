import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-game-artwork',
  templateUrl: './game-artwork.component.html',
  styleUrl: './game-artwork.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameArtworkComponent {
  readonly slug = input.required<string>();
}
