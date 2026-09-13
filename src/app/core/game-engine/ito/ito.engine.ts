import { Injectable } from '@angular/core';
import { RandomService } from '../../random/random.service';
import { normalizePlayers, Player } from '../../players/player.model';
import { ItoScore, ItoSession, ItoTheme } from './ito.models';

const ITO_MIN_PLAYERS = 2;
const ITO_MAX_PLAYERS = 12;

@Injectable({ providedIn: 'root' })
export class ItoEngine {
  constructor(private readonly random: RandomService) {}

  createSetup(players: readonly Player[]): ItoSession {
    this.assertPlayers(players);
    return {
      game: 'ito',
      phase: 'setup',
      players: normalizePlayers(players),
      theme: null,
      assignments: [],
      clues: this.emptyClues(players),
      guessedOrder: players.map((player) => player.id),
      revealedPlayerIds: [],
      showCorrectOrder: false,
      currentPlayerIndex: 0,
      round: 0,
    };
  }

  updatePlayers(session: ItoSession, players: readonly Player[]): ItoSession {
    this.assertPhase(session, 'setup');
    this.assertPlayers(players);
    return {
      ...session,
      players: [...players],
      clues: this.emptyClues(players),
      guessedOrder: players.map((player) => player.id),
    };
  }

  startRound(session: ItoSession, themes: readonly ItoTheme[]): ItoSession {
    if (session.phase !== 'setup' && session.phase !== 'results') {
      throw new Error(`Uma nova rodada não pode começar na etapa ${session.phase}.`);
    }
    this.assertPlayers(session.players);
    const players = normalizePlayers(session.players);
    const theme = this.pickTheme(themes, session.theme?.id);
    const numbers = this.random.uniqueIntegers(players.length, 1, 100);
    return {
      ...session,
      players,
      phase: 'handoff',
      theme,
      assignments: players.map((player, index) => ({ playerId: player.id, number: numbers[index] })),
      clues: this.emptyClues(players),
      guessedOrder: players.map((player) => player.id),
      revealedPlayerIds: [],
      showCorrectOrder: false,
      currentPlayerIndex: 0,
      round: session.round + 1,
    };
  }

  hideCurrent(session: ItoSession): ItoSession {
    this.assertPhase(session, 'handoff');
    const isLastPlayer = session.currentPlayerIndex >= session.players.length - 1;
    return isLastPlayer
      ? { ...session, phase: 'collective' }
      : { ...session, phase: 'handoff', currentPlayerIndex: session.currentPlayerIndex + 1 };
  }

  changeTheme(session: ItoSession, themes: readonly ItoTheme[]): ItoSession {
    this.assertPhase(session, 'collective');
    return {
      ...session,
      theme: this.pickTheme(themes, session.theme?.id),
      clues: this.emptyClues(session.players),
      guessedOrder: session.players.map((player) => player.id),
      revealedPlayerIds: [],
      showCorrectOrder: false,
    };
  }

  updateClue(session: ItoSession, playerId: string, clue: string): ItoSession {
    this.assertPhase(session, 'collective');
    this.assertPlayerId(session, playerId);
    return { ...session, clues: { ...session.clues, [playerId]: clue } };
  }

  movePlayer(session: ItoSession, playerId: string, targetIndex: number): ItoSession {
    this.assertPhase(session, 'collective');
    this.assertPlayerId(session, playerId);
    if (!Number.isInteger(targetIndex) || targetIndex < 0 || targetIndex >= session.guessedOrder.length) {
      throw new RangeError('A posição escolhida é inválida.');
    }
    const currentIndex = session.guessedOrder.indexOf(playerId);
    if (currentIndex === targetIndex) return session;
    const guessedOrder = [...session.guessedOrder];
    guessedOrder.splice(currentIndex, 1);
    guessedOrder.splice(targetIndex, 0, playerId);
    return { ...session, guessedOrder };
  }

  showResults(session: ItoSession): ItoSession {
    this.assertPhase(session, 'collective');
    return { ...session, phase: 'results', revealedPlayerIds: [], showCorrectOrder: false };
  }

  revealNumber(session: ItoSession, playerId: string): ItoSession {
    this.assertPhase(session, 'results');
    this.assertPlayerId(session, playerId);
    if (session.revealedPlayerIds.includes(playerId)) return session;
    return { ...session, revealedPlayerIds: [...session.revealedPlayerIds, playerId] };
  }

  revealAll(session: ItoSession): ItoSession {
    this.assertPhase(session, 'results');
    if (session.revealedPlayerIds.length === session.players.length) return session;
    return { ...session, revealedPlayerIds: session.guessedOrder.slice() };
  }

  toggleCorrectOrder(session: ItoSession): ItoSession {
    this.assertPhase(session, 'results');
    if (session.revealedPlayerIds.length !== session.players.length) {
      throw new Error('Revele todos os números antes de consultar a ordem correta.');
    }
    return { ...session, showCorrectOrder: !session.showCorrectOrder };
  }

  correctOrder(session: ItoSession): string[] {
    const numberByPlayer = this.numberByPlayer(session);
    return [...session.players]
      .sort((first, second) => numberByPlayer.get(first.id)! - numberByPlayer.get(second.id)!)
      .map((player) => player.id);
  }

  score(session: ItoSession): ItoScore {
    const numberByPlayer = this.numberByPlayer(session);
    const problematicPlayerIds = new Set<string>();
    let correctPairs = 0;
    for (let firstIndex = 0; firstIndex < session.guessedOrder.length - 1; firstIndex += 1) {
      for (let secondIndex = firstIndex + 1; secondIndex < session.guessedOrder.length; secondIndex += 1) {
        const firstId = session.guessedOrder[firstIndex];
        const secondId = session.guessedOrder[secondIndex];
        if (numberByPlayer.get(firstId)! < numberByPlayer.get(secondId)!) {
          correctPairs += 1;
        } else {
          problematicPlayerIds.add(firstId);
          problematicPlayerIds.add(secondId);
        }
      }
    }
    const totalPairs = session.players.length * (session.players.length - 1) / 2;
    return {
      correctPairs,
      totalPairs,
      points: Math.round(correctPairs / totalPairs * 100),
      problematicPlayerIds: [...problematicPlayerIds],
    };
  }

  private emptyClues(players: readonly Player[]): Record<string, string> {
    return Object.fromEntries(players.map((player) => [player.id, '']));
  }

  private numberByPlayer(session: ItoSession): Map<string, number> {
    return new Map(session.assignments.map((assignment) => [assignment.playerId, assignment.number]));
  }

  private assertPlayerId(session: ItoSession, playerId: string): void {
    if (!session.players.some((player) => player.id === playerId)) {
      throw new Error('O participante não pertence a esta rodada.');
    }
  }

  private pickTheme(themes: readonly ItoTheme[], previousId?: string): ItoTheme {
    if (themes.length === 0) throw new Error('Nenhum tema de Ito foi cadastrado.');
    const candidates = themes.length > 1 && previousId
      ? themes.filter((theme) => theme.id !== previousId)
      : themes;
    return this.random.pick(candidates);
  }

  private assertPlayers(players: readonly Player[]): void {
    if (players.length < ITO_MIN_PLAYERS || players.length > ITO_MAX_PLAYERS) {
      throw new RangeError(`Ito precisa de ${ITO_MIN_PLAYERS} a ${ITO_MAX_PLAYERS} participantes.`);
    }
    if (new Set(players.map((player) => player.id)).size !== players.length) {
      throw new Error('Os participantes precisam ter identificadores únicos.');
    }
  }

  private assertPhase(session: ItoSession, phase: ItoSession['phase']): void {
    if (session.phase !== phase) throw new Error(`A ação não é permitida na etapa ${session.phase}.`);
  }
}
