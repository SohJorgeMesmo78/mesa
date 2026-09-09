import { IMPOSTOR_QUESTION_PAIRS } from '../../../content/pergunta-do-impostor/question-pairs';
import { createPlayers } from '../../players/player.model';
import { RandomService } from '../../random/random.service';
import { ImpostorQuestionEngine } from './impostor-question.engine';

describe('ImpostorQuestionEngine', () => {
  let engine: ImpostorQuestionEngine;
  beforeEach(() => { engine = new ImpostorQuestionEngine(new RandomService()); });

  it('possui pares válidos com perguntas diferentes', () => {
    expect(IMPOSTOR_QUESTION_PAIRS.length).toBeGreaterThan(1);
    for (const pair of IMPOSTOR_QUESTION_PAIRS) {
      expect(pair.questionA.trim()).toBeTruthy();
      expect(pair.questionB.trim()).toBeTruthy();
      expect(pair.questionA).not.toBe(pair.questionB);
    }
  });

  it('não repete imediatamente o mesmo par quando há alternativas', () => {
    spyOn(Math, 'random').and.returnValue(0);
    let round = engine.startRound(engine.createSetup(createPlayers(4)), IMPOSTOR_QUESTION_PAIRS);
    for (let index = 0; index < round.players.length; index += 1) round = engine.hideCurrent(round);
    const next = engine.startRound(engine.showResults(engine.revealMajorityQuestion(round)), IMPOSTOR_QUESTION_PAIRS);
    expect(next.pair?.id).not.toBe(round.pair?.id);
  });

  it('sorteia a quantidade correta de impostores únicos', () => {
    let setup = engine.createSetup(createPlayers(5));
    setup = engine.updateSetup(setup, setup.players, { impostorCount: 2, answerMode: 'spoken' });
    const round = engine.startRound(setup, IMPOSTOR_QUESTION_PAIRS);
    expect(round.impostorPlayerIds.length).toBe(2);
    expect(new Set(round.impostorPlayerIds).size).toBe(2);
  });

  it('entrega pergunta da maioria aos comuns e alternativa aos impostores sem expor papel', () => {
    const round = engine.startRound(engine.createSetup(createPlayers(4)), IMPOSTOR_QUESTION_PAIRS);
    const impostorId = round.impostorPlayerIds[0];
    const commonId = round.players.find((player) => player.id !== impostorId)!.id;
    const commonReveal = engine.privateInfo(round, commonId);
    const impostorReveal = engine.privateInfo(round, impostorId);
    expect(commonReveal).toEqual({ kind: 'question', text: round.majorityQuestion! });
    expect(impostorReveal).toEqual({ kind: 'question', text: round.impostorQuestion! });
    expect(commonReveal.kind).toBe(impostorReveal.kind);
    expect(Object.keys(impostorReveal)).not.toContain('role');
  });

  it('chega ao resultado preservando perguntas e impostores corretos', () => {
    let round = engine.startRound(engine.createSetup(createPlayers(3)), IMPOSTOR_QUESTION_PAIRS);
    const majority = round.majorityQuestion;
    const alternative = round.impostorQuestion;
    const impostors = round.impostorPlayerIds;
    for (let index = 0; index < round.players.length; index += 1) round = engine.hideCurrent(round);
    const majorityReveal = engine.revealMajorityQuestion(round);
    expect(majorityReveal.phase).toBe('majority-reveal');
    const result = engine.showResults(majorityReveal);
    expect(result.majorityQuestion).toBe(majority);
    expect(result.impostorQuestion).toBe(alternative);
    expect(result.impostorPlayerIds).toEqual(impostors);
  });

  it('nova rodada mantém jogadores e configuração, mas troca o par', () => {
    spyOn(Math, 'random').and.returnValue(0);
    let setup = engine.createSetup(createPlayers(5));
    setup = engine.updateSetup(setup, setup.players, { impostorCount: 2, answerMode: 'spoken' });
    let first = engine.startRound(setup, IMPOSTOR_QUESTION_PAIRS);
    for (let index = 0; index < first.players.length; index += 1) first = engine.hideCurrent(first);
    const result = engine.showResults(engine.revealMajorityQuestion(first));
    const second = engine.startRound(result, IMPOSTOR_QUESTION_PAIRS);
    expect(second.players).toEqual(result.players);
    expect(second.config).toEqual(result.config);
    expect(second.pair?.id).not.toBe(result.pair?.id);
    expect(second.round).toBe(2);
    expect(second.phase).toBe('handoff');
  });

  it('usa Em voz alta por padrão e não exige respostas', () => {
    let round = engine.startRound(engine.createSetup(createPlayers(3)), IMPOSTOR_QUESTION_PAIRS);
    expect(round.config.answerMode).toBe('spoken');
    for (let index = 0; index < round.players.length; index += 1) round = engine.hideCurrent(round);
    expect(round.phase).toBe('discussion');
    expect(round.answers).toEqual({});
  });

  it('registra respostas pelo ID do jogador e exige conteúdo', () => {
    let setup = engine.createSetup(createPlayers(3));
    setup = engine.updateSetup(setup, setup.players, { impostorCount: 1, answerMode: 'written' });
    let round = engine.startRound(setup, IMPOSTOR_QUESTION_PAIRS);
    expect(() => engine.hideCurrent(round, '   ')).toThrowError();
    const firstPlayerId = round.players[0].id;
    round = engine.hideCurrent(round, '  Café recém-passado  ');
    expect(round.answers[firstPlayerId]).toBe('Café recém-passado');
    expect(round.currentPlayerIndex).toBe(1);
  });

  it('modo registrado pula a discussão e limpa respostas na nova rodada', () => {
    let setup = engine.createSetup(createPlayers(3));
    setup = engine.updateSetup(setup, setup.players, { impostorCount: 1, answerMode: 'written' });
    let round = engine.startRound(setup, IMPOSTOR_QUESTION_PAIRS);
    for (const player of round.players) round = engine.hideCurrent(round, `Resposta de ${player.name}`);
    expect(round.phase).toBe('majority-reveal');
    expect(Object.keys(round.answers).length).toBe(3);
    const result = engine.showResults(round);
    const next = engine.startRound(result, IMPOSTOR_QUESTION_PAIRS);
    expect(next.config.answerMode).toBe('written');
    expect(next.answers).toEqual({});
    expect(next.phase).toBe('handoff');
  });
});
