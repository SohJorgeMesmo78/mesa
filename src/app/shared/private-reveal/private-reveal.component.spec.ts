import { TestBed } from '@angular/core/testing';
import { PrivateRevealComponent } from './private-reveal.component';

describe('PrivateRevealComponent', () => {
  it('protege o segredo com um único clique e sem a etapa de conferência', () => {
    const fixture = TestBed.createComponent(PrivateRevealComponent);
    fixture.componentRef.setInput('player', { id: 'mari', name: 'Mari', color: '#FFAA00' });
    fixture.componentRef.setInput('current', 1);
    fixture.componentRef.setInput('total', 3);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Passe o celular para');
    expect(fixture.nativeElement.textContent).not.toContain('Confira se ninguém está olhando');
    const revealButton = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(revealButton.textContent).toContain('Revelar minha informação');

    revealButton.click();
    fixture.detectChanges();

    const hideButton = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(hideButton.textContent).toContain('Ocultar');
  });
});
