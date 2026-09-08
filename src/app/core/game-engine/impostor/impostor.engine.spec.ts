import { IMPOSTOR_CONTENT } from '../../../content/impostor/words';
import { createPlayers } from '../../players/player.model';
import { RandomService } from '../../random/random.service';
import { ImpostorEngine } from './impostor.engine';

describe('ImpostorEngine', () => {
  let engine: ImpostorEngine;

  beforeEach(() => {
    engine = new ImpostorEngine(new RandomService());
  });

  it('rejeita uma quantidade de impostores que deixe a configuração inválida', () => {
    const setup = engine.createSetup(createPlayers(3));

    expect(() => engine.updateSetup(setup, setup.players, {
      impostorCount: 2,
      hintsEnabled: true,
    })).toThrowError(RangeError);
  });

  it('sorteia impostores únicos e percorre distribuição, discussão e resultado', () => {
    let setup = engine.createSetup(createPlayers(5));
    setup = engine.updateSetup(setup, setup.players, { impostorCount: 2, hintsEnabled: true });
    let round = engine.startRound(setup, IMPOSTOR_CONTENT);

    expect(round.impostorPlayerIds.length).toBe(2);
    expect(new Set(round.impostorPlayerIds).size).toBe(2);
    expect(round.hint).toBeTruthy();

    for (let index = 0; index < round.players.length; index += 1) {
      round = engine.hideCurrent(engine.revealCurrent(round));
    }

    expect(round.phase).toBe('discussion');
    const result = engine.showResults(round);
    expect(result.phase).toBe('results');
    expect(result.players.filter((player) => result.impostorPlayerIds.includes(player.id)).length).toBe(2);
  });

  it('mantém jogadores e configuração, troca a palavra e redistribui na nova rodada', () => {
    spyOn(Math, 'random').and.returnValue(0);
    const setup = engine.createSetup(createPlayers(4));
    let firstRound = engine.startRound(setup, IMPOSTOR_CONTENT);
    for (let index = 0; index < firstRound.players.length; index += 1) {
      firstRound = engine.hideCurrent(engine.revealCurrent(firstRound));
    }
    const result = engine.showResults(firstRound);
    const secondRound = engine.startRound(result, IMPOSTOR_CONTENT);

    expect(secondRound.players).toEqual(result.players);
    expect(secondRound.config).toEqual(result.config);
    expect(secondRound.word).not.toBe(result.word);
    expect(secondRound.round).toBe(2);
  });
});
