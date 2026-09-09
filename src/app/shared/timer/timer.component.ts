import { ChangeDetectionStrategy, Component, computed, DestroyRef, effect, inject, input, output, signal } from '@angular/core';

@Component({
  selector: 'app-timer',
  templateUrl: './timer.component.html',
  styleUrl: './timer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimerComponent {
  readonly startedAt = input<number | null>(null);
  readonly durationSeconds = input.required<number>();
  readonly active = input(true);
  readonly tick = output<number>();
  readonly expired = output<void>();
  readonly remaining = signal(0);
  readonly formatted = computed(() => {
    const minutes = Math.floor(this.remaining() / 60);
    const seconds = this.remaining() % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  });
  readonly urgency = computed(() => this.remaining() <= 3 ? 'final' : this.remaining() <= 10 ? 'attention' : 'normal');

  private readonly destroyRef = inject(DestroyRef);
  private intervalId: number | null = null;
  private lastSecond = -1;
  private expirationEmitted = false;

  constructor() {
    effect(() => {
      const startedAt = this.startedAt();
      const duration = this.durationSeconds();
      const active = this.active();
      this.stop();
      this.lastSecond = -1;
      this.expirationEmitted = false;
      if (!active || startedAt === null || typeof window === 'undefined') {
        this.remaining.set(duration);
        return;
      }
      this.update(startedAt, duration);
      this.intervalId = window.setInterval(() => this.update(startedAt, duration), 200);
    });
    this.destroyRef.onDestroy(() => this.stop());
  }

  private update(startedAt: number, duration: number): void {
    const remaining = Math.max(0, Math.ceil((startedAt + duration * 1000 - Date.now()) / 1000));
    this.remaining.set(remaining);
    if (remaining !== this.lastSecond) {
      this.lastSecond = remaining;
      this.tick.emit(remaining);
    }
    if (remaining === 0 && !this.expirationEmitted) {
      this.expirationEmitted = true;
      this.stop();
      this.expired.emit();
    }
  }

  private stop(): void {
    if (this.intervalId === null || typeof window === 'undefined') return;
    window.clearInterval(this.intervalId);
    this.intervalId = null;
  }
}
