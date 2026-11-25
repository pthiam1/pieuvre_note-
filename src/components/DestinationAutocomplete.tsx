import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import type { AppTheme, Place, PlaceKind } from '../types';

type Props = {
  value: string;
  selectedId: number | null;
  places: Place[];
  kind: PlaceKind;
  theme: AppTheme;
  onChange: (value: string) => void;
  onSelect: (place: Place) => void;
};

export default function DestinationAutocomplete({
  value,
  selectedId,
  places,
  kind,
  theme,
  onChange,
  onSelect,
}: Props) {
  const suggestions =
    value.trim() && selectedId === null
      ? places
          .filter(
            place =>
              place.kind === kind &&
              place.name.toLocaleLowerCase('fr').includes(value.trim().toLocaleLowerCase('fr')),
          )
          .slice(0, 5)
      : [];

  const styles = StyleSheet.create({
    wrapper: { marginBottom: 13 },
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
    suggestions: {
      marginTop: 5,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
      overflow: 'hidden',
      backgroundColor: theme.surface,
    },
    suggestion: {
      paddingHorizontal: 13,
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    suggestionName: { color: theme.text, fontSize: 13, fontWeight: '700' },
    suggestionAddress: { color: theme.muted, fontSize: 11, marginTop: 3 },
  });

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>Nom du chantier / site *</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="Saisis un nom pour afficher les suggestions"
        placeholderTextColor={theme.muted}
        style={styles.input}
        autoCorrect={false}
      />
      {suggestions.length > 0 ? (
        <View style={styles.suggestions}>
          {suggestions.map(place => (
            <TouchableOpacity
              key={place.id}
              onPress={() => onSelect(place)}
              style={styles.suggestion}
              accessibilityRole="button"
              accessibilityLabel={`Choisir ${place.name}, ${place.address}`}
            >
              <Text style={styles.suggestionName}>{place.name}</Text>
              <Text style={styles.suggestionAddress}>{place.address}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : null}
    </View>
  );
}
