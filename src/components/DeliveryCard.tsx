import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { AppTheme, Delivery } from '../types';

export default function DeliveryCard({
  item,
  onDelete,
  onEdit,
  onPress,
  contact,
  theme,
}: {
  item: Delivery;
  onDelete: () => void;
  onEdit: () => void;
  onPress?: () => void;
  contact?: string;
  theme: AppTheme;
}) {
  const styles = StyleSheet.create({
    card: {
      backgroundColor: theme.surface,
      borderRadius: 17,
      padding: 16,
      marginBottom: 11,
      borderWidth: 1,
      borderColor: theme.border,
    },
    top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    content: { flex: 1 },
    actions: { alignItems: 'flex-end' },
    name: { fontSize: 16, fontWeight: '800', color: theme.text, marginBottom: 7 },
    detail: { fontSize: 12, color: theme.muted, marginTop: 4, flexShrink: 1 },
    delete: { fontSize: 10, color: '#D46F62', fontWeight: '700', paddingLeft: 8 },
    edit: { fontSize: 10, color: theme.purple, fontWeight: '800', paddingLeft: 8, marginBottom: 8 },
    pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 13 },
    pill: { backgroundColor: theme.chip, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 9 },
    pillText: { fontSize: 10, color: theme.purple, fontWeight: '700' },
    note: { fontSize: 12, color: theme.muted, marginTop: 10 },
  });

  return (
    <Pressable
      style={styles.card}
      onPress={onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={onPress ? `Afficher les détails de ${item.destinationName}` : undefined}
    >
      <View style={styles.top}>
        <View style={styles.content}>
          <Text style={styles.name}>{item.destinationName}</Text>
          <Text style={styles.detail}>📍  {item.address}</Text>
          {contact ? <Text style={styles.detail}>👤  Contact : {contact}</Text> : null}
        </View>
        <View style={styles.actions}>
          <TouchableOpacity onPress={onEdit} accessibilityRole="button" accessibilityLabel="Modifier la livraison">
            <Text style={styles.edit}>Modifier</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onDelete} accessibilityRole="button" accessibilityLabel="Supprimer la livraison">
            <Text style={styles.delete}>Supprimer</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.pills}>
        <View style={styles.pill}>
          <Text style={styles.pillText}>
            Couvercles : {item.covers === null ? 'Non renseigné' : item.covers}
          </Text>
        </View>
        <View style={styles.pill}>
          <Text style={styles.pillText}>Plans : {item.plans === null ? 'Non renseigné' : item.plans}</Text>
        </View>
      </View>
      {item.notes ? <Text style={styles.note}>Note : {item.notes}</Text> : null}
    </Pressable>
  );
}
