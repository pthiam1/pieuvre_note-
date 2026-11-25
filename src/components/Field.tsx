import { StyleSheet, Text, TextInput, View } from 'react-native';
import type { KeyboardTypeOptions } from 'react-native';
import type { AppTheme } from '../types';

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  theme: AppTheme;
  keyboard?: KeyboardTypeOptions;
};

export default function Field({ label, value, onChange, placeholder, theme, keyboard }: Props) {
  const styles = StyleSheet.create({
    field: { marginBottom: 13 },
    label: { fontSize: 12, fontWeight: '700', color: theme.text, marginBottom: 7 },
    input: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
      paddingHorizontal: 13,
      paddingVertical: 12,
      fontSize: 14,
      color: theme.text,
      backgroundColor: theme.surfaceAlt,
    },
  });

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={theme.muted}
        keyboardType={keyboard}
        style={styles.input}
      />
    </View>
  );
}
