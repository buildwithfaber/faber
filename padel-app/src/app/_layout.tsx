import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { AuthProvider, useAuth } from '@/lib/auth-context';

function RootNavigator() {
  const { user, initializing } = useAuth();

  if (initializing) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const isSignedIn = user !== null;

  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'PADEL APP' }} />
      <Stack.Protected guard={!isSignedIn}>
        <Stack.Screen name="sign-in" options={{ title: 'Anmelden' }} />
      </Stack.Protected>
      <Stack.Protected guard={isSignedIn}>
        <Stack.Screen name="create-match" options={{ title: 'Match erstellen' }} />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigator />
      <StatusBar style="auto" />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
