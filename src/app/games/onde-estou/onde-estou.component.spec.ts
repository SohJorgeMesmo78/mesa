import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { LOCATION_CONTENT } from '../../content/onde-estou/locations';
import { LocationEngine } from '../../core/game-engine/location/location.engine';
import { createPlayers } from '../../core/players/player.model';
import { SessionStore } from '../../core/session/session.store';
import { OndeEstouComponent } from './onde-estou.component';

describe('OndeEstouComponent', () => {
  beforeEach(() => {
    sessionStorage.clear();
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });
  afterEach(() => sessionStorage.clear());

  it('mostra dica apenas no modo Clássico', () => {
    const fixture = TestBed.createComponent(OndeEstouComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Dica para impostor');
    fixture.componentInstance.setMode('blind');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).not.toContain('Dica para impostor');
    expect(TestBed.inject(SessionStore).activeLocation()?.config.mode).toBe('blind');
  });

  it('mantém local e papel ocultos antes da revelação', () => {
    const store = TestBed.inject(SessionStore);
    const engine = TestBed.inject(LocationEngine);
    const round = engine.startRound(engine.createSetup(createPlayers(3)), LOCATION_CONTENT);
    store.setLocationSession(round);
    const fixture = TestBed.createComponent(OndeEstouComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).not.toContain(round.location!);
    expect(fixture.nativeElement.textContent).not.toContain('Você é o');
  });

  it('no escuro usa a mesma apresentação de local para comuns e impostores', () => {
    const store = TestBed.inject(SessionStore);
    const engine = TestBed.inject(LocationEngine);
    let setup = engine.createSetup(createPlayers(3));
    setup = engine.updateSetup(setup, setup.players, { ...setup.config, mode: 'blind' });
    const round = engine.startRound(setup, LOCATION_CONTENT);
    store.setLocationSession(round);
    const fixture = TestBed.createComponent(OndeEstouComponent);
    fixture.detectChanges();
    (fixture.nativeElement.querySelector('app-private-reveal button') as HTMLButtonElement).click();
    fixture.detectChanges();
    const expected = engine.privateInfo(round, round.players[0].id);
    expect(expected.kind).toBe('location');
    expect(fixture.nativeElement.textContent).toContain(expected.kind === 'location' ? expected.location : '');
    expect(fixture.nativeElement.textContent).not.toContain('Impostor');
  });

  it('revela o resultado correto em cada modo', () => {
    const store = TestBed.inject(SessionStore);
    const engine = TestBed.inject(LocationEngine);
    let setup = engine.createSetup(createPlayers(3));
    setup = engine.updateSetup(setup, setup.players, { ...setup.config, mode: 'blind' });
    let round = engine.startRound(setup, LOCATION_CONTENT);
    for (let index = 0; index < round.players.length; index += 1) round = engine.hideCurrent(round);
    round = engine.showResults(round);
    store.setLocationSession(round);
    const fixture = TestBed.createComponent(OndeEstouComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain(round.location!);
    expect(fixture.nativeElement.textContent).toContain(round.alternativeLocation!);
    const impostor = round.players.find((player) => round.impostorPlayerIds.includes(player.id))!;
    expect(fixture.nativeElement.textContent).toContain(impostor.name);
    expect(fixture.nativeElement.textContent).not.toContain('Dica recebida');
  });
});
