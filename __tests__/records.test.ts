import { Flip } from '../flip';
import { newGame, recordFlips, setBoard } from '../game';
import { averageStats, endGame, totalStats } from '../records';

const win: Flip = { result: 'Win', coins: ['Win'] };
const lose: Flip = { result: 'Lose', coins: ['Lose'] };

const playOkaun = (flips: Flip[]) =>
  endGame(
    recordFlips(setBoard(newGame(), { okaun: true }), flips, {
      player: 'me',
      source: 'okaun',
    }),
    1000,
  );

describe('records', () => {
  // Partie A : 3 réussites, 1 échec, Okaun à 24/24
  // Partie B : 1 réussite, 1 échec, Okaun à 6/6
  const records = [
    playOkaun([win, win, win, lose]),
    playOkaun([win, lose]),
  ];

  it('additionne les parties, avec le record absolu pour Okaun', () => {
    const total = totalStats(records);
    expect(total.wins.withoutThumb).toBe(4);
    expect(total.losses.withoutThumb).toBe(2);
    expect(total.okaunMax.power).toBe(24);
  });

  it('calcule la moyenne par partie', () => {
    const avg = averageStats(records);
    expect(avg?.wins.withoutThumb).toBe(2);
    expect(avg?.losses.withoutThumb).toBe(1);
    expect(avg?.okaunMax.power).toBe(15);
  });

  it('renvoie null sans aucune partie', () => {
    expect(averageStats([])).toBeNull();
  });
});