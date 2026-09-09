import { Injectable } from '@angular/core';
import { RandomService } from '../../random/random.service';
import { TeaOrCoffeeSession } from './tea-or-coffee.models';

@Injectable({ providedIn: 'root' })
export class TeaOrCoffeeEngine {
  constructor(private readonly random: RandomService) {}

  createSession(words: readonly string[]): TeaOrCoffeeSession {
    return { game: 'cha-ou-cafe', phase: 'ready', word: this.pickWord(words), round: 1 };
  }

  prepareReveal(session: TeaOrCoffeeSession, countdown: boolean): TeaOrCoffeeSession {
    if (session.phase !== 'ready') throw new Error('A palavra só pode ser revelada a partir da preparação.');
    return { ...session, phase: countdown ? 'countdown' : 'revealed' };
  }

  finishCountdown(session: TeaOrCoffeeSession): TeaOrCoffeeSession {
    if (session.phase !== 'countdown') throw new Error('Não existe uma contagem ativa.');
    return { ...session, phase: 'revealed' };
  }

  newRound(session: TeaOrCoffeeSession, words: readonly string[], countdown: boolean): TeaOrCoffeeSession {
    if (session.phase !== 'revealed') throw new Error('A rodada atual ainda não foi revelada.');
    return {
      ...session,
      phase: countdown ? 'countdown' : 'revealed',
      word: this.pickWord(words, session.word),
      round: session.round + 1,
    };
  }

  switchLeader(session: TeaOrCoffeeSession, words: readonly string[]): TeaOrCoffeeSession {
    if (session.phase !== 'revealed') throw new Error('A pessoa só pode ser trocada depois da revelação.');
    return {
      ...session,
      phase: 'ready',
      word: this.pickWord(words, session.word),
      round: session.round + 1,
    };
  }

  private pickWord(words: readonly string[], previous?: string): string {
    const validWords = words.map((word) => word.trim()).filter(Boolean);
    if (validWords.length === 0) throw new Error('Nenhuma palavra foi cadastrada para Chá ou Café.');
    return this.random.pick(validWords, previous);
  }
}
