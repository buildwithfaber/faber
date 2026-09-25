import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/button';
import { TextField } from '@/components/text-field';
import { createMatch } from '@/features/matches/create-match';
import {
  type MatchFormErrors,
  type MatchFormInput,
  MAX_LOCATION_LENGTH,
  MAX_PLAYERS,
  MIN_PLAYERS,
  type ValidMatch,
  validateMatchForm,
} from '@/features/matches/validation';

const EMPTY_FORM: MatchFormInput = { date: '', time: '', location: '', maxPlayers: '4' };

function formatStartsAt(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()} um ${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())} Uhr`;
}

export default function CreateMatchScreen() {
  const router = useRouter();
  const [form, setForm] = useState<MatchFormInput>(EMPTY_FORM);
  const [errors, setErrors] = useState<MatchFormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [created, setCreated] = useState<ValidMatch | null>(null);

  function update(field: keyof MatchFormInput) {
    return (value: string) => {
      setForm((current) => ({ ...current, [field]: value }));
      setErrors((current) => ({ ...current, [field]: undefined }));
    };
  }

  async function handleSubmit() {
    setSubmitError(null);
    const result = validateMatchForm(form);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }

    setSaving(true);
    try {
      await createMatch(result.value);
      setCreated(result.value);
      setForm(EMPTY_FORM);
      setErrors({});
    } catch (e) {
      setSubmitError(
        e instanceof Error && e.message.startsWith('Du musst')
          ? e.message
          : 'Das Match konnte nicht gespeichert werden. Bitte versuche es erneut.',
      );
    } finally {
      setSaving(false);
    }
  }

  if (created) {
    return (
      <View style={[styles.flex, styles.container]}>
        <View accessibilityRole="alert" style={styles.success}>
          <Text style={styles.successTitle}>Match gespeichert!</Text>
          <Text style={styles.successText}>
            Dein Match am {formatStartsAt(created.startsAt)} in {created.location} für bis zu{' '}
            {created.maxPlayers} Spieler wurde erstellt.
          </Text>
        </View>
        <Button label="Zur Startseite" onPress={() => router.back()} />
        <Button
          label="Weiteres Match erstellen"
          variant="secondary"
          onPress={() => setCreated(null)}
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <TextField
          label="Datum *"
          value={form.date}
          onChangeText={update('date')}
          placeholder="TT.MM.JJJJ"
          keyboardType="numbers-and-punctuation"
          error={errors.date}
        />
        <TextField
          label="Uhrzeit *"
          value={form.time}
          onChangeText={update('time')}
          placeholder="HH:MM"
          keyboardType="numbers-and-punctuation"
          error={errors.time}
        />
        <TextField
          label="Ort *"
          value={form.location}
          onChangeText={update('location')}
          placeholder="z. B. Padel Club Mitte, Court 2"
          maxLength={MAX_LOCATION_LENGTH}
          error={errors.location}
        />
        <TextField
          label={`Maximale Spieleranzahl * (${MIN_PLAYERS}–${MAX_PLAYERS})`}
          value={form.maxPlayers}
          onChangeText={update('maxPlayers')}
          keyboardType="number-pad"
          maxLength={1}
          error={errors.maxPlayers}
        />
        {submitError ? (
          <Text accessibilityRole="alert" style={styles.error}>
            {submitError}
          </Text>
        ) : null}
        <Button label="Match erstellen" onPress={handleSubmit} loading={saving} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#f5f7f5' },
  container: { padding: 24, gap: 16 },
  error: { color: '#c62828', fontSize: 14 },
  success: {
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#e3f4ec',
    borderWidth: 1,
    borderColor: '#0b6e4f',
    gap: 8,
  },
  successTitle: { fontSize: 20, fontWeight: '700', color: '#0b6e4f' },
  successText: { fontSize: 16, color: '#1f1f1f' },
});
