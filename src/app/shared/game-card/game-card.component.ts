import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GameDefinition } from '../../core/game-engine/game-definition';
import { GameArtworkComponent } from '../game-artwork/game-artwork.component';

@Component({
  selector: 'app-game-card',
  imports: [RouterLink, GameArtworkComponent],
  templateUrl: './game-card.component.html',
  styleUrl: './game-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameCardComponent {
  readonly game = input.required<GameDefinition>();
  playerLabel(): string {
    const { min, max } = this.game().players;
    return max ? `${min}–${max} pessoas` : `${min}+ pessoas`;
  }
}
