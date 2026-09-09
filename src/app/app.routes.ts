import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'Mesa — Jogos para Jogar Junto',
    loadComponent: () =>
      import('./catalog/home/home.component').then((component) => component.HomeComponent),
  },
  {
    path: 'jogos/:slug',
    loadComponent: () =>
      import('./catalog/game-details/game-details.component').then(
        (component) => component.GameDetailsComponent,
      ),
  },
  {
    path: 'jogar/quem-sou-eu',
    title: 'Quem Sou Eu — Mesa',
    loadComponent: () =>
      import('./games/quem-sou-eu/quem-sou-eu.component').then(
        (component) => component.QuemSouEuComponent,
      ),
  },
  {
    path: 'jogar/ito',
    title: 'Ito — Mesa',
    loadComponent: () =>
      import('./games/ito/ito.component').then((component) => component.ItoComponent),
  },
  {
    path: 'jogar/impostor',
    title: 'Impostor — Mesa',
    loadComponent: () =>
      import('./games/impostor/impostor.component').then((component) => component.ImpostorComponent),
  },
  {
    path: 'jogar/batata-quente',
    title: 'Batata Quente — Mesa',
    loadComponent: () =>
      import('./games/batata-quente/batata-quente.component').then(
        (component) => component.BatataQuenteComponent,
      ),
  },
  {
    path: 'jogar/:slug',
    loadComponent: () =>
      import('./games/game-unavailable/game-unavailable.component').then(
        (component) => component.GameUnavailableComponent,
      ),
  },
  { path: '**', redirectTo: '' },
];
