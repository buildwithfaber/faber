import { StyleSheet, Text, TextInput, type TextInputProps, View } from 'react-native';

type TextFieldProps = TextInputProps & {
  label: string;
  error?: string;
};

export function TextField({ label, error, style, ...inputProps }: TextFieldProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor="#8a8a8a"
        style={[styles.input, error ? styles.inputError : null, style]}
        {...inputProps}
      />
      {error ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 6 },
  label: { fontSize: 14, fontWeight: '600', color: '#1f1f1f' },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#c9c9c9',
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#1f1f1f',
  },
  inputError: { borderColor: '#c62828' },
  error: { fontSize: 13, color: '#c62828' },
});
