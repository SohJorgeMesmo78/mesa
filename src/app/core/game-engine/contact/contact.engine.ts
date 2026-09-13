import { Injectable } from '@angular/core';
import { RandomService } from '../../random/random.service';
import { ContactSession } from './contact.models';

@Injectable({ providedIn: 'root' })
export class ContactEngine {
  constructor(private readonly random: RandomService) {}
  create(words: readonly string[]): ContactSession { return { game: 'contato', phase: 'ready', word: this.pick(words), round: 1 }; }
  reveal(session: ContactSession, countdown: boolean): ContactSession { return { ...session, phase: countdown ? 'countdown' : 'revealed' }; }
  finishCountdown(session: ContactSession): ContactSession { return { ...session, phase: 'revealed' }; }
  newRound(session: ContactSession, words: readonly string[]): ContactSession {
    return { ...session, phase: 'ready', word: this.pick(words, session.word), round: session.round + 1 };
  }
  private pick(words: readonly string[], previous?: string): string {
    const valid = words.map((word) => word.trim()).filter(Boolean);
    if (!valid.length) throw new Error('O banco de Contato está vazio.');
    return this.random.pick(valid, previous);
  }
}
