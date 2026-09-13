import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, computed, effect, inject, Injectable, signal } from '@angular/core';
import { ImpostorSession } from '../game-engine/impostor/impostor.models';
import { ItoSession } from '../game-engine/ito/ito.models';
import { HOT_POTATO_DURATIONS, HotPotatoSession } from '../game-engine/hot-potato/hot-potato.models';
import { ImpostorQuestionSession } from '../game-engine/impostor-question/impostor-question.models';
import { TeaOrCoffeeSession } from '../game-engine/tea-or-coffee/tea-or-coffee.models';
import { LocationSession } from '../game-engine/location/location.models';
import { ContactSession } from '../game-engine/contact/contact.models';
import { RatingSession } from '../game-engine/rating/rating.models';
import { WordListSession } from '../game-engine/word-list/word-list.models';
import { LetterChainSession } from '../game-engine/letter-chain/letter-chain.models';
import { Player } from '../players/player.model';
import {
  ExperiencePreferences,
  MesaSession,
  SESSION_SCHEMA_VERSION,
  WhoAmISession,
} from './session.models';

const STORAGE_KEY = 'mesa.session';
const DEFAULT_PREFERENCES: ExperiencePreferences = { countdown: true, sound: true, haptics: true };
const DEFAULT_SESSION: MesaSession = {
  version: SESSION_SCHEMA_VERSION,
  preferences: DEFAULT_PREFERENCES,
  activeGame: null,
};

@Injectable({ providedIn: 'root' })
export class SessionStore {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly sessionState = signal<MesaSession>(DEFAULT_SESSION);

  readonly session = this.sessionState.asReadonly();
  readonly preferences = computed(() => this.sessionState().preferences);
  readonly activeWhoAmI = computed(() => {
    const active = this.sessionState().activeGame;
    return active?.game === 'quem-sou-eu' ? active : null;
  });
  readonly activeIto = computed(() => {
    const active = this.sessionState().activeGame;
    return active?.game === 'ito' ? active : null;
  });
  readonly activeImpostor = computed(() => {
    const active = this.sessionState().activeGame;
    return active?.game === 'impostor' ? active : null;
  });
  readonly activeHotPotato = computed(() => {
    const active = this.sessionState().activeGame;
    return active?.game === 'batata-quente' ? active : null;
  });
  readonly activeImpostorQuestion = computed(() => {
    const active = this.sessionState().activeGame;
    return active?.game === 'pergunta-do-impostor' ? active : null;
  });
  readonly activeTeaOrCoffee = computed(() => {
    const active = this.sessionState().activeGame;
    return active?.game === 'cha-ou-cafe' ? active : null;
  });
  readonly activeLocation = computed(() => {
    const active = this.sessionState().activeGame;
    return active?.game === 'onde-estou' ? active : null;
  });
  readonly activeContact = computed(() => { const active = this.sessionState().activeGame; return active?.game === 'contato' ? active : null; });
  readonly activeRating = computed(() => { const active = this.sessionState().activeGame; return active?.game === 'qual-e-a-nota' ? active : null; });
  readonly activeWordList = computed(() => { const active = this.sessionState().activeGame; return active?.game === 'jogo-da-lista' ? active : null; });
  readonly activeLetterChain = computed(() => { const active = this.sessionState().activeGame; return active?.game === 'adivinhe-a-palavra' ? active : null; });

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.sessionState.set(this.restore());
      effect(() => sessionStorage.setItem(STORAGE_KEY, JSON.stringify(this.sessionState())));
    }
  }

  updatePreferences(changes: Partial<ExperiencePreferences>): void {
    this.sessionState.update((current) => ({
      ...current,
      preferences: { ...current.preferences, ...changes },
    }));
  }

  beginWhoAmIRound(identity: string): void {
    const previousRound = this.activeWhoAmI()?.round ?? 0;
    const phase = this.preferences().countdown ? 'countdown' : 'revealed';
    this.setActiveGame({ game: 'quem-sou-eu', identity, phase, round: previousRound + 1 });
  }

  revealWhoAmI(): void {
    const active = this.activeWhoAmI();
    if (active) this.setActiveGame({ ...active, phase: 'revealed' });
  }

  setItoSession(session: ItoSession): void {
    this.setActiveGame(session);
  }

  setImpostorSession(session: ImpostorSession): void {
    this.setActiveGame(session);
  }

  setHotPotatoSession(session: HotPotatoSession): void {
    this.setActiveGame(session);
  }

  setImpostorQuestionSession(session: ImpostorQuestionSession): void {
    this.setActiveGame(session);
  }

  setTeaOrCoffeeSession(session: TeaOrCoffeeSession): void {
    this.setActiveGame(session);
  }

  setLocationSession(session: LocationSession): void {
    this.setActiveGame(session);
  }
  setContactSession(session: ContactSession): void { this.setActiveGame(session); }
  setRatingSession(session: RatingSession): void { this.setActiveGame(session); }
  setWordListSession(session: WordListSession): void { this.setActiveGame(session); }
  setLetterChainSession(session: LetterChainSession): void { this.setActiveGame(session); }

  clearActiveGame(): void {
    this.sessionState.update((current) => ({ ...current, activeGame: null }));
  }

  private setActiveGame(activeGame: MesaSession['activeGame']): void {
    this.sessionState.update((current) => ({ ...current, activeGame }));
  }

  private restore(): MesaSession {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return DEFAULT_SESSION;
      const parsed: unknown = JSON.parse(raw);
      if (isMesaSession(parsed)) return parsed;
      const migratedVersionTen = migrateVersionTen(parsed);
      if (migratedVersionTen) return migratedVersionTen;
      const migratedVersionNine = migrateVersionNine(parsed);
      if (migratedVersionNine) return migratedVersionNine;
      const migratedVersionEight = migrateVersionEight(parsed);
      if (migratedVersionEight) return migratedVersionEight;
      const migratedVersionSeven = migrateVersionSeven(parsed);
      if (migratedVersionSeven) return migratedVersionSeven;
      const migratedVersionSix = migrateVersionSix(parsed);
      if (migratedVersionSix) return migratedVersionSix;
      const migratedVersionFive = migrateVersionFive(parsed);
      if (migratedVersionFive) return migratedVersionFive;
      const migratedVersionFour = migrateVersionFour(parsed);
      if (migratedVersionFour) return migratedVersionFour;
      const migratedVersionThree = migrateVersionThree(parsed);
      if (migratedVersionThree) return migratedVersionThree;
      const migratedVersionTwo = migrateVersionTwo(parsed);
      if (migratedVersionTwo) return migratedVersionTwo;
      const migrated = migrateVersionOne(parsed);
      return migrated ?? DEFAULT_SESSION;
    } catch {
      return DEFAULT_SESSION;
    }
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isPreferences(value: unknown): value is ExperiencePreferences {
  return isRecord(value)
    && typeof value['countdown'] === 'boolean'
    && typeof value['sound'] === 'boolean'
    && typeof value['haptics'] === 'boolean';
}

function isPlayer(value: unknown): value is Player {
  return isRecord(value)
    && typeof value['id'] === 'string' && value['id'].length > 0
    && typeof value['name'] === 'string'
    && typeof value['color'] === 'string' && value['color'].length > 0;
}

function isPlayerList(value: unknown, min: number, max: number): value is Player[] {
  return Array.isArray(value)
    && value.length >= min
    && value.length <= max
    && value.every(isPlayer)
    && new Set(value.map((player) => player.id)).size === value.length;
}

function isWhoAmI(value: unknown): value is WhoAmISession {
  return isRecord(value)
    && value['game'] === 'quem-sou-eu'
    && (value['phase'] === 'countdown' || value['phase'] === 'revealed')
    && typeof value['identity'] === 'string' && value['identity'].length > 0
    && isPositiveInteger(value['round']);
}

function isIto(value: unknown): value is ItoSession {
  if (!isRecord(value) || value['game'] !== 'ito' || !isPlayerList(value['players'], 2, 12)) return false;
  const phase = value['phase'];
  const theme = value['theme'];
  const assignments = value['assignments'];
  if (!['setup', 'handoff', 'collective', 'results'].includes(String(phase))) return false;
  if (!Number.isInteger(value['currentPlayerIndex']) || Number(value['currentPlayerIndex']) < 0) return false;
  if (!Number.isInteger(value['round']) || Number(value['round']) < 0) return false;
  const clues = value['clues'];
  const guessedOrder = value['guessedOrder'];
  const revealedPlayerIds = value['revealedPlayerIds'];
  const playerIds = new Set(value['players'].map((player) => player.id));
  if (!isRecord(clues)
    || Object.keys(clues).length !== playerIds.size
    || ![...playerIds].every((id) => typeof clues[id] === 'string')) return false;
  if (!isPlayerIdPermutation(guessedOrder, playerIds)) return false;
  if (!Array.isArray(revealedPlayerIds)
    || new Set(revealedPlayerIds).size !== revealedPlayerIds.length
    || !revealedPlayerIds.every((id) => typeof id === 'string' && playerIds.has(id))) return false;
  if (typeof value['showCorrectOrder'] !== 'boolean') return false;
  if (phase === 'setup') {
    return theme === null
      && Array.isArray(assignments) && assignments.length === 0
      && revealedPlayerIds.length === 0
      && value['showCorrectOrder'] === false;
  }
  if (!isRecord(theme)
    || typeof theme['id'] !== 'string'
    || typeof theme['prompt'] !== 'string'
    || typeof theme['low'] !== 'string'
    || typeof theme['high'] !== 'string') return false;
  if (!Array.isArray(assignments) || assignments.length !== value['players'].length) return false;
  const assignmentIds = new Set<string>();
  const numbers = new Set<number>();
  for (const assignment of assignments) {
    if (!isRecord(assignment)
      || typeof assignment['playerId'] !== 'string'
      || !playerIds.has(assignment['playerId'])
      || !Number.isInteger(assignment['number'])
      || Number(assignment['number']) < 1
      || Number(assignment['number']) > 100) return false;
    assignmentIds.add(assignment['playerId']);
    numbers.add(Number(assignment['number']));
  }
  const resultStateIsValid = phase === 'results'
    ? (!value['showCorrectOrder'] || revealedPlayerIds.length === value['players'].length)
    : revealedPlayerIds.length === 0 && value['showCorrectOrder'] === false;
  return assignmentIds.size === value['players'].length
    && numbers.size === value['players'].length
    && Number(value['currentPlayerIndex']) < value['players'].length
    && Number(value['round']) > 0
    && resultStateIsValid;
}

function isImpostor(value: unknown): value is ImpostorSession {
  if (!isRecord(value) || value['game'] !== 'impostor' || !isPlayerList(value['players'], 3, 12)) return false;
  const phase = value['phase'];
  const config = value['config'];
  const impostorIds = value['impostorPlayerIds'];
  const playerCount = value['players'].length;
  if (!['setup', 'handoff', 'discussion', 'results'].includes(String(phase))) return false;
  if (!isRecord(config)
    || !Number.isInteger(config['impostorCount'])
    || Number(config['impostorCount']) < 1
    || Number(config['impostorCount']) > Math.floor((playerCount - 1) / 2)
    || (config['mode'] !== 'classic' && config['mode'] !== 'blind')
    || typeof config['giveHint'] !== 'boolean') return false;
  if (!Number.isInteger(value['currentPlayerIndex']) || Number(value['currentPlayerIndex']) < 0) return false;
  if (!Number.isInteger(value['round']) || Number(value['round']) < 0) return false;
  if (phase === 'setup') {
    return value['word'] === null && value['hint'] === null && value['alternativeWord'] === null
      && Array.isArray(impostorIds) && impostorIds.length === 0;
  }
  if (typeof value['word'] !== 'string' || value['word'].length === 0) return false;
  if (config['mode'] === 'classic') {
    if (value['alternativeWord'] !== null) return false;
    if (config['giveHint'] ? typeof value['hint'] !== 'string' : value['hint'] !== null) return false;
  } else if (value['hint'] !== null
    || typeof value['alternativeWord'] !== 'string'
    || value['alternativeWord'].length === 0) return false;
  if (!Array.isArray(impostorIds) || impostorIds.length !== Number(config['impostorCount'])) return false;
  const playerIds = new Set(value['players'].map((player) => player.id));
  return new Set(impostorIds).size === impostorIds.length
    && impostorIds.every((id) => typeof id === 'string' && playerIds.has(id))
    && Number(value['currentPlayerIndex']) < playerCount
    && Number(value['round']) > 0;
}

function isLocation(value: unknown): value is LocationSession {
  if (!isRecord(value) || value['game'] !== 'onde-estou' || !isPlayerList(value['players'], 3, 12)) return false;
  const phase = value['phase'];
  const config = value['config'];
  const impostorIds = value['impostorPlayerIds'];
  const playerCount = value['players'].length;
  if (!['setup', 'handoff', 'discussion', 'results'].includes(String(phase))) return false;
  if (!isRecord(config)
    || !Number.isInteger(config['impostorCount'])
    || Number(config['impostorCount']) < 1
    || Number(config['impostorCount']) > Math.floor((playerCount - 1) / 2)
    || (config['mode'] !== 'classic' && config['mode'] !== 'blind')
    || typeof config['giveHint'] !== 'boolean') return false;
  if (!Number.isInteger(value['currentPlayerIndex']) || Number(value['currentPlayerIndex']) < 0) return false;
  if (!Number.isInteger(value['round']) || Number(value['round']) < 0) return false;
  if (phase === 'setup') {
    return value['location'] === null && value['hint'] === null && value['alternativeLocation'] === null
      && Array.isArray(impostorIds) && impostorIds.length === 0;
  }
  if (typeof value['location'] !== 'string' || value['location'].trim().length === 0) return false;
  if (config['mode'] === 'classic') {
    if (value['alternativeLocation'] !== null) return false;
    if (config['giveHint']
      ? typeof value['hint'] !== 'string' || String(value['hint']).trim().length === 0
      : value['hint'] !== null) return false;
  } else if (value['hint'] !== null
    || typeof value['alternativeLocation'] !== 'string'
    || value['alternativeLocation'].trim().length === 0
    || value['alternativeLocation'] === value['location']) return false;
  if (!Array.isArray(impostorIds) || impostorIds.length !== Number(config['impostorCount'])) return false;
  const playerIds = new Set(value['players'].map((player) => player.id));
  return new Set(impostorIds).size === impostorIds.length
    && impostorIds.every((id) => typeof id === 'string' && playerIds.has(id))
    && Number(value['currentPlayerIndex']) < playerCount
    && Number(value['round']) > 0;
}

function isTeaOrCoffee(value: unknown): value is TeaOrCoffeeSession {
  return isRecord(value)
    && value['game'] === 'cha-ou-cafe'
    && ['ready', 'countdown', 'revealed'].includes(String(value['phase']))
    && typeof value['word'] === 'string' && value['word'].trim().length > 0
    && isPositiveInteger(value['round']);
}

function isHotPotato(value: unknown): value is HotPotatoSession {
  if (!isRecord(value) || value['game'] !== 'batata-quente' || !isPlayerList(value['players'], 2, 12)) return false;
  const phase = value['phase'];
  const theme = value['theme'];
  const playerCount = value['players'].length;
  if (!['setup', 'ready', 'playing', 'result'].includes(String(phase))) return false;
  if (!isRecord(theme) || typeof theme['text'] !== 'string' || theme['text'].length === 0) return false;
  if (!(HOT_POTATO_DURATIONS as readonly unknown[]).includes(value['durationSeconds'])) return false;
  if (!Number.isInteger(value['currentPlayerIndex']) || Number(value['currentPlayerIndex']) < 0 || Number(value['currentPlayerIndex']) >= playerCount) return false;
  if (!Number.isInteger(value['round']) || Number(value['round']) < 0) return false;
  if (phase === 'playing') return typeof value['roundStartedAt'] === 'number' && Number.isFinite(value['roundStartedAt']) && value['loserPlayerId'] === null && Number(value['round']) > 0;
  if (phase === 'result') {
    const playerIds = new Set(value['players'].map((player) => player.id));
    return typeof value['roundStartedAt'] === 'number'
      && typeof value['loserPlayerId'] === 'string'
      && playerIds.has(value['loserPlayerId'])
      && Number(value['round']) > 0;
  }
  return value['roundStartedAt'] === null && value['loserPlayerId'] === null;
}

function isImpostorQuestion(value: unknown): value is ImpostorQuestionSession {
  if (!isRecord(value) || value['game'] !== 'pergunta-do-impostor' || !isPlayerList(value['players'], 3, 12)) return false;
  const phase = value['phase'];
  const config = value['config'];
  const pair = value['pair'];
  const impostorIds = value['impostorPlayerIds'];
  const playerCount = value['players'].length;
  if (!['setup', 'handoff', 'discussion', 'majority-reveal', 'results'].includes(String(phase))) return false;
  if (!isRecord(config)
    || !Number.isInteger(config['impostorCount'])
    || Number(config['impostorCount']) < 1
    || Number(config['impostorCount']) > Math.floor((playerCount - 1) / 2)
    || (config['answerMode'] !== 'spoken' && config['answerMode'] !== 'written')) return false;
  const answers = value['answers'];
  if (!isRecord(answers)) return false;
  if (!Number.isInteger(value['currentPlayerIndex']) || Number(value['currentPlayerIndex']) < 0 || Number(value['currentPlayerIndex']) >= playerCount) return false;
  if (!Number.isInteger(value['round']) || Number(value['round']) < 0) return false;
  if (phase === 'setup') return pair === null
    && value['majorityQuestion'] === null
    && value['impostorQuestion'] === null
    && Array.isArray(impostorIds) && impostorIds.length === 0
    && Object.keys(answers).length === 0;
  if (!isRecord(pair)
    || typeof pair['id'] !== 'string' || pair['id'].length === 0
    || typeof pair['questionA'] !== 'string' || pair['questionA'].length === 0
    || typeof pair['questionB'] !== 'string' || pair['questionB'].length === 0
    || pair['questionA'] === pair['questionB']) return false;
  const majorityQuestion = value['majorityQuestion'];
  const impostorQuestion = value['impostorQuestion'];
  const orientationIsValid = (majorityQuestion === pair['questionA'] && impostorQuestion === pair['questionB'])
    || (majorityQuestion === pair['questionB'] && impostorQuestion === pair['questionA']);
  if (!orientationIsValid || !Array.isArray(impostorIds) || impostorIds.length !== Number(config['impostorCount'])) return false;
  const playerIds = new Set(value['players'].map((player) => player.id));
  const answerEntries = Object.entries(answers);
  const answersAreValid = answerEntries.every(([playerId, answer]) => playerIds.has(playerId)
    && typeof answer === 'string' && answer.trim().length > 0 && answer.length <= 160);
  if (!answersAreValid) return false;
  if (config['answerMode'] === 'spoken' && answerEntries.length > 0) return false;
  if (config['answerMode'] === 'written') {
    const expectedAnswers = phase === 'handoff' ? Number(value['currentPlayerIndex']) : playerCount;
    if (answerEntries.length !== expectedAnswers) return false;
  }
  return Number(value['round']) > 0
    && new Set(impostorIds).size === impostorIds.length
    && impostorIds.every((id) => typeof id === 'string' && playerIds.has(id));
}

function migrateVersionSeven(value: unknown): MesaSession | null {
  if (!isRecord(value) || value['version'] !== 7 || !isPreferences(value['preferences'])) return null;
  const activeGame = migratePreAnswerModeGame(value['activeGame']);
  return activeGame === undefined ? null : { version: SESSION_SCHEMA_VERSION, preferences: value['preferences'], activeGame };
}

function isMesaSession(value: unknown): value is MesaSession {
  if (!isRecord(value) || value['version'] !== SESSION_SCHEMA_VERSION || !isPreferences(value['preferences'])) {
    return false;
  }
  const activeGame = value['activeGame'];
  return activeGame === null || isWhoAmI(activeGame) || isIto(activeGame) || isImpostor(activeGame) || isHotPotato(activeGame) || isImpostorQuestion(activeGame) || isTeaOrCoffee(activeGame) || isLocation(activeGame) || isContact(activeGame) || isRating(activeGame) || isWordList(activeGame) || isLetterChain(activeGame);
}

function migrateVersionTen(value: unknown): MesaSession | null {
  if (!isRecord(value) || value['version'] !== 10 || !isPreferences(value['preferences'])) return null;
  const activeGame = value['activeGame'];
  if (activeGame !== null && !isWhoAmI(activeGame) && !isIto(activeGame) && !isImpostor(activeGame) && !isHotPotato(activeGame) && !isImpostorQuestion(activeGame) && !isTeaOrCoffee(activeGame) && !isLocation(activeGame)) return null;
  return { version: SESSION_SCHEMA_VERSION, preferences: value['preferences'], activeGame };
}

function isContact(value: unknown): value is ContactSession {
  return isRecord(value) && value['game'] === 'contato' && ['ready','countdown','revealed'].includes(String(value['phase'])) && typeof value['word'] === 'string' && value['word'].trim().length > 0 && isPositiveInteger(value['round']);
}

function isLetterChain(value: unknown): value is LetterChainSession {
  return isRecord(value) && value['game'] === 'adivinhe-a-palavra' && typeof value['letter'] === 'string' && /^[A-Z]$/.test(value['letter']) && isPositiveInteger(value['round']);
}

function isWordList(value: unknown): value is WordListSession {
  if (!isRecord(value) || value['game'] !== 'jogo-da-lista' || !['setup','ready','revealed'].includes(String(value['phase'])) || ![5,8,10].includes(Number(value['count'])) || !Number.isInteger(value['round']) || Number(value['round']) < 0 || !Array.isArray(value['words'])) return false;
  return value['phase'] === 'setup' ? value['words'].length === 0 : value['words'].length === value['count'] && value['words'].every((word) => typeof word === 'string' && word.trim().length > 0) && new Set(value['words']).size === value['words'].length && Number(value['round']) > 0;
}

function isRating(value: unknown): value is RatingSession {
  if (!isRecord(value) || value['game'] !== 'qual-e-a-nota' || !isPlayerList(value['players'], 1, 6) || !['setup','theme','handoff','discussion'].includes(String(value['phase'])) || !['pairs','one-vs-all'].includes(String(value['mode'])) || !Number.isInteger(value['currentPlayerIndex']) || !Number.isInteger(value['round'])) return false;
  if (value['phase'] === 'setup') return value['theme'] === null && Array.isArray(value['assignments']) && value['assignments'].length === 0;
  if (!isRecord(value['theme']) || typeof value['theme']['id'] !== 'string' || typeof value['theme']['prompt'] !== 'string' || typeof value['theme']['low'] !== 'string' || typeof value['theme']['high'] !== 'string' || !Array.isArray(value['assignments'])) return false;
  const expected = value['mode'] === 'one-vs-all' ? 1 : value['players'].length;
  const ids = new Set(value['players'].map((player) => player.id));
  return value['assignments'].length === expected && value['assignments'].every((item) => isRecord(item) && typeof item['playerId'] === 'string' && ids.has(item['playerId']) && Number.isInteger(item['grade']) && Number(item['grade']) >= 1 && Number(item['grade']) <= 10) && Number(value['currentPlayerIndex']) >= 0 && Number(value['currentPlayerIndex']) < expected && Number(value['round']) > 0;
}

function migrateVersionNine(value: unknown): MesaSession | null {
  if (!isRecord(value) || value['version'] !== 9 || !isPreferences(value['preferences'])) return null;
  const activeGame = value['activeGame'];
  if (activeGame === null) return { version: SESSION_SCHEMA_VERSION, preferences: value['preferences'], activeGame };
  if (isWhoAmI(activeGame) || isIto(activeGame) || isImpostor(activeGame) || isHotPotato(activeGame)
    || isImpostorQuestion(activeGame) || isTeaOrCoffee(activeGame)) {
    return { version: SESSION_SCHEMA_VERSION, preferences: value['preferences'], activeGame };
  }
  if (!isRecord(activeGame) || activeGame['game'] !== 'onde-estou' || !isRecord(activeGame['config'])) return null;
  const candidate: unknown = {
    ...activeGame,
    config: { ...activeGame['config'], mode: 'classic' },
    alternativeLocation: null,
  };
  return isLocation(candidate)
    ? { version: SESSION_SCHEMA_VERSION, preferences: value['preferences'], activeGame: candidate }
    : null;
}

function migrateVersionEight(value: unknown): MesaSession | null {
  if (!isRecord(value) || value['version'] !== 8 || !isPreferences(value['preferences'])) return null;
  const activeGame = value['activeGame'];
  if (activeGame !== null && !isWhoAmI(activeGame) && !isIto(activeGame) && !isImpostor(activeGame)
    && !isHotPotato(activeGame) && !isImpostorQuestion(activeGame) && !isTeaOrCoffee(activeGame)) return null;
  return { version: SESSION_SCHEMA_VERSION, preferences: value['preferences'], activeGame };
}

function migrateVersionSix(value: unknown): MesaSession | null {
  if (!isRecord(value) || value['version'] !== 6 || !isPreferences(value['preferences'])) return null;
  const activeGame = migratePreAnswerModeGame(value['activeGame'], false);
  if (activeGame === undefined) return null;
  return { version: SESSION_SCHEMA_VERSION, preferences: value['preferences'], activeGame };
}

function migratePreAnswerModeGame(value: unknown, acceptsTeaOrCoffee = true): MesaSession['activeGame'] | undefined {
  if (value === null) return null;
  if (isWhoAmI(value) || isIto(value) || isImpostor(value) || isHotPotato(value) || (acceptsTeaOrCoffee && isTeaOrCoffee(value))) return value;
  if (!isRecord(value) || value['game'] !== 'pergunta-do-impostor' || !isRecord(value['config'])) return undefined;
  const candidate: unknown = {
    ...value,
    config: { ...value['config'], answerMode: 'spoken' },
    answers: {},
  };
  return isImpostorQuestion(candidate) ? candidate : undefined;
}

function migrateVersionFive(value: unknown): MesaSession | null {
  if (!isRecord(value) || value['version'] !== 5 || !isPreferences(value['preferences'])) return null;
  const activeGame = value['activeGame'];
  if (activeGame !== null && !isWhoAmI(activeGame) && !isIto(activeGame) && !isImpostor(activeGame) && !isHotPotato(activeGame)) return null;
  return { version: SESSION_SCHEMA_VERSION, preferences: value['preferences'], activeGame };
}

function migrateVersionFour(value: unknown): MesaSession | null {
  if (!isRecord(value) || value['version'] !== 4 || !isPreferences(value['preferences'])) return null;
  const activeGame = value['activeGame'];
  if (activeGame !== null && !isWhoAmI(activeGame) && !isIto(activeGame) && !isImpostor(activeGame)) return null;
  return { version: SESSION_SCHEMA_VERSION, preferences: value['preferences'], activeGame };
}

function migrateVersionOne(value: unknown): MesaSession | null {
  if (!isRecord(value) || value['version'] !== 1 || !isPreferences(value['preferences'])) return null;
  const activeGame = value['activeGame'];
  if (activeGame !== null && !isWhoAmI(activeGame)) return null;
  return { version: SESSION_SCHEMA_VERSION, preferences: value['preferences'], activeGame };
}

function migrateVersionThree(value: unknown): MesaSession | null {
  if (!isRecord(value) || value['version'] !== 3 || !isPreferences(value['preferences'])) return null;
  const activeGame = value['activeGame'];
  if (activeGame === null || isWhoAmI(activeGame) || isIto(activeGame)) {
    return { version: SESSION_SCHEMA_VERSION, preferences: value['preferences'], activeGame };
  }
  const migratedImpostor = migrateLegacyImpostor(activeGame);
  return migratedImpostor
    ? { version: SESSION_SCHEMA_VERSION, preferences: value['preferences'], activeGame: migratedImpostor }
    : null;
}

function migrateVersionTwo(value: unknown): MesaSession | null {
  if (!isRecord(value) || value['version'] !== 2 || !isPreferences(value['preferences'])) return null;
  const activeGame = value['activeGame'];
  if (activeGame === null || isWhoAmI(activeGame)) {
    return { version: SESSION_SCHEMA_VERSION, preferences: value['preferences'], activeGame };
  }
  if (!isRecord(activeGame)) return null;
  if (activeGame['game'] === 'ito' && isPlayerList(activeGame['players'], 2, 12)) {
    const players = activeGame['players'];
    const candidate: unknown = {
      ...activeGame,
      phase: activeGame['phase'] === 'private' ? 'handoff' : activeGame['phase'],
      clues: Object.fromEntries(players.map((player) => [player.id, ''])),
      guessedOrder: players.map((player) => player.id),
      revealedPlayerIds: [],
      showCorrectOrder: false,
    };
    return isIto(candidate)
      ? { version: SESSION_SCHEMA_VERSION, preferences: value['preferences'], activeGame: candidate }
      : null;
  }
  if (activeGame['game'] === 'impostor') {
    const migratedImpostor = migrateLegacyImpostor(activeGame);
    return migratedImpostor
      ? { version: SESSION_SCHEMA_VERSION, preferences: value['preferences'], activeGame: migratedImpostor }
      : null;
  }
  return null;
}

function migrateLegacyImpostor(value: unknown): ImpostorSession | null {
  if (!isRecord(value) || value['game'] !== 'impostor' || !isRecord(value['config'])) return null;
  const legacyConfig = value['config'];
  const candidate: unknown = {
    ...value,
    phase: value['phase'] === 'private' ? 'handoff' : value['phase'],
    config: {
      impostorCount: legacyConfig['impostorCount'],
      mode: 'classic',
      giveHint: typeof legacyConfig['hintsEnabled'] === 'boolean' ? legacyConfig['hintsEnabled'] : true,
    },
    alternativeWord: null,
  };
  return isImpostor(candidate) ? candidate : null;
}

function isPlayerIdPermutation(value: unknown, playerIds: ReadonlySet<string>): value is string[] {
  return Array.isArray(value)
    && value.length === playerIds.size
    && new Set(value).size === value.length
    && value.every((id) => typeof id === 'string' && playerIds.has(id));
}

function isPositiveInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0;
}
