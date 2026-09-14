import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Component } from '@angular/core';
import { provideRouter, Router } from '@angular/router';
import { GameHelpComponent } from './game-help.component';

@Component({ template: '' })
class EmptyRouteComponent {}

describe('GameHelpComponent', () => {
  beforeEach(() => TestBed.configureTestingModule({ imports: [GameHelpComponent], providers: [provideRouter([{ path: '**', component: EmptyRouteComponent }])] }));

  it('abre, fecha e devolve o foco sem alterar o armazenamento da sessão', fakeAsync(() => {
    const router = TestBed.inject(Router);
    router.navigateByUrl('/jogar/ito'); tick();
    const fixture = TestBed.createComponent(GameHelpComponent);
    fixture.detectChanges(); tick(); fixture.detectChanges();
    const trigger: HTMLButtonElement = fixture.nativeElement.querySelector('[aria-label="Como jogar"]');
    const dialog: HTMLDialogElement = fixture.nativeElement.querySelector('dialog');
    const before = sessionStorage.getItem('mesa.session');
    trigger.click(); fixture.detectChanges();
    expect(dialog.open).toBeTrue();
    expect(dialog.textContent).toContain('Na Escala');
    expect(dialog.textContent).not.toContain('Aeroporto');
    dialog.querySelector<HTMLButtonElement>('[aria-label="Fechar como jogar"]')!.click();
    fixture.detectChanges(); tick();
    expect(dialog.open).toBeFalse();
    expect(document.activeElement).toBe(trigger);
    expect(sessionStorage.getItem('mesa.session')).toBe(before);
  }));

  it('fecha com Escape pelo evento cancel do dialog', fakeAsync(() => {
    const router = TestBed.inject(Router);
    router.navigateByUrl('/jogar/impostor'); tick();
    const fixture = TestBed.createComponent(GameHelpComponent);
    fixture.detectChanges(); tick(); fixture.detectChanges();
    const trigger: HTMLButtonElement = fixture.nativeElement.querySelector('[aria-label="Como jogar"]');
    const dialog: HTMLDialogElement = fixture.nativeElement.querySelector('dialog');
    trigger.click();
    dialog.dispatchEvent(new Event('cancel', { cancelable: true }));
    fixture.detectChanges();
    expect(dialog.open).toBeFalse();
    expect(dialog.textContent).toContain('Impostor');
  }));
});
