import { flip, flipCoin, flipMany, flipUntilLose } from '../flip';

// Fabrique un "hasard" qui renvoie les valeurs dans l'ordre donné
const sequence = (...values: number[]) => {
  let i = 0;
  return () => values[i++];
};

describe('flipCoin', () => {
  it('renvoie Win sous 0.5 et Lose à partir de 0.5', () => {
    expect(flipCoin(() => 0.1)).toBe('Win');
    expect(flipCoin(() => 0.5)).toBe('Lose');
    expect(flipCoin(() => 0.9)).toBe('Lose');
  });
});

describe('flip', () => {
  it('lance une seule pièce sans Pouce de Krark', () => {
    expect(flip(false, () => 0.1)).toEqual({ result: 'Win', coins: ['Win'] });
    expect(flip(false, () => 0.9)).toEqual({ result: 'Lose', coins: ['Lose'] });
  });

  it('avec le Pouce de Krark, un seul Win suffit', () => {
    expect(flip(true, sequence(0.9, 0.1))).toEqual({
      result: 'Win',
      coins: ['Lose', 'Win'],
    });
  });

  it('avec le Pouce de Krark, deux Lose donnent un Lose', () => {
    expect(flip(true, sequence(0.9, 0.9)).result).toBe('Lose');
  });
});

describe('flipMany', () => {
  it('renvoie le bon nombre de lancers', () => {
    expect(flipMany(3, false, () => 0.1)).toHaveLength(3);
    expect(flipMany(0, false)).toEqual([]);
  });
});

describe('flipUntilLose', () => {
  it("s'arrête au premier Lose, qui est inclus", () => {
    const flips = flipUntilLose(false, sequence(0.1, 0.1, 0.1, 0.9));
    expect(flips).toHaveLength(4);
    expect(flips.map(f => f.result)).toEqual(['Win', 'Win', 'Win', 'Lose']);
  });

  it("s'arrête immédiatement si le premier lancer est un Lose", () => {
    expect(flipUntilLose(false, sequence(0.9))).toHaveLength(1);
  });

  it('fonctionne avec le Pouce de Krark', () => {
    // 1er lancer : Win + Lose = Win ; 2e lancer : Lose + Lose = Lose
    const flips = flipUntilLose(true, sequence(0.1, 0.9, 0.9, 0.9));
    expect(flips.map(f => f.result)).toEqual(['Win', 'Lose']);
  });
});