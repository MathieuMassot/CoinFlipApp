export type CoinResult = 'Win' | 'Lose';

// Un lancer : le résultat final, et le détail des pièces lancées
// (2 pièces avec le Pouce de Krark, 1 sinon)
export type Flip = {
  result: CoinResult;
  coins: CoinResult[];
};

type RandomSource = () => number;

export const flipCoin = (rng: RandomSource = Math.random): CoinResult =>
  rng() < 0.5 ? 'Win' : 'Lose';

// Un lancer : avec le Pouce de Krark, un seul "Win" suffit
export const flip = (
  doubleCoin: boolean,
  rng: RandomSource = Math.random,
): Flip => {
  const coins = Array.from({ length: doubleCoin ? 2 : 1 }, () => flipCoin(rng));
  return { result: coins.includes('Win') ? 'Win' : 'Lose', coins };
};

// Plusieurs lancers d'un coup
export const flipMany = (
  count: number,
  doubleCoin: boolean,
  rng: RandomSource = Math.random,
): Flip[] => Array.from({ length: count }, () => flip(doubleCoin, rng));

// Lancers jusqu'au premier "Lose" (inclus)
export const flipUntilLose = (
  doubleCoin: boolean,
  rng: RandomSource = Math.random,
): Flip[] => {
  const flips: Flip[] = [];
  let last: Flip;
  do {
    last = flip(doubleCoin, rng);
    flips.push(last);
  } while (last.result === 'Win');
  return flips;
};