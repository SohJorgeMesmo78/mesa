import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({ selector: 'app-impostor-answer-input', templateUrl: './impostor-answer-input.component.html', styleUrl: './impostor-answer-input.component.scss', changeDetection: ChangeDetectionStrategy.OnPush })
export class ImpostorAnswerInputComponent {
  readonly value = input.required<string>();
  readonly valueChange = output<string>();
}
