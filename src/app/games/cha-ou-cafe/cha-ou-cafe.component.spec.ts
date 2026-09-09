import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TeaOrCoffeeEngine } from '../../core/game-engine/tea-or-coffee/tea-or-coffee.engine';
import { SessionStore } from '../../core/session/session.store';
import { ChaOuCafeComponent } from './cha-ou-cafe.component';

describe('ChaOuCafeComponent', () => {
  beforeEach(() => {
    sessionStorage.clear();
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });
  afterEach(() => sessionStorage.clear());

  it('nova rodada revela outra palavra diretamente para a mesma pessoa', () => {
    const store = TestBed.inject(SessionStore);
    const fixture = TestBed.createComponent(ChaOuCafeComponent);
    fixture.detectChanges();
    const firstWord = store.activeTeaOrCoffee()!.word;
    expect(fixture.nativeElement.textContent).not.toContain(firstWord);
    store.updatePreferences({ countdown: false });
    fixture.componentInstance.revealWord();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain(firstWord);
    fixture.componentInstance.newRound();
    fixture.detectChanges();
    expect(store.activeTeaOrCoffee()!.phase).toBe('revealed');
    expect(store.activeTeaOrCoffee()!.word).not.toBe(firstWord);
    expect(fixture.nativeElement.textContent).toContain(store.activeTeaOrCoffee()!.word);
  });

  it('trocar pessoa sorteia outra palavra e volta à preparação sem expô-la', () => {
    const store = TestBed.inject(SessionStore);
    store.updatePreferences({ countdown: false });
    const fixture = TestBed.createComponent(ChaOuCafeComponent);
    fixture.componentInstance.revealWord();
    const previous = store.activeTeaOrCoffee()!.word;
    fixture.componentInstance.switchLeader();
    fixture.detectChanges();
    expect(store.activeTeaOrCoffee()!.phase).toBe('ready');
    expect(store.activeTeaOrCoffee()!.word).not.toBe(previous);
    expect(fixture.nativeElement.textContent).not.toContain(store.activeTeaOrCoffee()!.word);
  });

  it('usa a mesma preferência compartilhada de countdown do Quem Sou Eu', () => {
    const store = TestBed.inject(SessionStore);
    const engine = TestBed.inject(TeaOrCoffeeEngine);
    store.updatePreferences({ countdown: true });
    store.setTeaOrCoffeeSession(engine.createSession(['Praia']));
    const fixture = TestBed.createComponent(ChaOuCafeComponent);
    fixture.componentInstance.revealWord();
    expect(store.activeTeaOrCoffee()?.phase).toBe('countdown');
  });
});
