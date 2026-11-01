import { useCallback, useEffect, useRef, useState } from 'react';
import { Flip, flipMany, flipUntilLose } from './flip';
import {
  Board,
  FlipSource,
  GameEvent,
  GameState,
  Player,
  endTurn as applyEndTurn,
  markCardsDrawn as applyMarkCardsDrawn,
  newGame,
  recordFlipsWithEvents,
  setBoard,
  setMyTurn as applyMyTurn,
} from './game';
import { History, canUndo, commit, newHistory, undo } from './history';
import { GameRecord, endGame } from './records';
import { SAVE_VERSION } from './saved';
import { loadSaved, writeSaved } from './storage';

type Options = { onEvents?: (events: GameEvent[]) => void };

const WIN: Flip = { result: 'Win', coins: ['Win'] };

export const useGame = ({ onEvents }: Options = {}) => {
  const [history, setHistory] = useState<History<GameState>>(() =>
    newHistory(newGame()),
  );
  const [records, setRecords] = useState<GameRecord[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Dernier état connu : deux appuis rapprochés ne s'écrasent pas
  const stateRef = useRef(history.present);
  stateRef.current = history.present;

  // Reprise de la partie au lancement
  useEffect(() => {
    let cancelled = false;
    loadSaved().then(saved => {
      if (cancelled) {
        return;
      }
      setHistory(newHistory(saved.game));
      setRecords(saved.records);
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Sauvegarde automatique à chaque changement
  useEffect(() => {
    if (loaded) {
      writeSaved({ version: SAVE_VERSION, game: history.present, records });
    }
  }, [loaded, history.present, records]);

  const apply = useCallback((next: GameState) => {
    stateRef.current = next;
    setHistory(h => commit(h, next));
  }, []);

  const play = useCallback(
    (flips: Flip[], source: FlipSource, player: Player = 'me') => {
      const { state, events } = recordFlipsWithEvents(
        stateRef.current,
        flips,
        { player, source },
      );
      apply(state);
      if (events.length > 0) {
        onEvents?.(events);
      }
    },
    [apply, onEvents],
  );

  const toggleBoard = useCallback(
    (card: keyof Board) => {
      const s = stateRef.current;
      const change: Partial<Board> = {};
      change[card] = !s.board[card];
      apply(setBoard(s, change));
    },
    [apply],
  );

  const setMyTurn = useCallback(
    (mine: boolean) => apply(applyMyTurn(stateRef.current, mine)),
    [apply],
  );

  const endTurn = useCallback(
    () => apply(applyEndTurn(stateRef.current)),
    [apply],
  );

  const markCardsDrawn = useCallback(
    () => apply(applyMarkCardsDrawn(stateRef.current)),
    [apply],
  );

  const opponentWin = useCallback(
    () => play([WIN], 'manual', 'opponent'),
    [play],
  );

  const launchFree = useCallback(
    (count: number) =>
      play(flipMany(count, stateRef.current.board.thumb), 'manual'),
    [play],
  );

  const launchFreeUntilLose = useCallback(
    () => play(flipUntilLose(stateRef.current.board.thumb), 'manual'),
    [play],
  );

  const undoLast = useCallback(() => setHistory(h => undo(h)), []);

  // Nouvelle partie : stats à zéro, la base d'Okaun est conservée
  const startNewGame = useCallback(() => {
    const fresh = newGame(stateRef.current.okaunBase);
    stateRef.current = fresh;
    setHistory(newHistory(fresh));
  }, []);

  // Fin de partie : on archive les stats, puis nouvelle partie
  const finishGame = useCallback(() => {
    const record = endGame(stateRef.current);
    setRecords(r => [...r, record]);
    startNewGame();
  }, [startNewGame]);

  const resetRecords = useCallback(() => setRecords([]), []);

  return {
    loaded,
    game: history.present,
    records,
    canUndo: canUndo(history),
    undo: undoLast,
    toggleBoard,
    setMyTurn,
    endTurn,
    markCardsDrawn,
    opponentWin,
    launchFree,
    launchFreeUntilLose,
    startNewGame,
    finishGame,
    resetRecords,
  };
};