import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'jogos/:slug',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => [
      { slug: 'quem-sou-eu' },
      { slug: 'ito' },
      { slug: 'impostor' },
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
