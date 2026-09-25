import { screen } from '@testing-library/react-native';
import { renderRouter } from 'expo-router/testing-library';

import { useAuth } from '@/lib/auth-context';

jest.mock('@/lib/firebase', () => ({ auth: {}, db: {} }));
jest.mock('@/features/matches/create-match', () => ({ createMatch: jest.fn() }));
jest.mock('firebase/app', () => ({ FirebaseError: class FirebaseError extends Error {} }));
jest.mock('firebase/auth', () => ({
  signOut: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
}));
jest.mock('@/lib/auth-context', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
  useAuth: jest.fn(),
}));

const mockedUseAuth = jest.mocked(useAuth);

// renderRouter mounts the real routes in src/app, including the Stack.Protected guards.
describe('create-match route protection', () => {
  it('sends signed-out users from /create-match back to the start screen', async () => {
    mockedUseAuth.mockReturnValue({ user: null, initializing: false });

    await renderRouter('./src/app', { initialUrl: '/create-match' });

    expect(await screen.findByText('Mitspieler und Matches finden')).toBeOnTheScreen();
    expect(
      screen.getByText('Zum Erstellen eines Matches musst du angemeldet sein.'),
    ).toBeOnTheScreen();
    expect(screen.queryByLabelText('Ort *')).not.toBeOnTheScreen();
  });

  it('shows the match form to signed-in users', async () => {
    mockedUseAuth.mockReturnValue({
      user: { uid: 'alice', email: 'alice@example.com' } as never,
      initializing: false,
    });

    await renderRouter('./src/app', { initialUrl: '/create-match' });

    expect(await screen.findByLabelText('Ort *')).toBeOnTheScreen();
  });
});
