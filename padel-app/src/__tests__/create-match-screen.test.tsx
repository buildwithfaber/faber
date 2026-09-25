import { render, screen, userEvent } from '@testing-library/react-native';

import CreateMatchScreen from '@/app/create-match';
import { createMatch } from '@/features/matches/create-match';

jest.mock('@/features/matches/create-match', () => ({
  createMatch: jest.fn(),
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: jest.fn() }),
}));

const mockedCreateMatch = jest.mocked(createMatch);

async function fillForm(
  user: ReturnType<typeof userEvent.setup>,
  values: { date?: string; time?: string; location?: string },
) {
  if (values.date) await user.type(screen.getByLabelText('Datum *'), values.date);
  if (values.time) await user.type(screen.getByLabelText('Uhrzeit *'), values.time);
  if (values.location) await user.type(screen.getByLabelText('Ort *'), values.location);
}

describe('CreateMatchScreen', () => {
  beforeEach(() => {
    mockedCreateMatch.mockReset();
  });

  it('shows readable errors and does not save when required fields are missing', async () => {
    const user = userEvent.setup();
    await render(<CreateMatchScreen />);

    await fillForm(user, { time: '18:30' });
    await user.press(screen.getByRole('button', { name: 'Match erstellen' }));

    expect(screen.getByText('Bitte gib ein Datum an.')).toBeOnTheScreen();
    expect(screen.getByText('Bitte gib einen Ort an.')).toBeOnTheScreen();
    expect(mockedCreateMatch).not.toHaveBeenCalled();
  });

  it('saves a valid match and shows a confirmation', async () => {
    mockedCreateMatch.mockResolvedValue('match-1');
    const user = userEvent.setup();
    await render(<CreateMatchScreen />);

    await fillForm(user, { date: '01.10.2099', time: '18:30', location: 'Padel Club Mitte' });
    await user.press(screen.getByRole('button', { name: 'Match erstellen' }));

    expect(mockedCreateMatch).toHaveBeenCalledWith({
      startsAt: new Date(2099, 9, 1, 18, 30),
      location: 'Padel Club Mitte',
      maxPlayers: 4,
    });
    expect(await screen.findByText('Match gespeichert!')).toBeOnTheScreen();
    expect(
      screen.getByText(/01\.10\.2099 um 18:30 Uhr in Padel Club Mitte für bis zu 4 Spieler/),
    ).toBeOnTheScreen();
  });

  it('shows an error and keeps the form when saving fails', async () => {
    mockedCreateMatch.mockRejectedValue(new Error('permission-denied'));
    const user = userEvent.setup();
    await render(<CreateMatchScreen />);

    await fillForm(user, { date: '01.10.2099', time: '18:30', location: 'Padel Club Mitte' });
    await user.press(screen.getByRole('button', { name: 'Match erstellen' }));

    expect(
      await screen.findByText('Das Match konnte nicht gespeichert werden. Bitte versuche es erneut.'),
    ).toBeOnTheScreen();
    expect(screen.queryByText('Match gespeichert!')).not.toBeOnTheScreen();
    expect(screen.getByLabelText('Ort *')).toHaveDisplayValue('Padel Club Mitte');
  });
});
