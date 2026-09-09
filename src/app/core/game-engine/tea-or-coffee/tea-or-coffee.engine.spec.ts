import { TEA_OR_COFFEE_WORDS } from '../../../content/cha-ou-cafe/words';
import { RandomService } from '../../random/random.service';
import { TeaOrCoffeeEngine } from './tea-or-coffee.engine';

describe('TeaOrCoffeeEngine', () => {
  let engine: TeaOrCoffeeEngine;

  beforeEach(() => { engine = new TeaOrCoffeeEngine(new RandomService()); });

  it('possui um banco válido, sem termos vazios ou duplicados', () => {
    expect(TEA_OR_COFFEE_WORDS.length).toBeGreaterThan(1);
    expect(TEA_OR_COFFEE_WORDS.every((word) => word.trim().length > 0)).toBeTrue();
    expect(new Set(TEA_OR_COFFEE_WORDS.map((word) => word.toLocaleLowerCase('pt-BR'))).size).toBe(TEA_OR_COFFEE_WORDS.length);
  });

  it('sorteia uma palavra pertencente ao banco', () => {
    const word = engine.createSession(TEA_OR_COFFEE_WORDS).word;
    expect(TEA_OR_COFFEE_WORDS.some((candidate) => candidate === word)).toBeTrue();
  });

  it('não repete imediatamente a palavra quando existem alternativas', () => {
    spyOn(Math, 'random').and.returnValue(0);
    const first = engine.createSession(['Praia', 'Montanha']);
    const next = engine.newRound(engine.prepareReveal(first, false), ['Praia', 'Montanha'], false);
    expect(next.word).not.toBe(first.word);
  });

  it('nova rodada mantém a mesma pessoa e revela após o countdown configurado', () => {
    const ready = engine.createSession(TEA_OR_COFFEE_WORDS);
    expect(ready.phase).toBe('ready');
    const countdown = engine.prepareReveal(ready, true);
    expect(countdown.phase).toBe('countdown');
    const revealed = engine.finishCountdown(countdown);
    expect(revealed.phase).toBe('revealed');
    const next = engine.newRound(revealed, TEA_OR_COFFEE_WORDS, false);
    expect(next.phase).toBe('revealed');
    expect(next.round).toBe(2);
    const withCountdown = engine.newRound(next, TEA_OR_COFFEE_WORDS, true);
    expect(withCountdown.phase).toBe('countdown');
  });

  it('trocar pessoa prepara outra palavra e volta ao estado protegido', () => {
    const revealed = engine.prepareReveal(engine.createSession(TEA_OR_COFFEE_WORDS), false);
    const switched = engine.switchLeader(revealed, TEA_OR_COFFEE_WORDS);
    expect(switched.phase).toBe('ready');
    expect(switched.word).not.toBe(revealed.word);
    expect(switched.round).toBe(2);
  });
});
