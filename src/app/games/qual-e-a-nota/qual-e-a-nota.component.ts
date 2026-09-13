import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RATING_THEMES } from '../../content/qual-e-a-nota/themes';
import { RatingEngine } from '../../core/game-engine/rating/rating.engine';
import { RatingMode } from '../../core/game-engine/rating/rating.models';
import { createPlayers, Player } from '../../core/players/player.model';
import { SessionStore } from '../../core/session/session.store';
import { BrandLogoComponent } from '../../layout/brand-logo/brand-logo.component';
import { PlayerSetupComponent } from '../../shared/player-setup/player-setup.component';
import { PrivateRevealComponent } from '../../shared/private-reveal/private-reveal.component';

@Component({ selector:'app-qual-e-a-nota', imports:[RouterLink,BrandLogoComponent,PlayerSetupComponent,PrivateRevealComponent], templateUrl:'./qual-e-a-nota.component.html',styleUrl:'./qual-e-a-nota.component.scss',changeDetection:ChangeDetectionStrategy.OnPush })
export class QualEANotaComponent {
  private readonly engine=inject(RatingEngine); private readonly store=inject(SessionStore); readonly game=this.store.activeRating;
  readonly currentPlayer=computed(()=>{const g=this.game();return g?.players[g.currentPlayerIndex]});
  readonly grade=computed(()=>{const g=this.game(),p=this.currentPlayer();return g?.assignments.find(a=>a.playerId===p?.id)?.grade});
  constructor(){if(!this.game())this.store.setRatingSession(this.engine.create(createPlayers(2)));}
  mode(mode:RatingMode):void{const g=this.game();if(g)this.store.setRatingSession(this.engine.configure(g,g.players,mode));}
  players(players:readonly Player[]):void{const g=this.game();if(g)this.store.setRatingSession(this.engine.configure(g,players,g.mode));}
  start(players:readonly Player[]):void{const g=this.game();if(g)this.store.setRatingSession(this.engine.start(this.engine.configure(g,players,g.mode),RATING_THEMES));}
  accept():void{const g=this.game();if(g)this.store.setRatingSession(this.engine.acceptTheme(g));}
  next():void{const g=this.game();if(g)this.store.setRatingSession(this.engine.next(g));}
  newRound():void{const g=this.game();if(g)this.store.setRatingSession(this.engine.start({...g,phase:'setup'},RATING_THEMES));}
  leave():void{this.store.clearActiveGame();}
}
