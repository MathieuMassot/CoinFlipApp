import { canUndo, commit, newHistory, undo } from '../history';

describe('history', () => {
  it('annule les actions dans l’ordre inverse', () => {
    let h = newHistory(1);
    h = commit(h, 2);
    h = commit(h, 3);
    h = undo(h);
    expect(h.present).toBe(2);
    h = undo(h);
    expect(h.present).toBe(1);
    expect(canUndo(h)).toBe(false);
  });

  it('ne fait rien quand il n’y a rien à annuler', () => {
    const h = newHistory('a');
    expect(undo(h)).toBe(h);
  });

  it('ignore un enregistrement qui ne change rien', () => {
    const state = { x: 1 };
    const h = newHistory(state);
    expect(commit(h, state)).toBe(h);
  });

  it('garde au plus 50 étapes', () => {
    let h = newHistory(0);
    for (let i = 1; i <= 60; i++) {
      h = commit(h, i);
    }
    expect(h.past).toHaveLength(50);
    expect(h.present).toBe(60);
  });
});