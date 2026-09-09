import { ChangeDetectionStrategy, Component, effect, input, output, signal } from '@angular/core';
import { Player } from '../../core/players/player.model';

@Component({
  selector: 'app-private-reveal',
  templateUrl: './private-reveal.component.html',
  styleUrl: './private-reveal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrivateRevealComponent {
  readonly player = input.required<Player>();
  readonly current = input.required<number>();
  readonly total = input.required<number>();
  readonly hideDisabled = input(false);
  readonly isRevealed = signal(false);
  readonly hidden = output<void>();

  constructor() {
    let previousPlayerId: string | undefined;
    effect(() => {
      const playerId = this.player().id;
      if (previousPlayerId !== playerId) this.isRevealed.set(false);
      previousPlayerId = playerId;
    });
  }

  reveal(): void {
    this.isRevealed.set(true);
  }

  hide(): void {
    if (this.hideDisabled()) return;
    this.isRevealed.set(false);
    this.hidden.emit();
  }
}
