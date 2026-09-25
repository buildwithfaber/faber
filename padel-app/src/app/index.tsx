import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/button';
import { useAuth } from '@/lib/auth-context';
import { auth } from '@/lib/firebase';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>PADEL APP</Text>
        <Text style={styles.subtitle}>Mitspieler und Matches finden</Text>
      </View>

      <View style={styles.actions}>
        <Button
          label="Match erstellen"
          onPress={() => router.push(user ? '/create-match' : '/sign-in')}
        />
        {/* Matches durchsuchen is not part of this task yet. */}
        <Button label="Match finden (bald verfügbar)" variant="secondary" disabled />
      </View>

      <View style={styles.footer}>
        {user ? (
          <>
            <Text style={styles.status}>Angemeldet als {user.email}</Text>
            <Button label="Abmelden" variant="secondary" onPress={() => signOut(auth)} />
          </>
        ) : (
          <>
            <Text style={styles.status}>Zum Erstellen eines Matches musst du angemeldet sein.</Text>
            <Button label="Anmelden" variant="secondary" onPress={() => router.push('/sign-in')} />
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    gap: 32,
    justifyContent: 'center',
    backgroundColor: '#f5f7f5',
  },
  header: { alignItems: 'center', gap: 8 },
  title: { fontSize: 36, fontWeight: '800', letterSpacing: 2, color: '#0b6e4f' },
  subtitle: { fontSize: 16, color: '#4a4a4a' },
  actions: { gap: 12 },
  footer: { gap: 12 },
  status: { textAlign: 'center', color: '#4a4a4a' },
});
