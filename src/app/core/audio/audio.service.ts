import { Injectable } from '@angular/core';

interface WebkitAudioWindow extends Window {
  webkitAudioContext?: typeof AudioContext;
}

@Injectable({ providedIn: 'root' })
export class AudioService {
  private context: AudioContext | null = null;

  beep(frequency: number, duration = 0.1, delay = 0): void {
    if (typeof window === 'undefined') return;
    const AudioContextConstructor = window.AudioContext ?? (window as WebkitAudioWindow).webkitAudioContext;
    if (!AudioContextConstructor) return;
    try {
      this.context ??= new AudioContextConstructor();
      const oscillator = this.context.createOscillator();
      const gain = this.context.createGain();
      oscillator.type = 'sine';
      const startsAt = this.context.currentTime + delay;
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.08, startsAt);
      gain.gain.exponentialRampToValueAtTime(0.001, startsAt + duration);
      oscillator.connect(gain);
      gain.connect(this.context.destination);
      oscillator.start(startsAt);
      oscillator.stop(startsAt + duration);
    } catch {
      // Som é opcional e nunca deve interromper a rodada.
    }
  }
}
