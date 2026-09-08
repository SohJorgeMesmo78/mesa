import { GameDefinition } from '../core/game-engine/game-definition';

export const GAME_CATALOG = [
  {
    id: 'who-am-i',
    slug: 'quem-sou-eu',
    name: 'Quem Sou Eu',
    shortDescription: 'Uma identidade na tela. Perguntas na roda. Adivinhe quem você é.',
    fullDescription:
      'O Mesa sorteia uma identidade e prepara a tela para que o grupo veja. Quem está jogando faz perguntas de sim ou não até descobrir quem é.',
    players: { min: 2, max: 20 },
    estimatedMinutes: 10,
    categories: ['Adivinhação'],
    complexity: 'easy',
    deviceMode: 'single-device',
    vibe: ['leve', 'rápido', 'quebra-gelo'],
    goodFor: ['amigos', 'família', 'grupos novos'],
    engine: 'identity-reveal',
    features: ['countdown', 'audio', 'haptics'],
    availability: 'available',
    accent: '#EF4444',
    instructions: [
      'Comece a rodada e posicione o celular sem olhar a identidade.',
      'O grupo responde apenas “sim” ou “não” às suas perguntas.',
      'Quando adivinhar — ou quiser trocar — comece uma nova rodada.',
    ],
    appResponsibility:
      'O Mesa sorteia e revela a identidade. Perguntas, respostas e acertos ficam com a roda.',
  },
  {
    id: 'ito',
    slug: 'ito',
    name: 'Ito',
    shortDescription: 'Dicas subjetivas, números secretos e uma missão: entrar na mesma sintonia.',
    fullDescription:
      'Cada pessoa recebe um número de 1 a 100 e dá uma dica dentro de uma escala. A mesa tenta ordenar as dicas sem conhecer os números.',
    players: { min: 2, max: 12 },
    estimatedMinutes: 15,
    categories: ['Cooperativo'],
    complexity: 'medium',
    deviceMode: 'single-device',
    vibe: ['criativo', 'cooperativo', 'conversa'],
    goodFor: ['amigos próximos', 'grupos criativos'],
    engine: 'scale-ordering',
    features: ['private-reveal', 'player-setup'],
    availability: 'available',
    accent: '#3B82F6',
    instructions: [
      'Cada pessoa recebe um número secreto entre 1 e 100.',
      'Dê uma dica que represente sua posição na escala da rodada.',
      'Em grupo, organizem as dicas antes de revelar os números.',
    ],
    appResponsibility: 'O Mesa distribui números e propõe a escala. A conversa e a ordem são do grupo.',
  },
  {
    id: 'impostor',
    slug: 'impostor',
    name: 'Impostor',
    shortDescription: 'Palavras, pistas e uma pessoa fora de sintonia. Será que ela sabe?',
    fullDescription:
      'Informações privadas colocam uma ou mais pessoas fora de sintonia. Escolha se o impostor conhece seu papel ou também joga no escuro.',
    players: { min: 3, max: 12 },
    estimatedMinutes: 15,
    categories: ['Blefe', 'Dedução'],
    complexity: 'medium',
    deviceMode: 'single-device',
    vibe: ['blefe', 'suspeita', 'debate'],
    goodFor: ['grupos competitivos', 'festas'],
    engine: 'hidden-role',
    features: ['private-reveal', 'player-setup'],
    availability: 'available',
    accent: '#A855F7',
    instructions: [
      'Passe o celular para cada pessoa revelar sua informação.',
      'Dê uma pista relacionada ao segredo sem ser óbvio demais.',
      'Debatam e votem em quem parece estar improvisando.',
    ],
    appResponsibility: 'O Mesa distribui as informações privadas. Pistas, debate e votação são presenciais.',
    modes: [
      { name: 'Clássico', description: 'O impostor sabe seu papel e pode ou não receber uma dica.' },
      { name: 'No escuro', description: 'Todos recebem uma palavra e ninguém sabe quem recebeu a diferente.' },
    ],
  },
] as const satisfies readonly GameDefinition[];

export function findGame(slug: string): GameDefinition | undefined {
  return GAME_CATALOG.find((game) => game.slug === slug);
}
