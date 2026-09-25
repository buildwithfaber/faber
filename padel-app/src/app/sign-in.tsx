import { FirebaseError } from 'firebase/app';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from 'react-native';

import { Button } from '@/components/button';
import { TextField } from '@/components/text-field';
import { auth } from '@/lib/firebase';

type Mode = 'sign-in' | 'sign-up';

function authErrorMessage(error: unknown): string {
  const code = error instanceof FirebaseError ? error.code : '';
  switch (code) {
    case 'auth/invalid-email':
      return 'Die E-Mail-Adresse ist ungültig.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'E-Mail oder Passwort ist falsch.';
    case 'auth/email-already-in-use':
      return 'Für diese E-Mail-Adresse gibt es bereits ein Konto.';
    case 'auth/weak-password':
      return 'Das Passwort muss mindestens 6 Zeichen lang sein.';
    case 'auth/network-request-failed':
      return 'Keine Verbindung. Bitte prüfe deine Internetverbindung.';
    default:
      return 'Anmeldung fehlgeschlagen. Bitte versuche es erneut.';
  }
}

// After a successful sign-in the root layout's Stack.Protected guard removes this
// screen and returns the user to the start screen.
export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<Mode | null>(null);

  async function submit(mode: Mode) {
    if (!email.trim() || !password) {
      setError('Bitte gib E-Mail und Passwort ein.');
      return;
    }
    setError(null);
    setPending(mode);
    try {
      if (mode === 'sign-in') {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      } else {
        await createUserWithEmailAndPassword(auth, email.trim(), password);
      }
    } catch (e) {
      setError(authErrorMessage(e));
      setPending(null);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.intro}>Melde dich an, um Matches zu erstellen.</Text>
        <TextField
          label="E-Mail"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          placeholder="du@beispiel.de"
        />
        <TextField
          label="Passwort"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="password"
          placeholder="Mindestens 6 Zeichen"
        />
        {error ? (
          <Text accessibilityRole="alert" style={styles.error}>
            {error}
          </Text>
        ) : null}
        <Button
          label="Anmelden"
          onPress={() => submit('sign-in')}
          loading={pending === 'sign-in'}
          disabled={pending !== null}
        />
        <Button
          label="Neues Konto erstellen"
          variant="secondary"
          onPress={() => submit('sign-up')}
          loading={pending === 'sign-up'}
          disabled={pending !== null}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#f5f7f5' },
  container: { padding: 24, gap: 16 },
  intro: { fontSize: 16, color: '#4a4a4a' },
  error: { color: '#c62828', fontSize: 14 },
});
