import { ItoTheme } from '../../core/game-engine/ito/ito.models';

export const ITO_THEMES: readonly ItoTheme[] = [
  { id: 'medo-escuro', prompt: 'Algo que você teria medo de encontrar no escuro', low: 'Nada assustador', high: 'Extremamente assustador' },
  { id: 'presente', prompt: 'Um presente para receber de surpresa', low: 'Decepcionante', high: 'Inesquecível' },
  { id: 'superpoder', prompt: 'Um superpoder para ter na vida real', low: 'Quase inútil', high: 'Mudaria tudo' },
  { id: 'viagem', prompt: 'Um destino para viajar com a galera', low: 'Melhor ficar em casa', high: 'Viagem dos sonhos' },
  { id: 'comida-madrugada', prompt: 'Uma comida para matar a fome de madrugada', low: 'Não desce', high: 'Perfeita para a hora' },
  { id: 'desculpa-atraso', prompt: 'Uma desculpa para chegar atrasado', low: 'Ninguém acredita', high: 'Totalmente convincente' },
  { id: 'filme-encontro', prompt: 'Um filme para assistir num primeiro encontro', low: 'Clima péssimo', high: 'Escolha perfeita' },
  { id: 'pet', prompt: 'Um animal para ter como pet', low: 'Ideia terrível', high: 'Companheiro ideal' },
  { id: 'festa', prompt: 'Algo que pode acontecer em uma festa', low: 'Passa despercebido', high: 'Vira história por anos' },
  { id: 'trabalho', prompt: 'Uma profissão para experimentar por um dia', low: 'Nem por um minuto', high: 'Meu novo sonho' },
  { id: 'apocalipse', prompt: 'Algo útil durante um apocalipse', low: 'Só ocupa espaço', high: 'Salva o grupo' },
  { id: 'musica-karaoke', prompt: 'Uma música para cantar no karaokê', low: 'Esvazia a sala', high: 'Todo mundo canta junto' },
  { id: 'habilidade', prompt: 'Uma habilidade para aprender instantaneamente', low: 'Pouco útil', high: 'Quero agora' },
  { id: 'vizinho', prompt: 'Um personagem fictício para ter como vizinho', low: 'Pesadelo diário', high: 'Vizinho perfeito' },
  { id: 'domingo', prompt: 'Um programa para um domingo à tarde', low: 'Domingo perdido', high: 'Domingo perfeito' },
  { id: 'fama', prompt: 'Um motivo para ficar famoso', low: 'Melhor no anonimato', high: 'Vale a fama' },
  { id: 'ilha', prompt: 'Algo para levar a uma ilha deserta', low: 'Completamente inútil', high: 'Essencial' },
  { id: 'talento-festa', prompt: 'Um talento para impressionar numa festa', low: 'Ninguém nota', high: 'Rouba a cena' },
] as const;
