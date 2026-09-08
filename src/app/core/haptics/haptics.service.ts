import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class HapticsService {
  vibrate(pattern: number | readonly number[]): void {
    if (typeof navigator === 'undefined' || !('vibrate' in navigator)) return;
    navigator.vibrate(typeof pattern === 'number' ? pattern : [...pattern]);
  }
}
