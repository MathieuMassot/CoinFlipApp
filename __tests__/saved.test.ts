import { Flip } from '../flip';
import { newGame, recordFlips, setBoard } from '../game';
import { endGame } from '../records';
import { defaultSaved, parseSaved, serializeSaved } from '../saved';

const win: Flip = { result: 'Win', coins: ['Win'] };

describe('saved', () => {
  it('repart de zéro sans donnée', () => {
    expect(parseSaved(null)).toEqual(defaultSaved());
  });

  it('repart de zéro si la donnée est illisible', () => {
    expect(parseSaved('pas du json {')).toEqual(defaultSaved());
  });

  it('repart de zéro si la version est inconnue', () => {
    const old = JSON.stringify({ ...defaultSaved(), version: 0 });
    expect(parseSaved(old)).toEqual(defaultSaved());
  });

  it('repart de zéro si la structure est incomplète', () => {
    expect(parseSaved(JSON.stringify({ version: 1 }))).toEqual(defaultSaved());
  });

  it('retrouve exactement la partie sauvegardée', () => {
    const game = recordFlips(setBoard(newGame(), { okaun: true }), [win, win], {
      player: 'me',
      source: 'okaun',
    });
    const saved = { ...defaultSaved(), game, records: [endGame(game, 1000)] };
    expect(parseSaved(serializeSaved(saved))).toEqual(saved);
  });

    it('accepte une ancienne sauvegarde sans lastSeries', () => {
    const raw = JSON.parse(serializeSaved(defaultSaved()));
    delete raw.game.lastSeries;
    expect(parseSaved(JSON.stringify(raw)).game.lastSeries).toEqual([]);
  });

  it('accepte une ancienne sauvegarde sans sauvetages du Pouce', () => {
    const raw = JSON.parse(serializeSaved(defaultSaved()));
    delete raw.game.stats.thumbSaves;
    expect(parseSaved(JSON.stringify(raw)).game.stats.thumbSaves).toBe(0);
  });

    it('accepte une ancienne sauvegarde sans suivi des lancers du tour', () => {
    const raw = JSON.parse(serializeSaved(defaultSaved()));
    delete raw.game.turn.launched;
    expect(parseSaved(JSON.stringify(raw)).game.turn.launched).toEqual({
      yusri: false,
      zndrsplt: false,
      okaun: false,
    });
  });
});