import { TestBed } from '@angular/core/testing';
import { SessionStore } from './session.store';

describe('SessionStore', () => {
  beforeEach(() => {
    sessionStorage.clear();
    TestBed.resetTestingModule();
  });

  afterEach(() => sessionStorage.clear());

  it('restaura uma ação privada de Cidade Dorme na tela protegida sem duplicá-la', () => {
    const players = Array.from({ length: 5 }, (_, index) => ({ id: `p${index + 1}`, name: `Pessoa ${index + 1}`, color: '#FFAA00' }));
    sessionStorage.setItem('mesa.session', JSON.stringify({
      version: 12,
      preferences: { countdown: true, sound: true, haptics: true },
      activeGame: {
        game: 'cidade-dorme', phase: 'detective-result', players,
        config: { killerCount: 1, doctorEnabled: true, detectiveEnabled: true, revealRoleOnDeath: false },
        playerStates: [
          { playerId: 'p1', role: 'killer', team: 'evil', alive: true },
          { playerId: 'p2', role: 'doctor', team: 'city', alive: true },
          { playerId: 'p3', role: 'detective', team: 'city', alive: true },
          { playerId: 'p4', role: 'citizen', team: 'city', alive: true },
          { playerId: 'p5', role: 'citizen', team: 'city', alive: true },
        ],
        currentPlayerIndex: 2, ritualStep: 2, roleRevealIndex: 4, nightNumber: 1,
        actions: { p3: { kind: 'detective', targetPlayerId: 'p1' } }, votes: {},
        lastNightResult: null, lastVoteResult: null, winner: null,
      },
    }));
    const store = TestBed.inject(SessionStore);
    expect(store.activeCitySleeps()?.phase).toBe('night-handoff');
    expect(store.activeCitySleeps()?.actions['p3']).toEqual({ kind: 'detective', targetPlayerId: 'p1' });
  });

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

  it('persiste pistas, ordem e revelações do Ito por ID', () => {
    sessionStorage.setItem('mesa.session', JSON.stringify({
      version: 3,
      preferences: { countdown: true, sound: true, haptics: true },
      activeGame: {
        game: 'ito',
        phase: 'results',
        players: [
          { id: 'p1', name: 'Ana', color: '#FFAA00' },
          { id: 'p2', name: 'Beto', color: '#3B82F6' },
          { id: 'p3', name: 'Caio', color: '#EF4444' },
        ],
        theme: { id: 'tema', prompt: 'Tema', low: 'Baixo', high: 'Alto' },
        assignments: [
          { playerId: 'p1', number: 10 },
          { playerId: 'p2', number: 80 },
          { playerId: 'p3', number: 40 },
        ],
        clues: { p1: 'Pista A', p2: 'Pista B', p3: '' },
        guessedOrder: ['p2', 'p1', 'p3'],
        revealedPlayerIds: ['p2'],
        showCorrectOrder: false,
        currentPlayerIndex: 2,
        round: 1,
      },
    }));

    const store = TestBed.inject(SessionStore);

    expect(store.activeIto()?.clues['p2']).toBe('Pista B');
    expect(store.activeIto()?.guessedOrder).toEqual(['p2', 'p1', 'p3']);
    expect(store.activeIto()?.revealedPlayerIds).toEqual(['p2']);
  });

  it('migra sessão v2 do Ito e volta uma revelação privada ao estado seguro', () => {
    sessionStorage.setItem('mesa.session', JSON.stringify({
      version: 2,
      preferences: { countdown: true, sound: true, haptics: true },
      activeGame: {
        game: 'ito',
        phase: 'private',
        players: [
          { id: 'p1', name: 'Ana', color: '#FFAA00' },
          { id: 'p2', name: 'Beto', color: '#3B82F6' },
        ],
        theme: { id: 'tema', prompt: 'Tema', low: 'Baixo', high: 'Alto' },
        assignments: [{ playerId: 'p1', number: 10 }, { playerId: 'p2', number: 80 }],
        currentPlayerIndex: 0,
        round: 1,
      },
    }));

    const store = TestBed.inject(SessionStore);

    expect(store.activeIto()?.phase).toBe('handoff');
    expect(store.activeIto()?.guessedOrder).toEqual(['p1', 'p2']);
    expect(store.activeIto()?.revealedPlayerIds).toEqual([]);
  });

  it('migra o Impostor v3 para o modo Clássico preservando a dica', () => {
    sessionStorage.setItem('mesa.session', JSON.stringify({
      version: 3,
      preferences: { countdown: true, sound: true, haptics: true },
      activeGame: {
        game: 'impostor', phase: 'discussion',
        players: [
          { id: 'p1', name: 'Ana', color: '#FFAA00' },
          { id: 'p2', name: 'Beto', color: '#3B82F6' },
          { id: 'p3', name: 'Caio', color: '#EF4444' },
        ],
        config: { impostorCount: 1, hintsEnabled: true },
        word: 'Casa', hint: 'Moradia', impostorPlayerIds: ['p2'], currentPlayerIndex: 2, round: 1,
      },
    }));
    const store = TestBed.inject(SessionStore);
    expect(store.activeImpostor()?.config).toEqual({ impostorCount: 1, mode: 'classic', giveHint: true });
    expect(store.activeImpostor()?.alternativeWord).toBeNull();
  });

  it('restaura modo No escuro e palavra alternativa da sessão v4', () => {
    sessionStorage.setItem('mesa.session', JSON.stringify({
      version: 4,
      preferences: { countdown: true, sound: true, haptics: true },
      activeGame: {
        game: 'impostor', phase: 'handoff',
        players: [
          { id: 'p1', name: 'Ana', color: '#FFAA00' },
          { id: 'p2', name: 'Beto', color: '#3B82F6' },
          { id: 'p3', name: 'Caio', color: '#EF4444' },
        ],
        config: { impostorCount: 1, mode: 'blind', giveHint: false },
        word: 'Casa', hint: null, alternativeWord: 'Sala', impostorPlayerIds: ['p2'], currentPlayerIndex: 1, round: 2,
      },
    }));
    const store = TestBed.inject(SessionStore);
    expect(store.activeImpostor()?.config.mode).toBe('blind');
    expect(store.activeImpostor()?.alternativeWord).toBe('Sala');
    expect(store.activeImpostor()?.currentPlayerIndex).toBe(1);
  });

  it('restaura uma rodada ativa de Batata Quente com timestamp e jogador atual', () => {
    sessionStorage.setItem('mesa.session', JSON.stringify({
      version: 5,
      preferences: { countdown: true, sound: false, haptics: true },
      activeGame: {
        game: 'batata-quente', phase: 'playing',
        players: [
          { id: 'p1', name: 'Ana', color: '#FFAA00' },
          { id: 'p2', name: 'Beto', color: '#3B82F6' },
        ],
        durationSeconds: 60, theme: { text: 'Frutas tropicais' }, currentPlayerIndex: 1,
        roundStartedAt: 1000, loserPlayerId: null, round: 2,
      },
    }));
    const store = TestBed.inject(SessionStore);
    expect(store.activeHotPotato()?.phase).toBe('playing');
    expect(store.activeHotPotato()?.currentPlayerIndex).toBe(1);
    expect(store.activeHotPotato()?.roundStartedAt).toBe(1000);
  });

  for (const phase of ['handoff', 'discussion', 'majority-reveal', 'results'] as const) {
    it(`restaura Pergunta do Impostor durante ${phase}`, () => {
      sessionStorage.setItem('mesa.session', JSON.stringify({
        version: 6,
        preferences: { countdown: true, sound: true, haptics: true },
        activeGame: {
          game: 'pergunta-do-impostor', phase,
          players: [
            { id: 'p1', name: 'Ana', color: '#FFAA00' },
            { id: 'p2', name: 'Beto', color: '#3B82F6' },
            { id: 'p3', name: 'Caio', color: '#EF4444' },
          ],
          config: { impostorCount: 1 },
          pair: {
            id: 'comida-frequencia',
            questionA: 'Qual comida você comeria todo dia?',
            questionB: 'Qual comida você nunca mais gostaria de comer?',
          },
          majorityQuestion: 'Qual comida você comeria todo dia?',
          impostorQuestion: 'Qual comida você nunca mais gostaria de comer?',
          impostorPlayerIds: ['p2'], currentPlayerIndex: 1, round: 2,
        },
      }));

      const store = TestBed.inject(SessionStore);
      expect(store.activeImpostorQuestion()?.phase).toBe(phase);
      expect(store.activeImpostorQuestion()?.currentPlayerIndex).toBe(1);
      expect(store.activeImpostorQuestion()?.impostorPlayerIds).toEqual(['p2']);
    });
  }

  it('migra Pergunta do Impostor v7 para respostas em voz alta', () => {
    sessionStorage.setItem('mesa.session', JSON.stringify({
      version: 7,
      preferences: { countdown: true, sound: true, haptics: true },
      activeGame: {
        game: 'pergunta-do-impostor', phase: 'discussion',
        players: [
          { id: 'p1', name: 'Ana', color: '#FFAA00' },
          { id: 'p2', name: 'Beto', color: '#3B82F6' },
          { id: 'p3', name: 'Caio', color: '#EF4444' },
        ],
        config: { impostorCount: 1 },
        pair: { id: 'x', questionA: 'Pergunta A?', questionB: 'Pergunta B?' },
        majorityQuestion: 'Pergunta A?', impostorQuestion: 'Pergunta B?',
        impostorPlayerIds: ['p2'], currentPlayerIndex: 2, round: 1,
      },
    }));

    const restored = TestBed.inject(SessionStore).activeImpostorQuestion();
    expect(restored?.config.answerMode).toBe('spoken');
    expect(restored?.answers).toEqual({});
  });

  it('restaura respostas escritas durante a distribuição e na tela coletiva', () => {
    const base = {
      game: 'pergunta-do-impostor',
      players: [
        { id: 'p1', name: 'Ana', color: '#FFAA00' },
        { id: 'p2', name: 'Beto', color: '#3B82F6' },
        { id: 'p3', name: 'Caio', color: '#EF4444' },
      ],
      config: { impostorCount: 1, answerMode: 'written' },
      pair: { id: 'x', questionA: 'Pergunta A?', questionB: 'Pergunta B?' },
      majorityQuestion: 'Pergunta A?', impostorQuestion: 'Pergunta B?',
      impostorPlayerIds: ['p2'], round: 1,
    };
    sessionStorage.setItem('mesa.session', JSON.stringify({
      version: 8,
      preferences: { countdown: true, sound: true, haptics: true },
      activeGame: { ...base, phase: 'handoff', currentPlayerIndex: 1, answers: { p1: 'Resposta da Ana' } },
    }));
    expect(TestBed.inject(SessionStore).activeImpostorQuestion()?.answers).toEqual({ p1: 'Resposta da Ana' });

    TestBed.resetTestingModule();
    sessionStorage.setItem('mesa.session', JSON.stringify({
      version: 8,
      preferences: { countdown: true, sound: true, haptics: true },
      activeGame: { ...base, phase: 'majority-reveal', currentPlayerIndex: 2, answers: { p1: 'A', p2: 'B', p3: 'C' } },
    }));
    expect(Object.keys(TestBed.inject(SessionStore).activeImpostorQuestion()!.answers)).toEqual(['p1', 'p2', 'p3']);
  });

  it('descarta uma sessão inválida de Pergunta do Impostor com impostor duplicado', () => {
    sessionStorage.setItem('mesa.session', JSON.stringify({
      version: 6,
      preferences: { countdown: true, sound: true, haptics: true },
      activeGame: {
        game: 'pergunta-do-impostor', phase: 'discussion',
        players: [
          { id: 'p1', name: 'Ana', color: '#FFAA00' },
          { id: 'p2', name: 'Beto', color: '#3B82F6' },
          { id: 'p3', name: 'Caio', color: '#EF4444' },
          { id: 'p4', name: 'Duda', color: '#22C55E' },
          { id: 'p5', name: 'Eva', color: '#A855F7' },
        ],
        config: { impostorCount: 2 },
        pair: { id: 'x', questionA: 'Pergunta A?', questionB: 'Pergunta B?' },
        majorityQuestion: 'Pergunta A?', impostorQuestion: 'Pergunta B?',
        impostorPlayerIds: ['p2', 'p2'], currentPlayerIndex: 0, round: 1,
      },
    }));

    expect(TestBed.inject(SessionStore).activeImpostorQuestion()).toBeNull();
  });

  it('restaura Chá ou Café preservando palavra revelada e rodada', () => {
    sessionStorage.setItem('mesa.session', JSON.stringify({
      version: 7,
      preferences: { countdown: true, sound: false, haptics: true },
      activeGame: { game: 'cha-ou-cafe', phase: 'revealed', word: 'Praia', round: 4 },
    }));

    const restored = TestBed.inject(SessionStore).activeTeaOrCoffee();
    expect(restored).toEqual({ game: 'cha-ou-cafe', phase: 'revealed', word: 'Praia', round: 4 });
  });

  it('descarta sessão inválida de Chá ou Café', () => {
    sessionStorage.setItem('mesa.session', JSON.stringify({
      version: 7,
      preferences: { countdown: true, sound: true, haptics: true },
      activeGame: { game: 'cha-ou-cafe', phase: 'revealed', word: '', round: 0 },
    }));

    expect(TestBed.inject(SessionStore).activeTeaOrCoffee()).toBeNull();
  });

  for (const phase of ['handoff', 'discussion', 'results'] as const) {
    it(`restaura Onde Estou durante ${phase}`, () => {
      sessionStorage.setItem('mesa.session', JSON.stringify({
        version: 9,
        preferences: { countdown: true, sound: true, haptics: true },
        activeGame: {
          game: 'onde-estou', phase,
          players: [
            { id: 'p1', name: 'Ana', color: '#FFAA00' },
            { id: 'p2', name: 'Beto', color: '#3B82F6' },
            { id: 'p3', name: 'Caio', color: '#EF4444' },
          ],
          config: { impostorCount: 1, giveHint: true },
          location: 'Aeroporto', hint: 'Viagem', impostorPlayerIds: ['p2'],
          currentPlayerIndex: 1, round: 2,
        },
      }));

      const restored = TestBed.inject(SessionStore).activeLocation();
      expect(restored?.phase).toBe(phase);
      expect(restored?.location).toBe('Aeroporto');
      expect(restored?.impostorPlayerIds).toEqual(['p2']);
    });
  }

  it('migra uma sessão v8 sem alterar a partida ativa', () => {
    sessionStorage.setItem('mesa.session', JSON.stringify({
      version: 8,
      preferences: { countdown: false, sound: true, haptics: false },
      activeGame: { game: 'cha-ou-cafe', phase: 'revealed', word: 'Praia', round: 3 },
    }));
    const store = TestBed.inject(SessionStore);
    expect(store.session().version).toBe(12);
    expect(store.activeTeaOrCoffee()?.word).toBe('Praia');
  });

  it('descarta sessão inválida de Onde Estou', () => {
    sessionStorage.setItem('mesa.session', JSON.stringify({
      version: 9,
      preferences: { countdown: true, sound: true, haptics: true },
      activeGame: {
        game: 'onde-estou', phase: 'discussion',
        players: [
          { id: 'p1', name: 'Ana', color: '#FFAA00' },
          { id: 'p2', name: 'Beto', color: '#3B82F6' },
          { id: 'p3', name: 'Caio', color: '#EF4444' },
        ],
        config: { impostorCount: 1, giveHint: true },
        location: 'Aeroporto', hint: 'Viagem', impostorPlayerIds: ['inexistente'],
        currentPlayerIndex: 0, round: 1,
      },
    }));
    expect(TestBed.inject(SessionStore).activeLocation()).toBeNull();
  });

  it('migra Onde Estou v9 para o modo Clássico preservando a dica', () => {
    sessionStorage.setItem('mesa.session', JSON.stringify({
      version: 9,
      preferences: { countdown: true, sound: true, haptics: true },
      activeGame: {
        game: 'onde-estou', phase: 'discussion',
        players: [
          { id: 'p1', name: 'Ana', color: '#FFAA00' },
          { id: 'p2', name: 'Beto', color: '#3B82F6' },
          { id: 'p3', name: 'Caio', color: '#EF4444' },
        ],
        config: { impostorCount: 1, giveHint: true },
        location: 'Aeroporto', hint: 'Viagem', impostorPlayerIds: ['p2'],
        currentPlayerIndex: 2, round: 1,
      },
    }));
    const restored = TestBed.inject(SessionStore).activeLocation();
    expect(restored?.config).toEqual({ impostorCount: 1, mode: 'classic', giveHint: true });
    expect(restored?.alternativeLocation).toBeNull();
  });

  it('restaura Onde Estou no escuro com o local alternativo', () => {
    sessionStorage.setItem('mesa.session', JSON.stringify({
      version: 10,
      preferences: { countdown: true, sound: true, haptics: true },
      activeGame: {
        game: 'onde-estou', phase: 'results',
        players: [
          { id: 'p1', name: 'Ana', color: '#FFAA00' },
          { id: 'p2', name: 'Beto', color: '#3B82F6' },
          { id: 'p3', name: 'Caio', color: '#EF4444' },
        ],
        config: { impostorCount: 1, mode: 'blind', giveHint: true },
        location: 'Aeroporto', alternativeLocation: 'Rodoviária', hint: null,
        impostorPlayerIds: ['p2'], currentPlayerIndex: 2, round: 2,
      },
    }));
    const restored = TestBed.inject(SessionStore).activeLocation();
    expect(restored?.config.mode).toBe('blind');
    expect(restored?.alternativeLocation).toBe('Rodoviária');
  });

  it('descarta dados inválidos em vez de restaurar uma partida quebrada', () => {
    sessionStorage.setItem('mesa.session', JSON.stringify({ version: 2, activeGame: { game: 'ito' } }));

    const store = TestBed.inject(SessionStore);

    expect(store.session().activeGame).toBeNull();
    expect(store.preferences()).toEqual({ countdown: true, sound: true, haptics: true });
  });
});
