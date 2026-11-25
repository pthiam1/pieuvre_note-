import { StyleSheet, Text, View } from 'react-native';
import type { AppTheme } from '../types';

export default function EmptyState({
  title,
  text,
  theme,
}: {
  title: string;
  text: string;
  theme: AppTheme;
}) {
  const styles = StyleSheet.create({
    container: { alignItems: 'center', paddingHorizontal: 30, paddingTop: 65 },
    icon: { fontSize: 34, marginBottom: 12 },
    title: { fontSize: 16, fontWeight: '800', color: theme.text },
    text: { fontSize: 12, color: theme.muted, textAlign: 'center', lineHeight: 19, marginTop: 7 },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🗒️</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}
