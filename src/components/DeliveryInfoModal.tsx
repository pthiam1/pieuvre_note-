import { useState } from 'react';
import {
  Alert,
  Linking,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import type { AppTheme, Delivery, Place } from '../types';
import { formatDate } from '../utils/dates';

type Props = {
  delivery: Delivery | null;
  place?: Place;
  theme: AppTheme;
  onClose: () => void;
  onEdit: (delivery: Delivery) => void;
};

export default function DeliveryInfoModal({
  delivery,
  place,
  theme,
  onClose,
  onEdit,
}: Props) {
  const [copying, setCopying] = useState(false);
  const styles = createStyles(theme);

  async function copyPhone() {
    if (!place?.phone || copying) return;
    setCopying(true);
    try {
      await Clipboard.setStringAsync(place.phone);
      Alert.alert('Numéro copié', place.phone);
    } catch {
      Alert.alert('Copie impossible', 'Le numéro n’a pas pu être copié.');
    } finally {
      setCopying(false);
    }
  }

  async function callPhone() {
    if (!place?.phone) return;
    const phoneNumber = place.phone.replace(/[^\d+]/g, '');
    try {
      await Linking.openURL(`tel:${phoneNumber}`);
    } catch {
      Alert.alert('Appel impossible', 'Votre appareil ne peut pas lancer cet appel.');
    }
  }

  return (
    <Modal
      visible={delivery !== null}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {delivery ? (
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Fermer les détails"
            >
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>

            <View style={styles.iconCircle}>
              <Text style={styles.icon}>📍</Text>
            </View>
            <Text style={styles.eyebrow}>DÉTAILS DE LA LIVRAISON</Text>
            <Text style={styles.title}>{delivery.destinationName}</Text>
            <Text style={styles.date}>{formatDate(delivery.date)}</Text>

            <View style={styles.separator} />
            <InfoRow icon="📍" label="Adresse" value={delivery.address} theme={theme} />
            <InfoRow
              icon="👤"
              label="Contact sur place"
              value={place?.contact || 'Aucun contact enregistré'}
              theme={theme}
              muted={!place?.contact}
            />
            {place?.phone ? (
              <View style={styles.phonePanel}>
                <View style={styles.phoneHeading}>
                  <Text style={styles.phoneIcon}>☎</Text>
                  <Text style={styles.phoneLabel}>Téléphone</Text>
                </View>
                <Text style={styles.phoneNumber} selectable>
                  {place.phone}
                </Text>
                <View style={styles.phoneActions}>
                  <TouchableOpacity
                    style={styles.copyButton}
                    onPress={() => void copyPhone()}
                    disabled={copying}
                    accessibilityRole="button"
                  >
                    <Text style={styles.copyText}>{copying ? 'Copie…' : 'Copier le numéro'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.callButton}
                    onPress={() => void callPhone()}
                    accessibilityRole="button"
                  >
                    <Text style={styles.callText}>Appeler</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : null}
            <View style={styles.quantityRow}>
              <Text style={styles.quantity}>
                Couvercles : {delivery.covers === null ? '—' : delivery.covers}
              </Text>
              <Text style={styles.quantity}>Plans : {delivery.plans === null ? '—' : delivery.plans}</Text>
            </View>
            {delivery.notes ? <Text style={styles.notes}>Note : {delivery.notes}</Text> : null}
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => onEdit(delivery)}
              accessibilityRole="button"
            >
              <Text style={styles.editText}>Modifier la livraison</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
    </Modal>
  );
}

function InfoRow({
  icon,
  label,
  value,
  theme,
  muted = false,
}: {
  icon: string;
  label: string;
  value: string;
  theme: AppTheme;
  muted?: boolean;
}) {
  const styles = StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 15 },
    icon: { fontSize: 16, marginRight: 11, marginTop: 1 },
    content: { flex: 1 },
    label: { fontSize: 10, color: theme.muted, fontWeight: '700', marginBottom: 3 },
    value: { fontSize: 13, color: muted ? theme.muted : theme.text, fontWeight: muted ? '500' : '700' },
  });

  return (
    <View style={styles.row}>
      <Text style={styles.icon}>{icon}</Text>
      <View style={styles.content}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
    </View>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(15,10,28,.68)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 22,
    },
    card: {
      width: '100%',
      maxWidth: 400,
      maxHeight: '90%',
      backgroundColor: theme.surface,
      borderRadius: 26,
      padding: 23,
      alignItems: 'stretch',
    },
    closeButton: {
      position: 'absolute',
      zIndex: 1,
      top: 14,
      right: 14,
      width: 34,
      height: 34,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.background,
    },
    closeText: { color: theme.muted, fontSize: 15 },
    iconCircle: {
      width: 56,
      height: 56,
      borderRadius: 19,
      backgroundColor: theme.chip,
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center',
      marginBottom: 13,
    },
    icon: { fontSize: 25 },
    eyebrow: {
      color: theme.purple,
      fontSize: 9,
      fontWeight: '900',
      letterSpacing: 1.3,
      textAlign: 'center',
    },
    title: { color: theme.text, fontSize: 22, fontWeight: '900', textAlign: 'center', marginTop: 5 },
    date: { color: theme.muted, fontSize: 12, textAlign: 'center', marginTop: 4, textTransform: 'capitalize' },
    separator: { height: 1, backgroundColor: theme.border, marginVertical: 19 },
    phonePanel: {
      backgroundColor: theme.chip,
      borderRadius: 15,
      padding: 13,
      marginBottom: 15,
    },
    phoneHeading: { flexDirection: 'row', alignItems: 'center' },
    phoneIcon: { color: theme.purple, fontSize: 14, marginRight: 8 },
    phoneLabel: { color: theme.muted, fontSize: 10, fontWeight: '700' },
    phoneNumber: { color: theme.text, fontSize: 17, fontWeight: '900', marginTop: 4 },
    phoneActions: { flexDirection: 'row', gap: 9, marginTop: 11 },
    copyButton: {
      flex: 1,
      borderRadius: 10,
      backgroundColor: theme.surface,
      paddingVertical: 10,
      alignItems: 'center',
    },
    copyText: { color: theme.purple, fontSize: 11, fontWeight: '800' },
    callButton: {
      flex: 1,
      borderRadius: 10,
      backgroundColor: theme.purple,
      paddingVertical: 10,
      alignItems: 'center',
    },
    callText: { color: theme.surface, fontSize: 11, fontWeight: '800' },
    quantityRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 },
    quantity: { color: theme.muted, fontSize: 10, fontWeight: '700' },
    notes: { color: theme.muted, fontSize: 12, marginTop: 12 },
    editButton: {
      borderRadius: 13,
      backgroundColor: theme.orange,
      paddingVertical: 13,
      alignItems: 'center',
      marginTop: 18,
    },
    editText: { color: '#FFFFFF', fontSize: 13, fontWeight: '900' },
  });
}
