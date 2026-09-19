import { createPlayers } from '../../players/player.model';
import { RandomService } from '../../random/random.service';
import { CitySleepsEngine, NIGHT_RITUAL_STEPS } from './city-sleeps.engine';
import { CitySleepsSession, NightAction } from './city-sleeps.models';

describe('CitySleepsEngine', () => {
  let random: RandomService;
  let engine: CitySleepsEngine;
  beforeEach(() => { random = new RandomService(); engine = new CitySleepsEngine(random); });

  it('sugere assassinos e respeita limites de 5 a 12 pessoas', () => {
    expect(engine.suggestedKillers(5)).toBe(1); expect(engine.suggestedKillers(8)).toBe(2); expect(engine.suggestedKillers(11)).toBe(3);
    expect(() => engine.createSetup(createPlayers(4))).toThrowError(RangeError);
    expect(() => engine.createSetup(createPlayers(13))).toThrowError(RangeError);
  });

  it('distribui exatamente um papel por pessoa com a composição configurada', () => {
    const game = engine.startGame(engine.createSetup(createPlayers(6)));
    expect(game.playerStates.length).toBe(6); expect(new Set(game.playerStates.map((state) => state.playerId)).size).toBe(6);
    expect(game.playerStates.filter((state) => state.role === 'killer').length).toBe(1);
    expect(game.playerStates.filter((state) => state.role === 'doctor').length).toBe(1);
    expect(game.playerStates.filter((state) => state.role === 'detective').length).toBe(1);
  });

  it('permite desligar médico e detetive e rejeita assassinos demais', () => {
    let setup = engine.createSetup(createPlayers(5));
    setup = engine.updateSetup(setup, setup.players, { killerCount: 2, doctorEnabled: false, detectiveEnabled: false, revealRoleOnDeath: true });
    const game = engine.startGame(setup); expect(game.playerStates.filter((state) => state.role === 'citizen').length).toBe(3);
    expect(() => engine.updateSetup(engine.createSetup(createPlayers(5)), createPlayers(5), { ...setup.config, killerCount: 3 })).toThrowError(RangeError);
  });

  it('gera duas posições seguras para o ritual sem alterar a partida', () => {
    const setup = engine.createSetup(createPlayers(5)); const before = JSON.stringify(setup); const targets = engine.ritualTargets();
    expect(targets.length).toBe(NIGHT_RITUAL_STEPS); expect(targets.every((target) => target.x >= 18 && target.x <= 82 && target.y >= 20 && target.y <= 75)).toBeTrue(); expect(JSON.stringify(setup)).toBe(before);
  });

  it('aplica restrições de alvos por papel', () => {
    const game = fixedGame(); const killer = idFor(game, 'killer'); const doctor = idFor(game, 'doctor'); const detective = idFor(game, 'detective');
    expect(engine.validTargets(game, killer).some((p) => p.id === killer)).toBeFalse();
    expect(engine.validTargets(game, doctor).some((p) => p.id === doctor)).toBeTrue();
    expect(engine.validTargets(game, detective).some((p) => p.id === detective)).toBeFalse();
  });

  it('informa somente o time investigado', () => {
    let game = toNightAction(fixedGame(), idFor(fixedGame(), 'detective'));
    const killer = idFor(game, 'killer'); game = engine.submitNightAction(game, { kind: 'detective', targetPlayerId: killer });
    expect(engine.investigationTeam(game, idFor(game, 'detective'))).toBe('evil');
  });

  it('mata ataque desprotegido e preserva ataque protegido', () => {
    const base = fixedGame(); const victim = idFor(base, 'citizen'); const killer = idFor(base, 'killer'); const doctor = idFor(base, 'doctor');
    const attacked = engine.resolveNight({ ...base, actions: { [killer]: { kind: 'killer', targetPlayerId: victim }, [doctor]: { kind: 'doctor', targetPlayerId: doctor } } });
    expect(attacked.playerStates.find((s) => s.playerId === victim)?.alive).toBeFalse();
    const saved = engine.resolveNight({ ...base, actions: { [killer]: { kind: 'killer', targetPlayerId: victim }, [doctor]: { kind: 'doctor', targetPlayerId: victim } } });
    expect(saved.lastNightResult?.protected).toBeTrue(); expect(saved.playerStates.find((s) => s.playerId === victim)?.alive).toBeTrue();
  });

  it('consolida maioria dos assassinos e usa sorteio apenas no empate', () => {
    let setup = engine.createSetup(createPlayers(8)); setup = engine.updateSetup(setup, setup.players, { ...setup.config, killerCount: 2 }); const game = fixedGame(setup);
    const killers = game.playerStates.filter((s) => s.role === 'killer').map((s) => s.playerId); const victims = game.playerStates.filter((s) => s.role === 'citizen').map((s) => s.playerId);
    spyOn(random, 'pick').and.returnValue(victims[0]);
    const result = engine.resolveNight({ ...game, actions: { [killers[0]]: { kind: 'killer', targetPlayerId: victims[0] }, [killers[1]]: { kind: 'killer', targetPlayerId: victims[1] } } });
    expect(result.lastNightResult?.eliminatedPlayerId).toBe(victims[0]);
  });

  it('resolve votação por maioria, empate e pular voto', () => {
    const game = fixedGame(); const ids = game.players.map((p) => p.id);
    const majority = engine.resolveVote({ ...game, votes: { [ids[0]]: ids[2], [ids[1]]: ids[2], [ids[2]]: ids[1], [ids[3]]: ids[2], [ids[4]]: null } });
    expect(majority.lastVoteResult?.eliminatedPlayerId).toBe(ids[2]);
    const tie = engine.resolveVote({ ...game, votes: { [ids[0]]: ids[1], [ids[1]]: ids[2] } }); expect(tie.lastVoteResult?.eliminatedPlayerId).toBeNull(); expect(tie.lastVoteResult?.tied).toBeTrue();
    const skip = engine.resolveVote({ ...game, votes: { [ids[0]]: null, [ids[1]]: null, [ids[2]]: ids[3] } }); expect(skip.lastVoteResult?.eliminatedPlayerId).toBeNull();
  });

  it('detecta vitória da cidade, dos assassinos e continuação', () => {
    const game = fixedGame(); const killer = idFor(game, 'killer');
    expect(engine.winnerFor(game.playerStates.map((s) => s.playerId === killer ? { ...s, alive: false } : s))).toBe('city');
    expect(engine.winnerFor(game.playerStates.map((s, i) => ({ ...s, alive: i < 2 })))).not.toBeUndefined();
    expect(engine.winnerFor(game.playerStates)).toBeNull();
  });

  function fixedGame(setup = engine.createSetup(createPlayers(5))): CitySleepsSession {
    const roles = setup.config.killerCount === 2
      ? ['killer','killer','doctor','detective','citizen','citizen','citizen','citizen'] as const
      : ['killer','doctor','detective','citizen','citizen','citizen','citizen','citizen'] as const;
    return { ...engine.startGame(setup), phase: 'night-action', playerStates: setup.players.map((p, i) => ({ playerId: p.id, role: roles[i], team: roles[i] === 'killer' ? 'evil' : 'city', alive: true })) };
  }
  function idFor(game: CitySleepsSession, role: string): string { return game.playerStates.find((state) => state.role === role)!.playerId; }
  function toNightAction(game: CitySleepsSession, playerId: string): CitySleepsSession { return { ...game, phase: 'night-action', currentPlayerIndex: game.players.findIndex((p) => p.id === playerId) }; }
});
