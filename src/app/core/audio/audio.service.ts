import { Injectable } from '@angular/core';

interface WebkitAudioWindow extends Window {
  webkitAudioContext?: typeof AudioContext;
}

@Injectable({ providedIn: 'root' })
export class AudioService {
  private context: AudioContext | null = null;

  beep(frequency: number, duration = 0.1): void {
    if (typeof window === 'undefined') return;
    const AudioContextConstructor = window.AudioContext ?? (window as WebkitAudioWindow).webkitAudioContext;
    if (!AudioContextConstructor) return;
    try {
      this.context ??= new AudioContextConstructor();
      const oscillator = this.context.createOscillator();
      const gain = this.context.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.08, this.context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + duration);
      oscillator.connect(gain);
      gain.connect(this.context.destination);
      oscillator.start();
      oscillator.stop(this.context.currentTime + duration);
    } catch {
      // Som é opcional e nunca deve interromper a rodada.
    }
  }
}
