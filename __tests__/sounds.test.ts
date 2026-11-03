import { soundForEvents } from '../sounds';

describe('soundForEvents', () => {
  it('ne joue rien sans événement sonore', () => {
    expect(soundForEvents([])).toBeNull();
    expect(soundForEvents([{ type: 'thumbSave', count: 3 }])).toBeNull();
  });

  it('le jackpot de Yusri passe avant tout', () => {
    expect(
      soundForEvents([
        { type: 'okaunMilestone', threshold: 3000 },
        { type: 'yusriDisaster' },
        { type: 'yusriJackpot' },
      ]),
    ).toBe('yusri_jackpot');
  });

  it('la catastrophe passe avant les paliers', () => {
    expect(
      soundForEvents([
        { type: 'zMilestone', threshold: 50 },
        { type: 'yusriDisaster' },
      ]),
    ).toBe('yusri_catastrophe');
  });

  it('Okaun parle avant le Z, et seul son plus haut palier compte', () => {
    expect(
      soundForEvents([
        { type: 'zMilestone', threshold: 25 },
        { type: 'okaunMilestone', threshold: 40 },
        { type: 'okaunMilestone', threshold: 350 },
      ]),
    ).toBe('okaun_palier_350');
  });

  it('le Z : le plus haut palier franchi', () => {
    expect(
      soundForEvents([
        { type: 'zMilestone', threshold: 5 },
        { type: 'zMilestone', threshold: 25 },
      ]),
    ).toBe('z_cartes_25');
  });
});