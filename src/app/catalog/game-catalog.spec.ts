import { GAME_CATALOG, findGame } from './game-catalog';

describe('GAME_CATALOG', () => {
  it('mantém os 11 nomes públicos finais', () => {
    expect(GAME_CATALOG.map((game) => game.name)).toEqual([
      'Quem Sou Eu', 'Na Escala', 'Impostor', 'Batata Quente', 'Pergunta Errada',
      'Um ou Outro', 'Onde Estou', 'Contato', 'Qual é a Nota', 'Tá na Lista', 'Não Completa',
    ]);
  });

  it('preserva os slugs técnicos dos jogos renomeados', () => {
    expect(findGame('ito')?.name).toBe('Na Escala');
    expect(findGame('pergunta-do-impostor')?.name).toBe('Pergunta Errada');
    expect(findGame('cha-ou-cafe')?.name).toBe('Um ou Outro');
    expect(findGame('jogo-da-lista')?.name).toBe('Tá na Lista');
    expect(findGame('adivinhe-a-palavra')?.name).toBe('Não Completa');
  });

  it('oferece ajuda curta e completa para todos os jogos', () => {
    expect(GAME_CATALOG.length).toBe(11);
    for (const game of GAME_CATALOG) {
      expect(game.help.summary.trim().length).toBeGreaterThan(0);
      expect(game.help.objective.trim().length).toBeGreaterThan(0);
      expect(game.help.steps.length).toBeGreaterThanOrEqual(3);
      expect(game.help.steps.length).toBeLessThanOrEqual(6);
    }
  });
});
