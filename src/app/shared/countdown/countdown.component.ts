import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit, output, signal } from '@angular/core';
import { AudioService } from '../../core/audio/audio.service';
import { HapticsService } from '../../core/haptics/haptics.service';
import { SessionStore } from '../../core/session/session.store';

@Component({
  selector: 'app-countdown',
  templateUrl: './countdown.component.html',
  styleUrl: './countdown.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CountdownComponent implements OnInit, OnDestroy {
  private readonly audio = inject(AudioService);
  private readonly haptics = inject(HapticsService);
  private readonly session = inject(SessionStore);
  private timer: ReturnType<typeof setInterval> | null = null;
  readonly completed = output<void>();
  readonly value = signal(3);

  ngOnInit(): void {
    this.feedback(false);
    this.timer = setInterval(() => {
      const next = this.value() - 1;
      this.value.set(next);
      if (next > 0) this.feedback(false);
      else { this.clearTimer(); this.feedback(true); this.completed.emit(); }
    }, 1000);
  }

  ngOnDestroy(): void { this.clearTimer(); }

  private feedback(final: boolean): void {
    const preferences = this.session.preferences();
    if (preferences.sound) this.audio.beep(final ? 760 : 440, final ? .25 : .08);
    if (preferences.haptics) this.haptics.vibrate(final ? [120, 70, 160] : 70);
  }

  private clearTimer(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }
}
