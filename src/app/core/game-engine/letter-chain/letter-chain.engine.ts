import { Injectable } from '@angular/core';
import { RandomService } from '../../random/random.service';
import { LetterChainSession } from './letter-chain.models';
@Injectable({ providedIn: 'root' })
export class LetterChainEngine {
  constructor(private readonly random: RandomService) {}
  create(letters: readonly string[]): LetterChainSession { return { game: 'adivinhe-a-palavra', letter: this.random.pick(letters), round: 1 }; }
  newRound(session: LetterChainSession, letters: readonly string[]): LetterChainSession { return { ...session, letter: this.random.pick(letters, session.letter), round: session.round + 1 }; }
}
