import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LETTER_CHAIN_LETTERS } from '../../content/adivinhe-a-palavra/letters';
import { LetterChainEngine } from '../../core/game-engine/letter-chain/letter-chain.engine';
import { SessionStore } from '../../core/session/session.store';
import { BrandLogoComponent } from '../../layout/brand-logo/brand-logo.component';
@Component({selector:'app-adivinhe-a-palavra',imports:[RouterLink,BrandLogoComponent],templateUrl:'./adivinhe-a-palavra.component.html',styleUrl:'./adivinhe-a-palavra.component.scss',changeDetection:ChangeDetectionStrategy.OnPush})
export class AdivinheAPalavraComponent{private readonly engine=inject(LetterChainEngine);private readonly store=inject(SessionStore);readonly game=this.store.activeLetterChain;constructor(){if(!this.game())this.store.setLetterChainSession(this.engine.create(LETTER_CHAIN_LETTERS));}newRound():void{const g=this.game();if(g)this.store.setLetterChainSession(this.engine.newRound(g,LETTER_CHAIN_LETTERS));}leave():void{this.store.clearActiveGame();}}
