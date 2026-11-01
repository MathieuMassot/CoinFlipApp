import { Flip } from '../flip';
import { Board, newTurn, recordFlips, summarizeTurn } from '../game';

const win: Flip = { result: 'Win', coins: ['Win'] };
const lose: Flip = { result: 'Lose', coins: ['Lose'] };

const board = (b: Partial<Board> = {}): Board => ({
  thumb: false,
  zndrsplt: false,
  okaun: false,
  ...b,
});

describe('Okaun', () => {
  it('un 3/3 avec 5 réussites devient 96/96', () => {
    const turn = recordFlips(
      newTurn(1, { power: 3, toughness: 3 }),
      [win, win, win, win, win, lose],
      { player: 'me', source: 'okaun', board: board({ okaun: true }) },
    );
    expect(summarizeTurn(turn).okaun).toEqual({
      doublings: 5,
      power: 96,
      toughness: 96,
    });
  });

  it('les réussites adverses comptent aussi', () => {
    const turn = recordFlips(newTurn(1, { power: 3, toughness: 3 }), [win], {
      player: 'opponent',
      source: 'manual',
      board: board({ okaun: true }),
    });
    expect(summarizeTurn(turn).okaun.power).toBe(6);
  });

  it('sans Okaun sur le terrain, rien ne double', () => {
    const turn = recordFlips(newTurn(1, { power: 3, toughness: 3 }), [win], {
      player: 'me',
      source: 'manual',
      board: board(),
    });
    expect(summarizeTurn(turn).okaun.power).toBe(3);
  });
});

describe('Zndrsplt', () => {
  it('1 carte par lancer réussi, seulement les miens', () => {
    let turn = recordFlips(newTurn(1), [win, win, lose], {
      player: 'me',
      source: 'manual',
      board: board({ zndrsplt: true }),
    });
    turn = recordFlips(turn, [win], {
      player: 'opponent',
      source: 'manual',
      board: board({ zndrsplt: true }),
    });
    expect(summarizeTurn(turn).cards.zndrsplt).toBe(2);
  });
});

describe('Yusri', () => {
  it('3 réussites et 2 échecs : 3 cartes et 4 PV perdus', () => {
    const turn = recordFlips(newTurn(1), [win, win, win, lose, lose], {
      player: 'me',
      source: 'yusri',
      board: board(),
    });
    const s = summarizeTurn(turn);
    expect(s.cards.yusri).toBe(3);
    expect(s.lifeLost).toBe(4);
    expect(s.yusriJackpot).toBe(false);
  });

  it('5 réussites sur 5 : jackpot', () => {
    const turn = recordFlips(newTurn(1), [win, win, win, win, win], {
      player: 'me',
      source: 'yusri',
      board: board(),
    });
    expect(summarizeTurn(turn).yusriJackpot).toBe(true);
  });

  it('les cartes de Yusri et de Zndrsplt se cumulent', () => {
    const turn = recordFlips(newTurn(1), [win, win, lose, lose, lose], {
      player: 'me',
      source: 'yusri',
      board: board({ zndrsplt: true }),
    });
    expect(summarizeTurn(turn).cards).toEqual({
      yusri: 2,
      zndrsplt: 2,
      total: 4,
    });
  });
});