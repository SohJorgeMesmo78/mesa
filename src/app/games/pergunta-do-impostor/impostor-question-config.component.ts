import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { AnswerMode, ImpostorQuestionConfig } from '../../core/game-engine/impostor-question/impostor-question.models';

@Component({
  selector: 'app-impostor-question-config',
  templateUrl: './impostor-question-config.component.html',
  styleUrl: './impostor-question-config.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImpostorQuestionConfigComponent {
  readonly config = input.required<ImpostorQuestionConfig>();
  readonly maxImpostors = input.required<number>();
  readonly configChange = output<ImpostorQuestionConfig>();

  setImpostorCount(impostorCount: number): void {
    this.configChange.emit({ ...this.config(), impostorCount });
  }

  setAnswerMode(answerMode: AnswerMode): void {
    this.configChange.emit({ ...this.config(), answerMode });
  }
}
