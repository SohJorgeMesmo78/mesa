import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { IMPOSTOR_QUESTION_PAIRS } from '../../content/pergunta-do-impostor/question-pairs';
import { ImpostorQuestionEngine } from '../../core/game-engine/impostor-question/impostor-question.engine';
import { createPlayers } from '../../core/players/player.model';
import { SessionStore } from '../../core/session/session.store';
import { PerguntaDoImpostorComponent } from './pergunta-do-impostor.component';

describe('PerguntaDoImpostorComponent', () => {
  beforeEach(() => {
    sessionStorage.clear();
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });
  afterEach(() => sessionStorage.clear());

  it('mantém as perguntas ocultas até a ação explícita de revelar', () => {
    const store = TestBed.inject(SessionStore);
    const engine = TestBed.inject(ImpostorQuestionEngine);
    const round = engine.startRound(engine.createSetup(createPlayers(3)), IMPOSTOR_QUESTION_PAIRS);
    store.setImpostorQuestionSession(round);
    const fixture = TestBed.createComponent(PerguntaDoImpostorComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).not.toContain(round.majorityQuestion!);
    expect(fixture.nativeElement.textContent).not.toContain(round.impostorQuestion!);

    (fixture.nativeElement.querySelector('app-private-reveal button') as HTMLButtonElement).click();
    fixture.detectChanges();
    const currentQuestion = engine.privateInfo(round, round.players[0].id).text;
    expect(fixture.nativeElement.textContent).toContain(currentQuestion);
  });

  it('revela primeiro somente a pergunta da maioria e depois o resultado completo', () => {
    const store = TestBed.inject(SessionStore);
    const engine = TestBed.inject(ImpostorQuestionEngine);
    let round = engine.startRound(engine.createSetup(createPlayers(3)), IMPOSTOR_QUESTION_PAIRS);
    for (let index = 0; index < round.players.length; index += 1) round = engine.hideCurrent(round);
    store.setImpostorQuestionSession(round);
    const fixture = TestBed.createComponent(PerguntaDoImpostorComponent);
    fixture.detectChanges();
    const impostorName = round.players.find((player) => round.impostorPlayerIds.includes(player.id))!.name;
    expect(fixture.nativeElement.textContent).not.toContain(round.majorityQuestion!);
    expect(fixture.nativeElement.textContent).not.toContain(round.impostorQuestion!);
    expect(fixture.nativeElement.textContent).not.toContain(impostorName);

    fixture.componentInstance.revealMajorityQuestion();
    fixture.detectChanges();
    expect(store.activeImpostorQuestion()?.phase).toBe('majority-reveal');
    expect(fixture.nativeElement.textContent).toContain(round.majorityQuestion!);
    expect(fixture.nativeElement.textContent).not.toContain(round.impostorQuestion!);
    expect(fixture.nativeElement.textContent).not.toContain(impostorName);

    fixture.componentInstance.showResults();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain(round.majorityQuestion!);
    expect(fixture.nativeElement.textContent).toContain(round.impostorQuestion!);
    expect(fixture.nativeElement.textContent).toContain(impostorName);
  });

  it('exige resposta, salva por playerId e não a expõe no próximo handoff', () => {
    const store = TestBed.inject(SessionStore);
    const engine = TestBed.inject(ImpostorQuestionEngine);
    let setup = engine.createSetup(createPlayers(3));
    setup = engine.updateSetup(setup, setup.players, { impostorCount: 1, answerMode: 'written' });
    const round = engine.startRound(setup, IMPOSTOR_QUESTION_PAIRS);
    store.setImpostorQuestionSession(round);
    const fixture = TestBed.createComponent(PerguntaDoImpostorComponent);
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('app-private-reveal button') as HTMLButtonElement).click();
    fixture.detectChanges();
    const hideButton = fixture.nativeElement.querySelector('app-private-reveal button') as HTMLButtonElement;
    expect(hideButton.disabled).toBeTrue();
    const textarea = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
    textarea.value = 'Café recém-passado';
    textarea.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(hideButton.disabled).toBeFalse();
    hideButton.click();
    fixture.detectChanges();

    expect(store.activeImpostorQuestion()?.answers[round.players[0].id]).toBe('Café recém-passado');
    expect(fixture.nativeElement.textContent).not.toContain('Café recém-passado');
    expect(fixture.nativeElement.querySelector('textarea')).toBeNull();
  });

  it('modo registrado mostra respostas sem revelar papel e depois apresenta o resultado', () => {
    const store = TestBed.inject(SessionStore);
    const engine = TestBed.inject(ImpostorQuestionEngine);
    let setup = engine.createSetup(createPlayers(3));
    setup = engine.updateSetup(setup, setup.players, { impostorCount: 1, answerMode: 'written' });
    let round = engine.startRound(setup, IMPOSTOR_QUESTION_PAIRS);
    for (const player of round.players) round = engine.hideCurrent(round, `Resposta ${player.id}`);
    store.setImpostorQuestionSession(round);
    const fixture = TestBed.createComponent(PerguntaDoImpostorComponent);
    fixture.detectChanges();

    expect(round.phase).toBe('majority-reveal');
    expect(fixture.nativeElement.textContent).not.toContain('Hora das respostas');
    expect(fixture.nativeElement.textContent).toContain(round.majorityQuestion!);
    expect(fixture.nativeElement.textContent).not.toContain(round.impostorQuestion!);
    for (const player of round.players) expect(fixture.nativeElement.textContent).toContain(`Resposta ${player.id}`);

    fixture.componentInstance.showResults();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain(round.impostorQuestion!);
    expect(fixture.nativeElement.textContent).toContain(round.players.find((player) => round.impostorPlayerIds.includes(player.id))!.name);
  });
});
