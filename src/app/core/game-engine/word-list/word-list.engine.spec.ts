import { WORD_LIST_POOL } from '../../../content/jogo-da-lista/words';
import { RandomService } from '../../random/random.service';
import { WordListEngine } from './word-list.engine';
describe('WordListEngine',()=>{const engine=new WordListEngine(new RandomService());it('gera lista única com a quantidade pedida',()=>{const game=engine.start(engine.create(),8,WORD_LIST_POOL);expect(game.words.length).toBe(8);expect(new Set(game.words).size).toBe(8);});it('protege a lista antes da revelação',()=>{const ready=engine.start(engine.create(),5,WORD_LIST_POOL);expect(ready.phase).toBe('ready');expect(engine.reveal(ready).phase).toBe('revealed');});it('rejeita configuração inválida',()=>{expect(()=>engine.start(engine.create(),7,WORD_LIST_POOL)).toThrowError(RangeError);});});
