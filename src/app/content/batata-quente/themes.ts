import { HotPotatoTheme } from '../../core/game-engine/hot-potato/hot-potato.models';

export const HOT_POTATO_THEMES: readonly HotPotatoTheme[] = [
  'Animais mamíferos', 'Coisas que você encontra em uma cozinha', 'Cidades do Brasil',
  'Frutas tropicais', 'Instrumentos musicais', 'Profissões da saúde', 'Jogos de tabuleiro',
  'Filmes de animação', 'Objetos de escritório', 'Esportes olímpicos', 'Países da Europa',
  'Super-heróis', 'Coisas que levamos para a praia', 'Comidas de festa junina',
  'Aparelhos eletrônicos', 'Personagens de desenhos animados', 'Objetos de banheiro',
  'Bandas de rock', 'Esportes aquáticos', 'Ferramentas',
].map((text) => ({ text }));
