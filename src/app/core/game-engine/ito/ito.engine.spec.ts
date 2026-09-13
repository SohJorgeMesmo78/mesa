import { ITO_THEMES } from '../../../content/ito/themes';
import { createPlayers } from '../../players/player.model';
import { RandomService } from '../../random/random.service';
import { ItoEngine } from './ito.engine';

describe('ItoEngine', () => {
  let engine: ItoEngine;

  beforeEach(() => {
    engine = new ItoEngine(new RandomService());
  });

  it('distribui um número único por pessoa e percorre toda a revelação', () => {
    const setup = engine.createSetup(createPlayers(4));
    let round = engine.startRound(setup, ITO_THEMES);

    expect(round.phase).toBe('handoff');
    expect(round.assignments.length).toBe(4);
    expect(new Set(round.assignments.map((item) => item.number)).size).toBe(4);
    expect(round.assignments.every((item) => item.number >= 1 && item.number <= 100)).toBeTrue();

    for (let index = 0; index < round.players.length; index += 1) {
      round = engine.hideCurrent(round);
    }

    expect(round.phase).toBe('collective');
    expect(engine.showResults(round).phase).toBe('results');
  });

  it('troca apenas o tema e redistribui tudo em uma nova rodada', () => {
    const firstRound = engine.startRound(engine.createSetup(createPlayers(3)), ITO_THEMES);
    let collective = firstRound;
    for (let index = 0; index < collective.players.length; index += 1) {
      collective = engine.hideCurrent(collective);
    }

    collective = engine.updateClue(collective, collective.players[1].id, 'Uma meia');
    collective = engine.movePlayer(collective, collective.players[1].id, 0);

    const changedTheme = engine.changeTheme(collective, ITO_THEMES);
    expect(changedTheme.theme?.id).not.toBe(collective.theme?.id);
    expect(changedTheme.assignments).toEqual(collective.assignments);
    expect(changedTheme.clues).toEqual({ 'player-1': '', 'player-2': '', 'player-3': '' });
    expect(changedTheme.guessedOrder).toEqual(['player-1', 'player-2', 'player-3']);
    expect(changedTheme.revealedPlayerIds).toEqual([]);

    const nextRound = engine.startRound(engine.showResults(changedTheme), ITO_THEMES);
    expect(nextRound.round).toBe(2);
    expect(nextRound.theme?.id).not.toBe(changedTheme.theme?.id);
    expect(nextRound.phase).toBe('handoff');
    expect(nextRound.clues).toEqual({ 'player-1': '', 'player-2': '', 'player-3': '' });
    expect(nextRound.guessedOrder).toEqual(['player-1', 'player-2', 'player-3']);
    expect(nextRound.revealedPlayerIds).toEqual([]);
  });

  it('associa pistas por ID e reordena o palpite sem alterar jogadores ou números', () => {
    const collective = reachCollective(engine, 4);
    const assignments = collective.assignments;
    const players = collective.players;
    const withClue = engine.updateClue(collective, 'player-3', 'Um livro');
    const reordered = engine.movePlayer(withClue, 'player-3', 0);

    expect(reordered.clues['player-3']).toBe('Um livro');
    expect(reordered.guessedOrder).toEqual(['player-3', 'player-1', 'player-2', 'player-4']);
    expect(reordered.assignments).toBe(assignments);
    expect(reordered.players).toBe(players);
  });

  it('inicia o resultado oculto e revela cada número sem mudar o palpite', () => {
    const collective = engine.movePlayer(reachCollective(engine, 3), 'player-2', 0);
    const result = engine.showResults(collective);
    const revealed = engine.revealNumber(result, 'player-2');

    expect(result.revealedPlayerIds).toEqual([]);
    expect(revealed.revealedPlayerIds).toEqual(['player-2']);
    expect(revealed.guessedOrder).toEqual(['player-2', 'player-1', 'player-3']);
    expect(revealed.assignments).toBe(result.assignments);
  });

  it('revela todos os números restantes sem alterar palpite, jogadores ou atribuições', () => {
    const collective = engine.movePlayer(reachCollective(engine, 4), 'player-4', 0);
    const result = engine.showResults(collective);
    const partial = engine.revealNumber(result, 'player-2');
    const revealed = engine.revealAll(partial);

    expect(revealed.revealedPlayerIds).toEqual(revealed.guessedOrder);
    expect(revealed.guessedOrder).toEqual(['player-4', 'player-1', 'player-2', 'player-3']);
    expect(revealed.players).toBe(result.players);
    expect(revealed.assignments).toBe(result.assignments);
    expect(engine.score(revealed)).toEqual(engine.score(result));
  });

  it('calcula 100, score parcial e zero pela ordem relativa entre pares', () => {
    const base = withKnownNumbers(reachCollective(engine, 4), [10, 20, 30, 40]);
    const perfect = engine.score(base);
    const partial = engine.score({ ...base, guessedOrder: ['player-1', 'player-3', 'player-2', 'player-4'] });
    const inverted = engine.score({ ...base, guessedOrder: [...base.guessedOrder].reverse() });

    expect(perfect).toEqual(jasmine.objectContaining({ correctPairs: 6, totalPairs: 6, points: 100 }));
    expect(partial).toEqual(jasmine.objectContaining({ correctPairs: 5, totalPairs: 6, points: 83 }));
    expect(inverted).toEqual(jasmine.objectContaining({ correctPairs: 0, totalPairs: 6, points: 0 }));
  });
});

function reachCollective(engine: ItoEngine, playerCount: number) {
  let session = engine.startRound(engine.createSetup(createPlayers(playerCount)), ITO_THEMES);
  for (let index = 0; index < playerCount; index += 1) session = engine.hideCurrent(session);
  return session;
}

function withKnownNumbers(session: ReturnType<typeof reachCollective>, numbers: readonly number[]) {
  return {
    ...session,
    assignments: session.players.map((player, index) => ({ playerId: player.id, number: numbers[index] })),
  };
}
