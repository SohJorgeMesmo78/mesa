import { LETTER_CHAIN_LETTERS } from '../../../content/adivinhe-a-palavra/letters';
import { RandomService } from '../../random/random.service';
import { LetterChainEngine } from './letter-chain.engine';
describe('LetterChainEngine',()=>{const engine=new LetterChainEngine(new RandomService());it('sorteia uma letra válida',()=>{expect(LETTER_CHAIN_LETTERS).toContain(engine.create(LETTER_CHAIN_LETTERS).letter);});it('evita repetição imediata',()=>{spyOn(Math,'random').and.returnValue(0);const first=engine.create(['A','B']);const next=engine.newRound(first,['A','B']);expect(next.letter).not.toBe(first.letter);});it('incrementa a rodada',()=>{const first=engine.create(LETTER_CHAIN_LETTERS);expect(engine.newRound(first,LETTER_CHAIN_LETTERS).round).toBe(2);});});
