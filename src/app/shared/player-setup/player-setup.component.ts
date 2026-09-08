import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { normalizePlayers, Player, PLAYER_COLORS } from '../../core/players/player.model';

@Component({
  selector: 'app-player-setup',
  imports: [FormsModule],
  templateUrl: './player-setup.component.html',
  styleUrl: './player-setup.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerSetupComponent {
  readonly players = input.required<readonly Player[]>();
  readonly min = input.required<number>();
  readonly max = input.required<number>();
  readonly playersChange = output<Player[]>();
  readonly confirmed = output<Player[]>();

  readonly canRemove = computed(() => this.players().length > this.min());
  readonly canAdd = computed(() => this.players().length < this.max());

  changeName(index: number, name: string): void {
    this.emit(this.players().map((player, playerIndex) => playerIndex === index ? { ...player, name } : player));
  }

  addPlayer(): void {
    if (!this.canAdd()) return;
    const nextNumber = this.players().reduce((highest, player) => {
      const match = /^(?:player-)(\d+)$/.exec(player.id);
      return Math.max(highest, match ? Number(match[1]) : 0);
    }, 0) + 1;
    this.emit([...this.players(), {
      id: `player-${nextNumber}`,
      name: '',
      color: PLAYER_COLORS[this.players().length % PLAYER_COLORS.length],
    }]);
  }

  removePlayer(index: number): void {
    if (!this.canRemove()) return;
    this.emit(this.players().filter((_, playerIndex) => playerIndex !== index));
  }

  confirm(): void {
    this.confirmed.emit(normalizePlayers(this.players()));
  }

  private emit(players: readonly Player[]): void {
    this.playersChange.emit(players.map((player, index) => ({
      ...player,
      color: PLAYER_COLORS[index % PLAYER_COLORS.length],
    })));
  }
}
