import { Player } from '../../players/player.model';

export type CitySleepsTeam = 'city' | 'evil';
export type CitySleepsRole = 'citizen' | 'killer' | 'doctor' | 'detective';
export type CitySleepsWinner = CitySleepsTeam | null;

export interface CitySleepsRoleDefinition { readonly id: CitySleepsRole; readonly name: string; readonly team: CitySleepsTeam; readonly description: string; }
export const CITY_SLEEPS_ROLES: Record<CitySleepsRole, CitySleepsRoleDefinition> = {
  citizen: { id: 'citizen', name: 'Cidadão', team: 'city', description: 'Descubra quem são os assassinos antes que seja tarde.' },
  killer: { id: 'killer', name: 'Assassino', team: 'evil', description: 'Elimine a cidade sem ser descoberto.' },
  doctor: { id: 'doctor', name: 'Médico', team: 'city', description: 'Proteja uma pessoa durante a noite.' },
  detective: { id: 'detective', name: 'Detetive', team: 'city', description: 'Investigue uma pessoa durante a noite.' },
};
export interface CitySleepsPlayerState { readonly playerId: string; readonly role: CitySleepsRole; readonly team: CitySleepsTeam; readonly alive: boolean; }
export interface CitySleepsConfig { readonly killerCount: number; readonly doctorEnabled: boolean; readonly detectiveEnabled: boolean; readonly revealRoleOnDeath: boolean; }
export type CitySleepsPhase = 'setup' | 'role-handoff' | 'night-intro' | 'night-handoff' | 'night-ritual' | 'night-action' | 'detective-result' | 'night-confirm' | 'night-result' | 'day' | 'vote-handoff' | 'vote-ritual' | 'vote-action' | 'vote-confirm' | 'vote-result' | 'game-over';
export type NightAction =
  | { readonly kind: 'citizen'; readonly symbol: 'moon' | 'star' | 'key' }
  | { readonly kind: 'killer'; readonly targetPlayerId: string }
  | { readonly kind: 'doctor'; readonly targetPlayerId: string }
  | { readonly kind: 'detective'; readonly targetPlayerId: string };
export interface NightResult { readonly eliminatedPlayerId: string | null; readonly protected: boolean; }
export interface VoteResult { readonly eliminatedPlayerId: string | null; readonly tied: boolean; readonly skipped: boolean; }
export interface CitySleepsSession {
  readonly game: 'cidade-dorme'; readonly phase: CitySleepsPhase; readonly players: readonly Player[]; readonly config: CitySleepsConfig;
  readonly playerStates: readonly CitySleepsPlayerState[]; readonly currentPlayerIndex: number; readonly ritualStep: number; readonly roleRevealIndex: number;
  readonly nightNumber: number; readonly actions: Readonly<Record<string, NightAction>>; readonly votes: Readonly<Record<string, string | null>>;
  readonly lastNightResult: NightResult | null; readonly lastVoteResult: VoteResult | null; readonly winner: CitySleepsWinner;
}
export interface RitualTarget { readonly x: number; readonly y: number; readonly color: 'red' | 'yellow'; }
