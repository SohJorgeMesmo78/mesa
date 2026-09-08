import { IMPOSTOR_CONTENT } from '../../../content/impostor/words';
import { createPlayers } from '../../players/player.model';
import { RandomService } from '../../random/random.service';
import { ImpostorEngine } from './impostor.engine';

describe('ImpostorEngine', () => {
  let engine: ImpostorEngine;
  beforeEach(() => { engine = new ImpostorEngine(new RandomService()); });

  it('rejeita uma quantidade inválida de impostores', () => {
    const setup = engine.createSetup(createPlayers(3));
    expect(() => engine.updateSetup(setup, setup.players, { impostorCount: 2, mode: 'classic', giveHint: true })).toThrowError(RangeError);
  });

  it('no Clássico entrega palavra aos comuns e papel com dica aos impostores', () => {
    const round = engine.startRound(engine.createSetup(createPlayers(4)), IMPOSTOR_CONTENT);
    const impostorId = round.impostorPlayerIds[0];
    const commonId = round.players.find((player) => player.id !== impostorId)!.id;
    expect(engine.privateInfo(round, commonId)).toEqual({ kind: 'word', word: round.word! });
    expect(engine.privateInfo(round, impostorId)).toEqual({ kind: 'impostor', hint: round.hint });
    expect(round.hint).toBeTruthy();
    expect(round.alternativeWord).toBeNull();
  });

  it('no Clássico sem dica entrega somente o papel ao impostor', () => {
    let setup = engine.createSetup(createPlayers(4));
    setup = engine.updateSetup(setup, setup.players, { ...setup.config, giveHint: false });
    const round = engine.startRound(setup, IMPOSTOR_CONTENT);
    expect(engine.privateInfo(round, round.impostorPlayerIds[0])).toEqual({ kind: 'impostor', hint: null });
  });

  it('no escuro usa o mesmo tipo de reveal e uma alternativa cadastrada', () => {
    let setup = engine.createSetup(createPlayers(5));
    setup = engine.updateSetup(setup, setup.players, { impostorCount: 2, mode: 'blind', giveHint: true });
    const round = engine.startRound(setup, IMPOSTOR_CONTENT);
    const impostorId = round.impostorPlayerIds[0];
    const commonId = round.players.find((player) => !round.impostorPlayerIds.includes(player.id))!.id;
    const impostorInfo = engine.privateInfo(round, impostorId);
    const commonInfo = engine.privateInfo(round, commonId);
    const selectedContent = IMPOSTOR_CONTENT.find((entry) => entry.word === round.word)!;
    expect(commonInfo).toEqual({ kind: 'word', word: round.word! });
    expect(impostorInfo).toEqual({ kind: 'word', word: round.alternativeWord! });
    expect(impostorInfo.kind).toBe(commonInfo.kind);
    expect(selectedContent.blindWords).toContain(round.alternativeWord!);
    expect(round.hint).toBeNull();
  });

  it('no escuro ignora a dica sem apagar a preferência', () => {
    let setup = engine.createSetup(createPlayers(4));
    setup = engine.updateSetup(setup, setup.players, { ...setup.config, mode: 'blind', giveHint: true });
    const round = engine.startRound(setup, IMPOSTOR_CONTENT);
    expect(round.config).toEqual({ impostorCount: 1, mode: 'blind', giveHint: true });
    expect(round.hint).toBeNull();
    expect(round.alternativeWord).toBeTruthy();
  });

  it('percorre distribuição, discussão e resultado com mais de um impostor', () => {
    let setup = engine.createSetup(createPlayers(5));
    setup = engine.updateSetup(setup, setup.players, { impostorCount: 2, mode: 'classic', giveHint: true });
    let round = engine.startRound(setup, IMPOSTOR_CONTENT);
    expect(new Set(round.impostorPlayerIds).size).toBe(2);
    for (let index = 0; index < round.players.length; index += 1) round = engine.hideCurrent(round);
    expect(round.phase).toBe('discussion');
    expect(engine.showResults(round).phase).toBe('results');
  });

  it('na nova rodada preserva configuração e troca o conteúdo', () => {
    spyOn(Math, 'random').and.returnValue(0);
    let setup = engine.createSetup(createPlayers(4));
    setup = engine.updateSetup(setup, setup.players, { ...setup.config, mode: 'blind' });
    let first = engine.startRound(setup, IMPOSTOR_CONTENT);
    for (let index = 0; index < first.players.length; index += 1) first = engine.hideCurrent(first);
    const result = engine.showResults(first);
    const second = engine.startRound(result, IMPOSTOR_CONTENT);
    expect(second.players).toEqual(result.players);
    expect(second.config).toEqual(result.config);
    expect(second.word).not.toBe(result.word);
    expect(second.round).toBe(2);
  });
});
