import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, computed, effect, inject, Injectable, signal } from '@angular/core';
import { ImpostorSession } from '../game-engine/impostor/impostor.models';
import { ItoSession } from '../game-engine/ito/ito.models';
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
  if (!['setup', 'handoff', 'private', 'collective', 'results'].includes(String(phase))) return false;
  if (!Number.isInteger(value['currentPlayerIndex']) || Number(value['currentPlayerIndex']) < 0) return false;
  if (!Number.isInteger(value['round']) || Number(value['round']) < 0) return false;
  if (phase === 'setup') return theme === null && Array.isArray(assignments) && assignments.length === 0;
  if (!isRecord(theme)
    || typeof theme['id'] !== 'string'
    || typeof theme['prompt'] !== 'string'
    || typeof theme['low'] !== 'string'
    || typeof theme['high'] !== 'string') return false;
  if (!Array.isArray(assignments) || assignments.length !== value['players'].length) return false;
  const playerIds = new Set(value['players'].map((player) => player.id));
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
  return assignmentIds.size === value['players'].length
    && numbers.size === value['players'].length
    && Number(value['currentPlayerIndex']) < value['players'].length
    && Number(value['round']) > 0;
}

function isImpostor(value: unknown): value is ImpostorSession {
  if (!isRecord(value) || value['game'] !== 'impostor' || !isPlayerList(value['players'], 3, 12)) return false;
  const phase = value['phase'];
  const config = value['config'];
  const impostorIds = value['impostorPlayerIds'];
  const playerCount = value['players'].length;
  if (!['setup', 'handoff', 'private', 'discussion', 'results'].includes(String(phase))) return false;
  if (!isRecord(config)
    || !Number.isInteger(config['impostorCount'])
    || Number(config['impostorCount']) < 1
    || Number(config['impostorCount']) > Math.floor((playerCount - 1) / 2)
    || typeof config['hintsEnabled'] !== 'boolean') return false;
  if (!Number.isInteger(value['currentPlayerIndex']) || Number(value['currentPlayerIndex']) < 0) return false;
  if (!Number.isInteger(value['round']) || Number(value['round']) < 0) return false;
  if (phase === 'setup') {
    return value['word'] === null && value['hint'] === null
      && Array.isArray(impostorIds) && impostorIds.length === 0;
  }
  if (typeof value['word'] !== 'string' || value['word'].length === 0) return false;
  if (config['hintsEnabled'] ? typeof value['hint'] !== 'string' : value['hint'] !== null) return false;
  if (!Array.isArray(impostorIds) || impostorIds.length !== Number(config['impostorCount'])) return false;
  const playerIds = new Set(value['players'].map((player) => player.id));
  return new Set(impostorIds).size === impostorIds.length
    && impostorIds.every((id) => typeof id === 'string' && playerIds.has(id))
    && Number(value['currentPlayerIndex']) < playerCount
    && Number(value['round']) > 0;
}

function isMesaSession(value: unknown): value is MesaSession {
  if (!isRecord(value) || value['version'] !== SESSION_SCHEMA_VERSION || !isPreferences(value['preferences'])) {
    return false;
  }
  const activeGame = value['activeGame'];
  return activeGame === null || isWhoAmI(activeGame) || isIto(activeGame) || isImpostor(activeGame);
}

function migrateVersionOne(value: unknown): MesaSession | null {
  if (!isRecord(value) || value['version'] !== 1 || !isPreferences(value['preferences'])) return null;
  const activeGame = value['activeGame'];
  if (activeGame !== null && !isWhoAmI(activeGame)) return null;
  return { version: SESSION_SCHEMA_VERSION, preferences: value['preferences'], activeGame };
}

function isPositiveInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0;
}
