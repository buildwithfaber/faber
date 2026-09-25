import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  loading?: boolean;
};

export function Button({ label, onPress, variant = 'primary', disabled, loading }: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' ? styles.primary : styles.secondary,
        pressed && styles.pressed,
        isDisabled && styles.disabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#fff' : '#0b6e4f'} />
      ) : (
        <Text style={[styles.label, variant === 'primary' ? styles.primaryLabel : styles.secondaryLabel]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: { backgroundColor: '#0b6e4f' },
  secondary: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#0b6e4f' },
  pressed: { opacity: 0.8 },
  disabled: { opacity: 0.5 },
  label: { fontSize: 16, fontWeight: '600' },
  primaryLabel: { color: '#fff' },
  secondaryLabel: { color: '#0b6e4f' },
});
