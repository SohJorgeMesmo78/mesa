import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createPlayers } from '../../core/players/player.model';
import { ItoOrderEditorComponent, ItoOrderMove } from './ito-order-editor.component';

describe('ItoOrderEditorComponent', () => {
  let fixture: ComponentFixture<ItoOrderEditorComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ItoOrderEditorComponent);
    const players = createPlayers(4);
    fixture.componentRef.setInput('players', players);
    fixture.componentRef.setInput('clues', Object.fromEntries(players.map((player) => [player.id, ''])));
    fixture.componentRef.setInput('order', players.map((player) => player.id));
    fixture.componentRef.setInput('lowLabel', 'Decepcionante');
    fixture.componentRef.setInput('highLabel', 'Inesquecível');
    fixture.detectChanges();
  });

  it('arrasta diretamente o último jogador para o topo pelo handle', () => {
    const cards = [...fixture.nativeElement.querySelectorAll('[data-guess-player]')] as HTMLElement[];
    cards.forEach((card, index) => spyOn(card, 'getBoundingClientRect').and.returnValue({
      top: index * 100, height: 80, bottom: index * 100 + 80, left: 0, right: 300, width: 300, x: 0, y: index * 100, toJSON: () => ({}),
    }));
    let move: ItoOrderMove | undefined;
    fixture.componentInstance.orderMove.subscribe((value) => { move = value; });
    fixture.componentInstance.startPointer({
      button: 0, pointerId: 1, currentTarget: { setPointerCapture: () => undefined },
    } as unknown as PointerEvent, 'player-4');
    fixture.componentInstance.movePointer({ clientY: 20, preventDefault: () => undefined } as unknown as PointerEvent);
    fixture.componentInstance.endPointer();

    expect(move).toEqual({ playerId: 'player-4', targetIndex: 0 });
  });

  it('mantém controles acessíveis e indica os extremos da escala', () => {
    expect(fixture.nativeElement.textContent).toContain('Decepcionante');
    expect(fixture.nativeElement.textContent).toContain('Inesquecível');
    expect(fixture.nativeElement.querySelectorAll('.move-controls button').length).toBe(8);
    expect(fixture.nativeElement.querySelectorAll('.drag-handle').length).toBe(4);
  });
});
