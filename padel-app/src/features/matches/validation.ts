export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 4;
export const MAX_LOCATION_LENGTH = 100;

export type MatchFormInput = {
  date: string; // TT.MM.JJJJ
  time: string; // HH:MM
  location: string;
  maxPlayers: string;
};

export type MatchFormErrors = Partial<Record<keyof MatchFormInput, string>>;

export type ValidMatch = {
  startsAt: Date;
  location: string;
  maxPlayers: number;
};

export type ValidationResult =
  | { ok: true; value: ValidMatch }
  | { ok: false; errors: MatchFormErrors };

const DATE_PATTERN = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/;
const TIME_PATTERN = /^(\d{1,2}):(\d{2})$/;

function parseDate(input: string): { year: number; month: number; day: number } | null {
  const match = DATE_PATTERN.exec(input);
  if (!match) return null;
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  // Reject dates like 31.02. that Date would silently roll over.
  const probe = new Date(year, month - 1, day);
  if (probe.getFullYear() !== year || probe.getMonth() !== month - 1 || probe.getDate() !== day) {
    return null;
  }
  return { year, month, day };
}

function parseTime(input: string): { hours: number; minutes: number } | null {
  const match = TIME_PATTERN.exec(input);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return { hours, minutes };
}

export function validateMatchForm(input: MatchFormInput, now: Date = new Date()): ValidationResult {
  const errors: MatchFormErrors = {};

  const dateText = input.date.trim();
  const timeText = input.time.trim();
  const location = input.location.trim();
  const maxPlayersText = input.maxPlayers.trim();

  const date = dateText ? parseDate(dateText) : null;
  if (!dateText) {
    errors.date = 'Bitte gib ein Datum an.';
  } else if (!date) {
    errors.date = 'Bitte gib ein gültiges Datum im Format TT.MM.JJJJ an.';
  }

  const time = timeText ? parseTime(timeText) : null;
  if (!timeText) {
    errors.time = 'Bitte gib eine Uhrzeit an.';
  } else if (!time) {
    errors.time = 'Bitte gib eine gültige Uhrzeit im Format HH:MM an.';
  }

  if (!location) {
    errors.location = 'Bitte gib einen Ort an.';
  } else if (location.length > MAX_LOCATION_LENGTH) {
    errors.location = `Der Ort darf höchstens ${MAX_LOCATION_LENGTH} Zeichen lang sein.`;
  }

  const maxPlayers = Number(maxPlayersText);
  if (!maxPlayersText) {
    errors.maxPlayers = 'Bitte gib die maximale Spieleranzahl an.';
  } else if (
    !/^\d+$/.test(maxPlayersText) ||
    maxPlayers < MIN_PLAYERS ||
    maxPlayers > MAX_PLAYERS
  ) {
    errors.maxPlayers = `Die Spieleranzahl muss zwischen ${MIN_PLAYERS} und ${MAX_PLAYERS} liegen.`;
  }

  let startsAt: Date | null = null;
  if (date && time) {
    startsAt = new Date(date.year, date.month - 1, date.day, time.hours, time.minutes);
    if (startsAt.getTime() <= now.getTime()) {
      errors.date = 'Das Match muss in der Zukunft liegen.';
    }
  }

  if (Object.keys(errors).length > 0 || !startsAt) {
    return { ok: false, errors };
  }

  return { ok: true, value: { startsAt, location, maxPlayers } };
}
