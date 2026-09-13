import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'jogos/:slug',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => [
      { slug: 'quem-sou-eu' },
      { slug: 'cha-ou-cafe' },
      { slug: 'ito' },
      { slug: 'impostor' },
      { slug: 'batata-quente' },
      { slug: 'pergunta-do-impostor' },
      { slug: 'onde-estou' },
      { slug: 'contato' },
      { slug: 'qual-e-a-nota' },
      { slug: 'jogo-da-lista' },
      { slug: 'adivinhe-a-palavra' },
    ],
  },
  {
    path: 'jogar/**',
    renderMode: RenderMode.Client,
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  }
];
