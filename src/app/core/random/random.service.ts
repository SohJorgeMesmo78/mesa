import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class RandomService {
  pick<T>(items: readonly T[], previous?: T): T {
    if (items.length === 0) throw new Error('Não é possível sortear em uma lista vazia.');
    const candidates = items.length > 1 && previous !== undefined
      ? items.filter((item) => item !== previous)
      : items;
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  integer(min: number, max: number): number {
    if (!Number.isInteger(min) || !Number.isInteger(max) || min > max) {
      throw new RangeError('O intervalo do sorteio é inválido.');
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  }

  shuffle<T>(items: readonly T[]): T[] {
    const shuffled = [...items];
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const target = this.integer(0, index);
      [shuffled[index], shuffled[target]] = [shuffled[target], shuffled[index]];
    }
    return shuffled;
  }

  uniqueIntegers(count: number, min: number, max: number): number[] {
    const available = Array.from({ length: max - min + 1 }, (_, index) => min + index);
    if (!Number.isInteger(count) || count < 0 || count > available.length) {
      throw new RangeError('A quantidade de números únicos é inválida.');
    }
    return this.shuffle(available).slice(0, count);
  }
}
