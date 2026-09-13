import { RatingTheme } from '../../core/game-engine/rating/rating.models';

export const RATING_THEMES: readonly RatingTheme[] = [
  { id: 'presente', prompt: 'Um presente surpresa', low: '1 = Decepcionante', high: '10 = Inesquecível' },
  { id: 'superpoder', prompt: 'Um superpoder', low: '1 = Quase inútil', high: '10 = Mudaria tudo' },
  { id: 'viagem', prompt: 'Um destino de viagem', low: '1 = Melhor ficar em casa', high: '10 = Viagem dos sonhos' },
  { id: 'karaoke', prompt: 'Uma música no karaokê', low: '1 = Esvazia a sala', high: '10 = Todo mundo canta' },
  { id: 'domingo', prompt: 'Um programa de domingo', low: '1 = Domingo perdido', high: '10 = Domingo perfeito' },
  { id: 'festa', prompt: 'Algo que acontece numa festa', low: '1 = Ninguém nota', high: '10 = Vira história' },
] as const;
