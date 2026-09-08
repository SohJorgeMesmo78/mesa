import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { ItoAssignment, ItoScore } from '../../core/game-engine/ito/ito.models';
import { Player } from '../../core/players/player.model';

@Component({
  selector: 'app-ito-result',
  templateUrl: './ito-result.component.html',
  styleUrl: './ito-result.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItoResultComponent {
  readonly players = input.required<readonly Player[]>();
  readonly assignments = input.required<readonly ItoAssignment[]>();
  readonly clues = input.required<Readonly<Record<string, string>>>();
  readonly guessedOrder = input.required<readonly string[]>();
  readonly correctOrder = input.required<readonly string[]>();
  readonly revealedPlayerIds = input.required<readonly string[]>();
  readonly score = input.required<ItoScore>();
  readonly showCorrectOrder = input.required<boolean>();
  readonly revealPlayer = output<string>();
  readonly correctOrderToggle = output<void>();
  readonly newRound = output<void>();

  readonly playerById = computed(() => new Map(this.players().map((player) => [player.id, player])));
  readonly numberById = computed(() => new Map(this.assignments().map((item) => [item.playerId, item.number])));
  readonly displayOrder = computed(() => this.showCorrectOrder() ? this.correctOrder() : this.guessedOrder());
  readonly allRevealed = computed(() => this.revealedPlayerIds().length === this.players().length);

  isRevealed(playerId: string): boolean {
    return this.showCorrectOrder() || this.revealedPlayerIds().includes(playerId);
  }

  isProblematic(playerId: string): boolean {
    return this.allRevealed()
      && !this.showCorrectOrder()
      && this.score().problematicPlayerIds.includes(playerId);
  }
}
