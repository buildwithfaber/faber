import { validateMatchForm, type MatchFormInput } from '../validation';

const NOW = new Date(2026, 8, 25, 12, 0); // 25.09.2026 12:00 local time

const VALID_INPUT: MatchFormInput = {
  date: '01.10.2026',
  time: '18:30',
  location: 'Padel Club Mitte',
  maxPlayers: '4',
};

describe('validateMatchForm', () => {
  it('accepts a complete match in the future', () => {
    const result = validateMatchForm(VALID_INPUT, NOW);

    expect(result).toEqual({
      ok: true,
      value: {
        startsAt: new Date(2026, 9, 1, 18, 30),
        location: 'Padel Club Mitte',
        maxPlayers: 4,
      },
    });
  });

  it('trims the location', () => {
    const result = validateMatchForm({ ...VALID_INPUT, location: '  Court 2  ' }, NOW);

    expect(result.ok && result.value.location).toBe('Court 2');
  });

  it.each([
    ['date', 'Bitte gib ein Datum an.'],
    ['time', 'Bitte gib eine Uhrzeit an.'],
    ['location', 'Bitte gib einen Ort an.'],
    ['maxPlayers', 'Bitte gib die maximale Spieleranzahl an.'],
  ] as const)('rejects a missing %s with a readable message', (field, message) => {
    const result = validateMatchForm({ ...VALID_INPUT, [field]: '   ' }, NOW);

    expect(result.ok).toBe(false);
    expect(!result.ok && result.errors[field]).toBe(message);
  });

  it('reports every missing field at once', () => {
    const result = validateMatchForm({ date: '', time: '', location: '', maxPlayers: '' }, NOW);

    expect(!result.ok && Object.keys(result.errors).sort()).toEqual([
      'date',
      'location',
      'maxPlayers',
      'time',
    ]);
  });

  it.each(['2026-10-01', '31.02.2026', '1.13.2026', 'morgen'])('rejects invalid date %s', (date) => {
    const result = validateMatchForm({ ...VALID_INPUT, date }, NOW);

    expect(!result.ok && result.errors.date).toMatch(/TT\.MM\.JJJJ/);
  });

  it.each(['24:00', '18:60', '1830', 'abends'])('rejects invalid time %s', (time) => {
    const result = validateMatchForm({ ...VALID_INPUT, time }, NOW);

    expect(!result.ok && result.errors.time).toMatch(/HH:MM/);
  });

  it('rejects a match in the past', () => {
    const result = validateMatchForm({ ...VALID_INPUT, date: '25.09.2026', time: '11:59' }, NOW);

    expect(!result.ok && result.errors.date).toBe('Das Match muss in der Zukunft liegen.');
  });

  it.each(['1', '5', '2.5', '-4', 'vier'])('rejects player count %s', (maxPlayers) => {
    const result = validateMatchForm({ ...VALID_INPUT, maxPlayers }, NOW);

    expect(!result.ok && result.errors.maxPlayers).toBe(
      'Die Spieleranzahl muss zwischen 2 und 4 liegen.',
    );
  });

  it('rejects a location longer than 100 characters', () => {
    const result = validateMatchForm({ ...VALID_INPUT, location: 'x'.repeat(101) }, NOW);

    expect(!result.ok && result.errors.location).toMatch(/höchstens 100 Zeichen/);
  });
});
