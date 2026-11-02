import { tierFor } from '../components/LastFlips';

describe('tierFor', () => {
  it('choisit le palier d’après le nombre de lancers dévoilés', () => {
    expect(tierFor(1)).toBe('big');
    expect(tierFor(5)).toBe('big');
    expect(tierFor(6)).toBe('medium');
    expect(tierFor(10)).toBe('medium');
    expect(tierFor(11)).toBe('letter');
    expect(tierFor(24)).toBe('letter');
    expect(tierFor(25)).toBe('dot');
    expect(tierFor(1000)).toBe('dot');
  });
});