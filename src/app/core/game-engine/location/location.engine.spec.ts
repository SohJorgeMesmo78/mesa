import { LOCATION_CONTENT } from '../../../content/onde-estou/locations';
import { createPlayers } from '../../players/player.model';
import { RandomService } from '../../random/random.service';
import { LocationEngine } from './location.engine';

describe('LocationEngine', () => {
  let engine: LocationEngine;
  beforeEach(() => { engine = new LocationEngine(new RandomService()); });

  it('mantém um banco válido de locais, dicas e alternativas', () => {
    expect(LOCATION_CONTENT.length).toBeGreaterThan(1);
    expect(LOCATION_CONTENT.every((entry) => entry.location.trim().length > 0
      && entry.classicHints.every((hint) => hint.trim().length > 0)
      && entry.blindLocations.every((location) => location.trim().length > 0 && location !== entry.location))).toBeTrue();
  });

  it('rejeita configuração impossível', () => {
    const setup = engine.createSetup(createPlayers(3));
    expect(() => engine.updateSetup(setup, setup.players, { impostorCount: 2, mode: 'classic', giveHint: true })).toThrowError(RangeError);
  });

  it('sorteia impostores únicos e distribui local somente aos jogadores comuns', () => {
    let setup = engine.createSetup(createPlayers(5));
    setup = engine.updateSetup(setup, setup.players, { impostorCount: 2, mode: 'classic', giveHint: true });
    const round = engine.startRound(setup, LOCATION_CONTENT);
    expect(round.impostorPlayerIds.length).toBe(2);
    expect(new Set(round.impostorPlayerIds).size).toBe(2);
    const impostorId = round.impostorPlayerIds[0];
    const commonId = round.players.find((player) => !round.impostorPlayerIds.includes(player.id))!.id;
    expect(engine.privateInfo(round, impostorId)).toEqual({ kind: 'impostor', hint: round.hint });
    expect(engine.privateInfo(round, commonId)).toEqual({ kind: 'location', location: round.location! });
  });

  it('inclui ou omite a dica conforme a configuração', () => {
    const withHint = engine.startRound(engine.createSetup(createPlayers(3)), LOCATION_CONTENT);
    expect(withHint.hint).toBeTruthy();
    let withoutHint = engine.createSetup(createPlayers(3));
    withoutHint = engine.updateSetup(withoutHint, withoutHint.players, { impostorCount: 1, mode: 'classic', giveHint: false });
    withoutHint = engine.startRound(withoutHint, LOCATION_CONTENT);
    expect(withoutHint.hint).toBeNull();
    expect(engine.privateInfo(withoutHint, withoutHint.impostorPlayerIds[0])).toEqual({ kind: 'impostor', hint: null });
  });

  it('no escuro entrega o mesmo tipo de informação visual e um local alternativo permitido', () => {
    let setup = engine.createSetup(createPlayers(5));
    setup = engine.updateSetup(setup, setup.players, { impostorCount: 2, mode: 'blind', giveHint: true });
    const round = engine.startRound(setup, LOCATION_CONTENT);
    const impostorId = round.impostorPlayerIds[0];
    const commonId = round.players.find((player) => !round.impostorPlayerIds.includes(player.id))!.id;
    const impostorInfo = engine.privateInfo(round, impostorId);
    const commonInfo = engine.privateInfo(round, commonId);
    const selected = LOCATION_CONTENT.find((entry) => entry.location === round.location)!;
    expect(commonInfo).toEqual({ kind: 'location', location: round.location! });
    expect(impostorInfo).toEqual({ kind: 'location', location: round.alternativeLocation! });
    expect(impostorInfo.kind).toBe(commonInfo.kind);
    expect(selected.blindLocations as readonly string[]).toContain(round.alternativeLocation!);
    expect(round.hint).toBeNull();
  });

  it('no escuro ignora a dica sem apagar a preferência', () => {
    let setup = engine.createSetup(createPlayers(3));
    setup = engine.updateSetup(setup, setup.players, { ...setup.config, mode: 'blind', giveHint: true });
    const round = engine.startRound(setup, LOCATION_CONTENT);
    expect(round.config.giveHint).toBeTrue();
    expect(round.hint).toBeNull();
    expect(round.alternativeLocation).toBeTruthy();
  });

  it('avança pela discussão e resultado', () => {
    let round = engine.startRound(engine.createSetup(createPlayers(3)), LOCATION_CONTENT);
    for (let index = 0; index < round.players.length; index += 1) round = engine.hideCurrent(round);
    expect(round.phase).toBe('discussion');
    expect(engine.showResults(round).phase).toBe('results');
  });

  it('preserva configuração e jogadores, troca local e redistribui na nova rodada', () => {
    spyOn(Math, 'random').and.returnValue(0);
    let setup = engine.createSetup(createPlayers(5));
    setup = engine.updateSetup(setup, setup.players, { ...setup.config, mode: 'blind' });
    let first = engine.startRound(setup, LOCATION_CONTENT);
    for (let index = 0; index < first.players.length; index += 1) first = engine.hideCurrent(first);
    first = engine.showResults(first);
    const second = engine.startRound(first, LOCATION_CONTENT);
    expect(second.players).toEqual(first.players);
    expect(second.config).toEqual(first.config);
    expect(second.config.mode).toBe('blind');
    expect(second.location).not.toBe(first.location);
    expect(second.round).toBe(2);
  });
});
