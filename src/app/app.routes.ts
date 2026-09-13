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
    path: 'jogar/cha-ou-cafe',
    title: 'Chá ou Café — Mesa',
    loadComponent: () =>
      import('./games/cha-ou-cafe/cha-ou-cafe.component').then(
        (component) => component.ChaOuCafeComponent,
      ),
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
    path: 'jogar/pergunta-do-impostor',
    title: 'Pergunta do Impostor — Mesa',
    loadComponent: () =>
      import('./games/pergunta-do-impostor/pergunta-do-impostor.component').then(
        (component) => component.PerguntaDoImpostorComponent,
      ),
  },
  {
    path: 'jogar/onde-estou',
    title: 'Onde Estou — Mesa',
    loadComponent: () =>
      import('./games/onde-estou/onde-estou.component').then(
        (component) => component.OndeEstouComponent,
      ),
  },
  { path: 'jogar/contato', title: 'Contato — Mesa', loadComponent: () => import('./games/contato/contato.component').then((component) => component.ContatoComponent) },
  { path: 'jogar/qual-e-a-nota', title: 'Qual é a Nota — Mesa', loadComponent: () => import('./games/qual-e-a-nota/qual-e-a-nota.component').then((component) => component.QualEANotaComponent) },
  { path: 'jogar/jogo-da-lista', title: 'Jogo da Lista — Mesa', loadComponent: () => import('./games/jogo-da-lista/jogo-da-lista.component').then((component) => component.JogoDaListaComponent) },
  { path: 'jogar/adivinhe-a-palavra', title: 'Adivinhe a Palavra — Mesa', loadComponent: () => import('./games/adivinhe-a-palavra/adivinhe-a-palavra.component').then((component) => component.AdivinheAPalavraComponent) },
  {
    path: 'jogar/:slug',
    loadComponent: () =>
      import('./games/game-unavailable/game-unavailable.component').then(
        (component) => component.GameUnavailableComponent,
      ),
  },
  { path: '**', redirectTo: '' },
];
