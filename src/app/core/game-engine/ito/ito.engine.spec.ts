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
      round = engine.revealCurrent(round);
      expect(round.phase).toBe('private');
      round = engine.hideCurrent(round);
    }

    expect(round.phase).toBe('collective');
    expect(engine.showResults(round).phase).toBe('results');
  });

  it('troca apenas o tema e redistribui tudo em uma nova rodada', () => {
    const firstRound = engine.startRound(engine.createSetup(createPlayers(3)), ITO_THEMES);
    let collective = firstRound;
    for (let index = 0; index < collective.players.length; index += 1) {
      collective = engine.hideCurrent(engine.revealCurrent(collective));
    }

    const changedTheme = engine.changeTheme(collective, ITO_THEMES);
    expect(changedTheme.theme?.id).not.toBe(collective.theme?.id);
    expect(changedTheme.assignments).toEqual(collective.assignments);

    const nextRound = engine.startRound(engine.showResults(changedTheme), ITO_THEMES);
    expect(nextRound.round).toBe(2);
    expect(nextRound.theme?.id).not.toBe(changedTheme.theme?.id);
    expect(nextRound.phase).toBe('handoff');
  });
});
