import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ImpostorConfig, ImpostorMode } from '../../core/game-engine/impostor/impostor.models';

@Component({
  selector: 'app-impostor-config',
  templateUrl: './impostor-config.component.html',
  styleUrl: './impostor-config.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImpostorConfigComponent {
  readonly config = input.required<ImpostorConfig>();
  readonly maxImpostors = input.required<number>();
  readonly impostorCountChange = output<number>();
  readonly modeChange = output<ImpostorMode>();
  readonly giveHintChange = output<boolean>();
}
