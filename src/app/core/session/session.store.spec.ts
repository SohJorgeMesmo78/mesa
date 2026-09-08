import { TestBed } from '@angular/core/testing';
import { SessionStore } from './session.store';

describe('SessionStore', () => {
  beforeEach(() => {
    sessionStorage.clear();
    TestBed.resetTestingModule();
  });

  afterEach(() => sessionStorage.clear());

  it('restaura uma sessão v2 válida após recarregar a aplicação', () => {
    sessionStorage.setItem('mesa.session', JSON.stringify({
      version: 2,
      preferences: { countdown: false, sound: true, haptics: false },
      activeGame: {
        game: 'quem-sou-eu',
        phase: 'revealed',
        identity: 'Astronauta',
        round: 3,
      },
    }));

    const store = TestBed.inject(SessionStore);

    expect(store.preferences()).toEqual({ countdown: false, sound: true, haptics: false });
    expect(store.activeWhoAmI()?.identity).toBe('Astronauta');
    expect(store.activeWhoAmI()?.round).toBe(3);
  });

  it('descarta dados inválidos em vez de restaurar uma partida quebrada', () => {
    sessionStorage.setItem('mesa.session', JSON.stringify({ version: 2, activeGame: { game: 'ito' } }));

    const store = TestBed.inject(SessionStore);

    expect(store.session().activeGame).toBeNull();
    expect(store.preferences()).toEqual({ countdown: true, sound: true, haptics: true });
  });
});
