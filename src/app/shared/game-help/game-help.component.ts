import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, afterNextRender, effect, inject, signal, viewChild } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { findGame } from '../../catalog/game-catalog';

@Component({
  selector: 'app-game-help',
  templateUrl: './game-help.component.html',
  styleUrl: './game-help.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameHelpComponent implements OnDestroy {
  private readonly router = inject(Router);
  private readonly dialog = viewChild<ElementRef<HTMLDialogElement>>('dialog');
  private readonly trigger = viewChild<ElementRef<HTMLButtonElement>>('trigger');
  private readonly url = signal(this.router.url);
  private readonly navigation: Subscription;

  readonly game = signal(this.gameFromUrl(this.router.url));

  constructor() {
    this.navigation = this.router.events.pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => this.url.set(event.urlAfterRedirects));
    afterNextRender(() => this.url.set(this.router.url));
    effect(() => this.game.set(this.gameFromUrl(this.url())));
  }

  open(): void {
    const dialog = this.dialog()?.nativeElement;
    if (dialog && !dialog.open) dialog.showModal();
  }

  close(): void {
    this.dialog()?.nativeElement.close();
    this.restoreFocus();
  }

  restoreFocus(): void {
    this.trigger()?.nativeElement.focus();
  }

  ngOnDestroy(): void {
    this.navigation.unsubscribe();
  }

  private gameFromUrl(url: string) {
    const match = /^\/jogar\/([^/?#]+)/.exec(url);
    return match ? findGame(match[1]) : undefined;
  }
}
