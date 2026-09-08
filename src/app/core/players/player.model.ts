export interface Player {
  readonly id: string;
  readonly name: string;
  readonly color: string;
}

export const PLAYER_COLORS = [
  '#FFAA00',
  '#3B82F6',
  '#EF4444',
  '#A855F7',
  '#22C55E',
  '#F97316',
  '#14B8A6',
  '#EC4899',
  '#84CC16',
  '#6366F1',
  '#06B6D4',
  '#EAB308',
] as const;

export function createPlayers(count: number): Player[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `player-${index + 1}`,
    name: `Jogador ${index + 1}`,
    color: PLAYER_COLORS[index % PLAYER_COLORS.length],
  }));
}

export function normalizePlayers(players: readonly Player[]): Player[] {
  return players.map((player, index) => ({
    ...player,
    name: player.name.trim() || `Jogador ${index + 1}`,
    color: PLAYER_COLORS[index % PLAYER_COLORS.length],
  }));
}
