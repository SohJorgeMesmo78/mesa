import { Injectable } from '@angular/core';
import { RandomService } from '../../random/random.service';
import { WordListSession } from './word-list.models';
@Injectable({ providedIn: 'root' })
export class WordListEngine {
  constructor(private readonly random: RandomService) {}
  create(): WordListSession { return { game: 'jogo-da-lista', phase: 'setup', count: 5, words: [], round: 0 }; }
  start(session: WordListSession, count: number, pool: readonly string[]): WordListSession {
    if (![5, 8, 10].includes(count) || pool.length < count) throw new RangeError('Quantidade de palavras inválida.');
    let words = this.random.shuffle([...new Set(pool)]).slice(0, count);
    if (pool.length > count && words.join('|') === session.words.join('|')) {
      const replacement = [...new Set(pool)].find((word) => !words.includes(word));
      if (replacement) words = [...words.slice(0, -1), replacement];
    }
    return { ...session, phase: 'ready', count, words, round: session.round + 1 };
  }
  reveal(session: WordListSession): WordListSession { return { ...session, phase: 'revealed' }; }
}
