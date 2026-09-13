import { ChangeDetectionStrategy, Component, ElementRef, computed, inject, input, output } from '@angular/core';
import { Player } from '../../core/players/player.model';

export interface ItoClueChange {
  readonly playerId: string;
  readonly clue: string;
}

export interface ItoOrderMove {
  readonly playerId: string;
  readonly targetIndex: number;
}

@Component({
  selector: 'app-ito-order-editor',
  templateUrl: './ito-order-editor.component.html',
  styleUrl: './ito-order-editor.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItoOrderEditorComponent {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private draggedPlayerId: string | null = null;

  readonly players = input.required<readonly Player[]>();
  readonly clues = input.required<Readonly<Record<string, string>>>();
  readonly order = input.required<readonly string[]>();
  readonly lowLabel = input.required<string>();
  readonly highLabel = input.required<string>();
  readonly clueChange = output<ItoClueChange>();
  readonly orderMove = output<ItoOrderMove>();
  readonly playerById = computed(() => new Map(this.players().map((player) => [player.id, player])));

  updateClue(playerId: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    this.clueChange.emit({ playerId, clue: input.value });
  }

  moveBy(playerId: string, direction: -1 | 1): void {
    const currentIndex = this.order().indexOf(playerId);
    const targetIndex = currentIndex + direction;
    if (targetIndex >= 0 && targetIndex < this.order().length) {
      this.orderMove.emit({ playerId, targetIndex });
    }
  }

  startPointer(event: PointerEvent, playerId: string): void {
    if (event.button !== 0) return;
    this.draggedPlayerId = playerId;
    try {
      (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    } catch {
      // Ambientes de automação podem não registrar o ponteiro; o reorder continua funcional.
    }
  }

  movePointer(event: PointerEvent): void {
    if (!this.draggedPlayerId) return;
    event.preventDefault();
    const cards = [...this.element.nativeElement.querySelectorAll<HTMLElement>('[data-guess-player]')];
    if (cards.length === 0) return;
    const target = cards.reduce((closest, card) => {
      const center = card.getBoundingClientRect().top + card.getBoundingClientRect().height / 2;
      const closestCenter = closest.getBoundingClientRect().top + closest.getBoundingClientRect().height / 2;
      return Math.abs(event.clientY - center) < Math.abs(event.clientY - closestCenter) ? card : closest;
    });
    const targetPlayerId = target.dataset['guessPlayer'];
    if (targetPlayerId) this.moveTo(this.draggedPlayerId, targetPlayerId);
  }

  endPointer(): void {
    this.draggedPlayerId = null;
  }

  private moveTo(playerId: string, targetPlayerId: string): void {
    const targetIndex = this.order().indexOf(targetPlayerId);
    if (playerId !== targetPlayerId && targetIndex >= 0) {
      this.orderMove.emit({ playerId, targetIndex });
    }
  }
}
