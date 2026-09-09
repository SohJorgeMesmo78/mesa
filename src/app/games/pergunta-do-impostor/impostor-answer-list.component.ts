import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Player } from '../../core/players/player.model';

@Component({ selector: 'app-impostor-answer-list', templateUrl: './impostor-answer-list.component.html', styleUrl: './impostor-answer-list.component.scss', changeDetection: ChangeDetectionStrategy.OnPush })
export class ImpostorAnswerListComponent {
  readonly players = input.required<readonly Player[]>();
  readonly answers = input.required<Readonly<Record<string, string>>>();
  readonly title = input('Respostas');
}
