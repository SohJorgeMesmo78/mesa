import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { LocationConfig, LocationGameMode } from '../../core/game-engine/location/location.models';

@Component({
  selector: 'app-location-config',
  templateUrl: './location-config.component.html',
  styleUrl: './location-config.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocationConfigComponent {
  readonly config = input.required<LocationConfig>();
  readonly maxImpostors = input.required<number>();
  readonly impostorCountChange = output<number>();
  readonly modeChange = output<LocationGameMode>();
  readonly giveHintChange = output<boolean>();
}
