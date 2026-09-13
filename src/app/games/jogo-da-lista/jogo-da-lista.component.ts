import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WORD_LIST_POOL } from '../../content/jogo-da-lista/words';
import { WordListEngine } from '../../core/game-engine/word-list/word-list.engine';
import { SessionStore } from '../../core/session/session.store';
import { BrandLogoComponent } from '../../layout/brand-logo/brand-logo.component';
@Component({selector:'app-jogo-da-lista',imports:[RouterLink,BrandLogoComponent],templateUrl:'./jogo-da-lista.component.html',styleUrl:'./jogo-da-lista.component.scss',changeDetection:ChangeDetectionStrategy.OnPush})
export class JogoDaListaComponent{
 private readonly engine=inject(WordListEngine);private readonly store=inject(SessionStore);readonly game=this.store.activeWordList;
 constructor(){const restored=this.game();if(!restored)this.store.setWordListSession(this.engine.create());else if(restored.phase==='revealed')this.store.setWordListSession({...restored,phase:'ready'});}
 start(count:number):void{const g=this.game();if(g)this.store.setWordListSession(this.engine.start(g,count,WORD_LIST_POOL));}
 reveal():void{const g=this.game();if(g)this.store.setWordListSession(this.engine.reveal(g));}
 newRound():void{const g=this.game();if(g)this.store.setWordListSession(this.engine.start(g,g.count,WORD_LIST_POOL));}
 leave():void{this.store.clearActiveGame();}
}
