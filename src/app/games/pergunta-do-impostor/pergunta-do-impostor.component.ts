import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { findGame } from '../../catalog/game-catalog';
import { IMPOSTOR_QUESTION_PAIRS } from '../../content/pergunta-do-impostor/question-pairs';
import { ImpostorQuestionEngine } from '../../core/game-engine/impostor-question/impostor-question.engine';
import { ImpostorQuestionConfig } from '../../core/game-engine/impostor-question/impostor-question.models';
import { Player, createPlayers } from '../../core/players/player.model';
import { SessionStore } from '../../core/session/session.store';
import { BrandLogoComponent } from '../../layout/brand-logo/brand-logo.component';
import { PlayerSetupComponent } from '../../shared/player-setup/player-setup.component';
import { PrivateRevealComponent } from '../../shared/private-reveal/private-reveal.component';
import { ImpostorQuestionConfigComponent } from './impostor-question-config.component';
import { ImpostorAnswerInputComponent } from './impostor-answer-input.component';
import { ImpostorAnswerListComponent } from './impostor-answer-list.component';

@Component({
  selector: 'app-pergunta-do-impostor',
  imports: [RouterLink, BrandLogoComponent, PlayerSetupComponent, PrivateRevealComponent, ImpostorQuestionConfigComponent, ImpostorAnswerInputComponent, ImpostorAnswerListComponent],
  templateUrl: './pergunta-do-impostor.component.html',
  styleUrl: './pergunta-do-impostor.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PerguntaDoImpostorComponent {
  private readonly engine = inject(ImpostorQuestionEngine);
  private readonly sessionStore = inject(SessionStore);
  readonly activeGame = this.sessionStore.activeImpostorQuestion;
  readonly playerLimits = findGame('pergunta-do-impostor')!.players;
  readonly maxPlayers = this.playerLimits.max ?? 12;
  readonly maxImpostors = computed(() => this.engine.maxImpostors(this.activeGame()?.players.length ?? 3));
  readonly answerDraft = signal('');
  readonly answerIsValid = computed(() => this.answerDraft().trim().length > 0);
  readonly currentPlayer = computed(() => {
    const session = this.activeGame();
    return session?.players[session.currentPlayerIndex];
  });
  readonly currentQuestion = computed(() => {
    const session = this.activeGame();
    const player = this.currentPlayer();
    return session && player ? this.engine.privateInfo(session, player.id) : null;
  });
  readonly impostors = computed(() => {
    const session = this.activeGame();
    return session?.players.filter((player) => session.impostorPlayerIds.includes(player.id)) ?? [];
  });

  constructor() {
    if (!this.activeGame()) this.sessionStore.setImpostorQuestionSession(this.engine.createSetup(createPlayers(3)));
    let previousPlayerId: string | undefined;
    effect(() => {
      const playerId = this.currentPlayer()?.id;
      if (playerId !== previousPlayerId) this.answerDraft.set('');
      previousPlayerId = playerId;
    });
  }

  updatePlayers(players: Player[]): void {
    const session = this.activeGame();
    if (!session) return;
    const impostorCount = Math.min(session.config.impostorCount, this.engine.maxImpostors(players.length));
    this.sessionStore.setImpostorQuestionSession(this.engine.updateSetup(session, players, { ...session.config, impostorCount }));
  }

  setConfig(config: ImpostorQuestionConfig): void {
    const session = this.activeGame();
    if (session) this.sessionStore.setImpostorQuestionSession(this.engine.updateSetup(session, session.players, config));
  }

  startRound(players: Player[]): void {
    const session = this.activeGame();
    if (!session) return;
    const configured = this.engine.updateSetup(session, players, session.config);
    this.sessionStore.setImpostorQuestionSession(this.engine.startRound(configured, IMPOSTOR_QUESTION_PAIRS));
  }

  hideCurrent(): void {
    const session = this.activeGame();
    if (!session) return;
    this.sessionStore.setImpostorQuestionSession(this.engine.hideCurrent(session, this.answerDraft()));
    this.answerDraft.set('');
  }

  revealMajorityQuestion(): void {
    const session = this.activeGame();
    if (session) this.sessionStore.setImpostorQuestionSession(this.engine.revealMajorityQuestion(session));
  }

  showResults(): void {
    const session = this.activeGame();
    if (session) this.sessionStore.setImpostorQuestionSession(this.engine.showResults(session));
  }

  newRound(): void {
    const session = this.activeGame();
    if (session) this.sessionStore.setImpostorQuestionSession(this.engine.startRound(session, IMPOSTOR_QUESTION_PAIRS));
  }

  questionSize(question: string): 'short' | 'medium' | 'long' {
    if (question.length <= 55) return 'short';
    if (question.length <= 85) return 'medium';
    return 'long';
  }

  leaveGame(): void { this.sessionStore.clearActiveGame(); }
}
