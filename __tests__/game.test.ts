import { Flip } from '../flip';
import {
  FlipSource,
  GameState,
  Player,
  endTurn,
  markCardsDrawn,
  newGame,
  recordFlips,
  setBoard,
  setMyTurn,
  setOkaunBase,
  setOkaunNow,
  okaunProgression,
  recordFlipsWithEvents,
  adjustOkaun,
} from '../game';

const win: Flip = { result: 'Win', coins: ['Win'] };
const lose: Flip = { result: 'Lose', coins: ['Lose'] };
const thumbWin: Flip = { result: 'Win', coins: ['Lose', 'Win'] };
const thumbLose: Flip = { result: 'Lose', coins: ['Lose', 'Lose'] };

const play = (
  state: GameState,
  flips: Flip[],
  source: FlipSource = 'manual',
  player: Player = 'me',
) => recordFlips(state, flips, { player, source });

describe('Okaun', () => {
  const withOkaun = () => setBoard(newGame(), { okaun: true });

  it('un 3/3 avec 5 réussites devient 96/96', () => {
    const s = play(withOkaun(), [win, win, win, win, win, lose], 'okaun');
    expect(s.okaunNow).toEqual({ power: 96, toughness: 96 });
    expect(s.stats.okaunMax).toEqual({ power: 96, toughness: 96 });
  });

  it('les réussites adverses doublent aussi Okaun', () => {
    const s = play(withOkaun(), [win], 'manual', 'opponent');
    expect(s.okaunNow.power).toBe(6);
  });

  it('sans Okaun sur le terrain, rien ne double', () => {
    expect(play(newGame(), [win]).okaunNow.power).toBe(3);
  });

  it("l'ordre compte : un bonus reçu en cours de tour n'est pas doublé avant", () => {
    let s = play(withOkaun(), [win], 'okaun'); // 6/6
    s = setOkaunNow(s, { power: 10, toughness: 8 }); // artefact équipé
    s = play(s, [win], 'okaun'); // 20/16
    expect(s.okaunNow).toEqual({ power: 20, toughness: 16 });
  });

  it('la fin de tour le ramène à sa base mais garde le maximum', () => {
    let s = play(withOkaun(), [win, win], 'okaun'); // 12/12
    s = endTurn(s);
    expect(s.okaunNow).toEqual({ power: 3, toughness: 3 });
    expect(s.stats.okaunMax.power).toBe(12);
    expect(s.turn.number).toBe(2);
  });

  it('une nouvelle base est suivie par la valeur du moment, sauf si Okaun a déjà doublé', () => {
    const a = setOkaunBase(withOkaun(), { power: 4, toughness: 5 });
    expect(a.okaunNow).toEqual({ power: 4, toughness: 5 });

    const b = setOkaunBase(play(withOkaun(), [win], 'okaun'), {
      power: 4,
      toughness: 5,
    });
    expect(b.okaunBase).toEqual({ power: 4, toughness: 5 });
    expect(b.okaunNow).toEqual({ power: 6, toughness: 6 });
  });

  it('en arrivant sur le terrain, il repart de sa base', () => {
    const s = setBoard(setOkaunBase(newGame(), { power: 4, toughness: 5 }), {
      okaun: true,
    });
    expect(s.okaunNow).toEqual({ power: 4, toughness: 5 });
  });
});

describe('Zndrsplt', () => {
  it('1 carte par réussite, seulement les miennes', () => {
    let s = play(setBoard(newGame(), { zndrsplt: true }), [win, win, lose, win]);
    s = play(s, [win], 'manual', 'opponent');
    expect(s.pendingDraws).toBe(3);
    expect(s.stats.cardsZndrsplt).toBe(3);
  });

  it('le compteur repart de zéro, pas la statistique', () => {
    let s = play(setBoard(newGame(), { zndrsplt: true }), [win, win]);
    s = markCardsDrawn(s);
    expect(s.pendingDraws).toBe(0);
    expect(s.stats.cardsZndrsplt).toBe(2);
  });
});

describe('Yusri', () => {
  it('3 réussites et 2 échecs : 3 cartes et 4 PV perdus', () => {
    const s = play(newGame(), [win, win, win, lose, lose], 'yusri');
    expect(s.stats.cardsYusri).toBe(3);
    expect(s.stats.lifeLost).toBe(4);
    expect(s.pendingDraws).toBe(3);
  });

  it('les cartes de Yusri et de Zndrsplt se cumulent', () => {
    const s = play(
      setBoard(newGame(), { zndrsplt: true }),
      [win, win, lose],
      'yusri',
    );
    expect(s.pendingDraws).toBe(4);
  });
});

describe('Statistiques', () => {
  it('distinguent les lancers avec et sans Pouce de Krark', () => {
    const s = play(newGame(), [win, thumbWin, thumbWin, lose, thumbLose]);
    expect(s.stats.wins).toEqual({ withThumb: 2, withoutThumb: 1 });
    expect(s.stats.losses).toEqual({ withThumb: 1, withoutThumb: 1 });
  });
});

describe('Tours', () => {
  it('« mon tour » ouvre un nouveau tour vide', () => {
    let s = play(newGame(), [win, lose]);
    s = setMyTurn(s, true);
    expect(s.turn).toMatchObject({ number: 2, mine: true, flips: [] });
  });
});

describe('Événements', () => {
  const ctx = (source: FlipSource, player: Player = 'me') => ({
    player,
    source,
  });
  const withOkaun = () => setBoard(newGame(), { okaun: true });

  it('jackpot Yusri : 5 réussites sur 5', () => {
    const { events } = recordFlipsWithEvents(
      newGame(),
      [win, win, win, win, win],
      ctx('yusri'),
    );
    expect(events).toContainEqual({ type: 'yusriJackpot' });
  });

  it('pas de jackpot avec seulement 4 lancers', () => {
    const { events } = recordFlipsWithEvents(
      newGame(),
      [win, win, win, win],
      ctx('yusri'),
    );
    expect(events).toEqual([]);
  });

  it('catastrophe Yusri : 5 échecs sur 5', () => {
    const { events } = recordFlipsWithEvents(
      newGame(),
      [lose, lose, lose, lose, lose],
      ctx('yusri'),
    );
    expect(events).toContainEqual({ type: 'yusriDisaster' });
  });

  it('le Pouce qui sauve et le Pouce qui échoue', () => {
    const { events } = recordFlipsWithEvents(
      newGame(),
      [thumbWin, thumbLose, thumbLose],
      ctx('manual'),
    );
    expect(events).toContainEqual({ type: 'thumbSave', count: 1 });
    expect(events).toContainEqual({ type: 'thumbDoubleFail', count: 2 });
  });

  it('Okaun dépasse 50', () => {
    const { events } = recordFlipsWithEvents(
      withOkaun(),
      [win, win, win, win, win],
      ctx('okaun'),
    );
    expect(events).toContainEqual({ type: 'okaunMilestone', threshold: 50 });
  });

  it('seul le palier le plus haut franchi est signalé', () => {
    const { events } = recordFlipsWithEvents(
      withOkaun(),
      [win, win, win, win, win, win],
      ctx('okaun'),
    );
    expect(events).toContainEqual({ type: 'okaunMilestone', threshold: 100 });
    expect(events).not.toContainEqual({
      type: 'okaunMilestone',
      threshold: 50,
    });
  });

  it('longue série d’Okaun', () => {
    const flips = [win, win, win, win, win, win, win, win, lose];
    const { events } = recordFlipsWithEvents(withOkaun(), flips, ctx('okaun'));
    expect(events).toContainEqual({
      type: 'longStreak',
      source: 'okaun',
      wins: 8,
    });
  });
});

describe('okaunProgression', () => {
  it('donne la valeur d’Okaun après chaque lancer', () => {
    expect(
      okaunProgression({ power: 3, toughness: 3 }, [win, win, lose]),
    ).toEqual([
      { power: 6, toughness: 6 },
      { power: 12, toughness: 12 },
      { power: 12, toughness: 12 },
    ]);
  });
});

describe('Dernière série', () => {
  it('contient les lancers du dernier enregistrement', () => {
    let s = play(newGame(), [win, lose]);
    s = play(s, [win, win, win]);
    expect(s.lastSeries).toHaveLength(3);
    expect(s.turn.flips).toHaveLength(5);
  });

  it('ne change pas quand aucun lancer n’est fait', () => {
    const s = play(newGame(), [win]);
    expect(play(s, [])).toBe(s);
  });

  it('est vidée par un nouveau tour', () => {
    const s = setMyTurn(play(newGame(), [win]), true);
    expect(s.lastSeries).toEqual([]);
  });
});

describe('Réglage d’Okaun', () => {
  const withOkaun = () => setBoard(newGame(), { okaun: true });

  it('un bonus permanent monte la base et la valeur du moment', () => {
    const s = adjustOkaun(withOkaun(), { power: 3, toughness: 0 }, true);
    expect(s.okaunBase).toEqual({ power: 6, toughness: 3 });
    expect(s.okaunNow).toEqual({ power: 6, toughness: 3 });
  });

  it('un bonus reçu après des doublements n’est pas doublé', () => {
    let s = play(withOkaun(), [win, win], 'okaun'); // 12/12
    s = adjustOkaun(s, { power: 3, toughness: 0 }, true);
    expect(s.okaunNow).toEqual({ power: 15, toughness: 12 });
    expect(s.okaunBase).toEqual({ power: 6, toughness: 3 });
  });

  it('un bonus « ce tour seulement » ne touche pas la base', () => {
    const s = adjustOkaun(withOkaun(), { power: 2, toughness: 2 }, false);
    expect(s.okaunBase).toEqual({ power: 3, toughness: 3 });
    expect(s.okaunNow).toEqual({ power: 5, toughness: 5 });
  });

  it('ne descend pas sous zéro', () => {
    const s = adjustOkaun(withOkaun(), { power: -10, toughness: 0 }, true);
    expect(s.okaunNow.power).toBe(0);
  });
});