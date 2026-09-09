import { createPlayers } from '../../players/player.model';
import { RandomService } from '../../random/random.service';
import { HotPotatoEngine } from './hot-potato.engine';
import { HotPotatoTheme } from './hot-potato.models';

describe('HotPotatoEngine', () => {
  const themes: readonly HotPotatoTheme[] = [{ text: 'Tema A' }, { text: 'Tema B' }, { text: 'Tema C' }];
  let engine: HotPotatoEngine;

  beforeEach(() => { engine = new HotPotatoEngine(new RandomService()); });

  it('sorteia tema válido e evita repetição imediata', () => {
    spyOn(Math, 'random').and.returnValue(0);
    const setup = engine.createSetup(createPlayers(3), themes);
    const changed = engine.changeTheme(setup, themes);
    expect(themes).toContain(setup.theme);
    expect(changed.theme).not.toEqual(setup.theme);
  });

  it('avança em ordem circular sem reorganizar jogadores', () => {
    const setup = engine.createSetup(createPlayers(3), themes);
    const ready = engine.prepare(setup, setup.players);
    let playing = engine.startRound(ready, 1_000);
    const originalPlayers = playing.players;
    playing = engine.passTurn(playing, 1_500);
    expect(playing.currentPlayerIndex).toBe(1);
    playing = engine.passTurn(playing, 2_000);
    playing = engine.passTurn(playing, 2_500);
    expect(playing.currentPlayerIndex).toBe(0);
    expect(playing.players).toBe(originalPlayers);
  });

  it('deriva o tempo do início e termina no instante esperado', () => {
    const setup = engine.createSetup(createPlayers(2), themes);
    const playing = engine.startRound(engine.prepare(setup, setup.players), 10_000);
    expect(engine.remainingSeconds(playing, 10_000)).toBe(60);
    expect(engine.remainingSeconds(playing, 69_001)).toBe(1);
    expect(engine.reconcile(playing, 70_000).phase).toBe('result');
  });

  it('não avança o jogador depois do fim e identifica quem estava com a vez', () => {
    const setup = engine.createSetup(createPlayers(3), themes);
    let playing = engine.startRound(engine.prepare(setup, setup.players), 0);
    playing = engine.passTurn(playing, 1_000);
    const result = engine.passTurn(playing, 60_000);
    expect(result.phase).toBe('result');
    expect(result.currentPlayerIndex).toBe(1);
    expect(result.loserPlayerId).toBe(result.players[1].id);
  });

  it('reconstrói uma rodada ativa no refresh e finaliza uma rodada vencida', () => {
    const setup = engine.createSetup(createPlayers(2), themes);
    const configured = engine.updateSetup(setup, setup.players, 30);
    const playing = engine.startRound(engine.prepare(configured, configured.players), 5_000);
    expect(engine.remainingSeconds(playing, 20_500)).toBe(15);
    const restored = engine.reconcile(playing, 35_000);
    expect(restored.phase).toBe('result');
    expect(restored.loserPlayerId).toBe(restored.players[0].id);
  });

  it('nova rodada mantém jogadores e duração, troca tema e reseta turno e timer', () => {
    spyOn(Math, 'random').and.returnValue(0);
    const setup = engine.createSetup(createPlayers(4), themes);
    const configured = engine.updateSetup(setup, setup.players, 90);
    const playing = engine.startRound(engine.prepare(configured, configured.players), 0);
    const result = engine.reconcile(playing, 90_000);
    const next = engine.prepareNextRound(result, themes);
    expect(next.players).toEqual(result.players);
    expect(next.durationSeconds).toBe(90);
    expect(next.theme).not.toEqual(result.theme);
    expect(next.currentPlayerIndex).toBe(0);
    expect(next.roundStartedAt).toBeNull();
    expect(next.phase).toBe('ready');
  });
});
