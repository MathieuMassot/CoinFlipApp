import { useCallback, useEffect, useRef, useState } from 'react';
import { Flip, flipMany, flipUntilLose } from './flip';
import {
  Board,
  FlipSource,
  GameEvent,
  GameState,
  Player,
  Stats,
  adjustOkaun as applyAdjustOkaun,
  endTurn as applyEndTurn,
  markCardsDrawn as applyMarkCardsDrawn,
  newGame,
  recordFlipsWithEvents,
  setBoard,
  setMyTurn as applyMyTurn,
  LaunchCard,
  allowRelaunch as applyAllowRelaunch,
  canLaunch as canLaunchState,
} from './game';
import { History, canUndo, commit, newHistory, undo } from './history';
import { GameRecord, endGame } from './records';
import { SAVE_VERSION } from './saved';
import { loadSaved, writeSaved } from './storage';



type Options = {
  onEvents?: (events: GameEvent[]) => void;
  onBeforeChange?: () => void; // appelé avant tout changement de la partie
};

const WIN: Flip = { result: 'Win', coins: ['Win'] };

export const useGame = ({ onEvents, onBeforeChange }: Options = {}) => {
  const [history, setHistory] = useState<History<GameState>>(() =>
    newHistory(newGame()),
  );
  const [records, setRecords] = useState<GameRecord[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Dernier état connu : deux appuis rapprochés ne s'écrasent pas
  const stateRef = useRef(history.present);
  stateRef.current = history.present;

  const beforeChange = useRef(onBeforeChange);
  beforeChange.current = onBeforeChange;

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
    beforeChange.current?.();
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

  // Enregistre une série et la renvoie (pour l'afficher un par un)
  const launch = useCallback(
    (flips: Flip[], source: FlipSource) => {
      play(flips, source);
      return flips;
    },
    [play],
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
      launch(flipMany(count, stateRef.current.board.thumb), 'manual'),
    [launch],
  );

  const launchFreeUntilLose = useCallback(
    () => launch(flipUntilLose(stateRef.current.board.thumb), 'manual'),
    [launch],
  );

  const launchOkaun = useCallback(
    () => launch(flipUntilLose(stateRef.current.board.thumb), 'okaun'),
    [launch],
  );

  const launchZ = useCallback(
    () => launch(flipUntilLose(stateRef.current.board.thumb), 'zndrsplt'),
    [launch],
  );

    const launchYusri = useCallback(
    (count: number) =>
      launch(flipMany(count, stateRef.current.board.thumb), 'yusri'),
    [launch],
  );

  // Bonus ou malus d'artefact sur Okaun
  const adjustOkaun = useCallback(
    (delta: Stats, permanent: boolean) =>
      apply(applyAdjustOkaun(stateRef.current, delta, permanent)),
    [apply],
  );

  // Saisie directe : on la traduit en écart par rapport à la valeur actuelle
  const setOkaunValue = useCallback(
    (value: Stats, permanent: boolean) => {
      const s = stateRef.current;
      const from = permanent ? s.okaunBase : s.okaunNow;
      apply(
        applyAdjustOkaun(
          s,
          {
            power: value.power - from.power,
            toughness: value.toughness - from.toughness,
          },
          permanent,
        ),
      );
    },
    [apply],
  );

  const undoLast = useCallback(() => {
    beforeChange.current?.();
    setHistory(h => undo(h));
  }, []);

  // Nouvelle partie : stats à zéro, la base d'Okaun est conservée
  const startNewGame = useCallback(() => {
    beforeChange.current?.();
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

    // Le personnage peut-il encore lancer ce tour-ci ? (lit toujours l'état le plus récent)
  const canLaunch = useCallback(
    (card: LaunchCard) => canLaunchState(stateRef.current, card),
    [],
  );

  // Combat supplémentaire : autorise un nouveau lancer du personnage
  const allowRelaunch = useCallback(
    (card: LaunchCard) => apply(applyAllowRelaunch(stateRef.current, card)),
    [apply],
  );

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
    launchOkaun,
    launchZ,
    launchYusri,
    adjustOkaun,
    setOkaunValue,
    startNewGame,
    finishGame,
    resetRecords,
    canLaunch,
    allowRelaunch,
  };
};