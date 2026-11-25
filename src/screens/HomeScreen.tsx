import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { useSQLiteContext } from 'expo-sqlite';
import DeliveryCard from '../components/DeliveryCard';
import DeliveryInfoModal from '../components/DeliveryInfoModal';
import DestinationAutocomplete from '../components/DestinationAutocomplete';
import EmptyState from '../components/EmptyState';
import Field from '../components/Field';
import type { Delivery, Place, PlaceKind, Tab } from '../types';
import { formatDate, isWeekday, today, toDateString } from '../utils/dates';
import { ORANGE, themes } from '../theme';

type FormModal = 'delivery' | 'chantier' | 'relais' | null;

export default function HomeScreen() {
  const db = useSQLiteContext();
  const [tab, setTab] = useState<Tab>('Agenda');
  const [date, setDate] = useState(today());
  const [places, setPlaces] = useState<Place[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [modal, setModal] = useState<FormModal>(null);
  const [aboutVisible, setAboutVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingPlaceId, setEditingPlaceId] = useState<number | null>(null);
  const [editingDeliveryId, setEditingDeliveryId] = useState<number | null>(null);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [contact, setContact] = useState('');
  const [phone, setPhone] = useState('');
  const [deliveryDate, setDeliveryDate] = useState(today());
  const [destType, setDestType] = useState<PlaceKind>('chantier');
  const [destId, setDestId] = useState<number | null>(null);
  const [covers, setCovers] = useState('');
  const [plans, setPlans] = useState('');
  const [notes, setNotes] = useState('');

  const theme = darkMode ? themes.dark : themes.light;
  const styles = createStyles(theme);

  async function refresh() {
    const [savedPlaces, savedDeliveries, savedTheme] = await Promise.all([
      db.getAllAsync<Place>('SELECT * FROM places ORDER BY name COLLATE NOCASE'),
      db.getAllAsync<Delivery>('SELECT * FROM deliveries ORDER BY date DESC, id DESC'),
      db.getFirstAsync<{ value: string }>('SELECT value FROM settings WHERE key = ?', 'theme'),
    ]);
    setPlaces(savedPlaces);
    setDeliveries(savedDeliveries);
    setDarkMode(savedTheme?.value === 'dark');
  }

  useEffect(() => {
    void refresh();
  }, []);

  function resetForm() {
    setEditingPlaceId(null);
    setEditingDeliveryId(null);
    setName('');
    setAddress('');
    setContact('');
    setPhone('');
    setDeliveryDate(date);
    setDestType('chantier');
    setDestId(null);
    setCovers('');
    setPlans('');
    setNotes('');
  }

  function openModal(which: Exclude<FormModal, null>) {
    resetForm();
    setModal(which);
  }

  function editPlace(place: Place) {
    setEditingPlaceId(place.id);
    setName(place.name);
    setAddress(place.address);
    setContact(place.contact);
    setPhone(place.phone);
    setModal(place.kind);
  }

  function editDelivery(delivery: Delivery) {
    setEditingDeliveryId(delivery.id);
    setDeliveryDate(delivery.date);
    setDestType(delivery.destinationType === 'relais' ? 'relais' : 'chantier');
    setDestId(delivery.destinationId);
    setName(delivery.destinationName);
    setAddress(delivery.address);
    setCovers(delivery.covers === null ? '' : String(delivery.covers));
    setPlans(delivery.plans === null ? '' : String(delivery.plans));
    setNotes(delivery.notes);
    setModal('delivery');
  }

  async function savePlace() {
    if (!name.trim() || !address.trim()) {
      Alert.alert('Informations manquantes', 'Le nom et l’adresse sont obligatoires.');
      return;
    }

    if (editingPlaceId !== null) {
      await db.runAsync(
        'UPDATE places SET name = ?, address = ?, contact = ?, phone = ? WHERE id = ?',
        name.trim(),
        address.trim(),
        contact.trim(),
        phone.trim(),
        editingPlaceId,
      );
    } else {
      await db.runAsync(
        'INSERT INTO places (name,address,contact,phone,kind) VALUES (?,?,?,?,?)',
        name.trim(),
        address.trim(),
        contact.trim(),
        phone.trim(),
        modal === 'chantier' ? 'chantier' : 'relais',
      );
    }
    setModal(null);
    setEditingPlaceId(null);
    await refresh();
  }

  async function saveDelivery() {
    if (!isWeekday(deliveryDate)) {
      Alert.alert('Jour non autorisé', 'Les livraisons sont prévues du lundi au vendredi.');
      return;
    }
    if (!name.trim() || !address.trim()) {
      Alert.alert('Informations manquantes', 'Choisis une destination ou saisis son nom et son adresse.');
      return;
    }

    const selected = places.find(place => place.id === destId);
    const values = [
      deliveryDate,
      destType,
      destId,
      selected?.name ?? name.trim(),
      selected?.address ?? address.trim(),
      covers.trim() ? Number(covers) : null,
      plans.trim() ? Number(plans) : null,
      notes.trim(),
    ] as const;
    if (editingDeliveryId !== null) {
      await db.runAsync(
        'UPDATE deliveries SET date = ?, destinationType = ?, destinationId = ?, destinationName = ?, address = ?, covers = ?, plans = ?, notes = ? WHERE id = ?',
        ...values,
        editingDeliveryId,
      );
    } else {
      await db.runAsync(
        'INSERT INTO deliveries (date,destinationType,destinationId,destinationName,address,covers,plans,notes) VALUES (?,?,?,?,?,?,?,?)',
        ...values,
      );
    }
    setModal(null);
    setEditingDeliveryId(null);
    await refresh();
  }

  async function removeDelivery(id: number) {
    Alert.alert('Supprimer la livraison ?', 'Cette action est définitive.', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          await db.runAsync('DELETE FROM deliveries WHERE id = ?', id);
          await refresh();
        },
      },
    ]);
  }

  async function removePlace(place: Place) {
    Alert.alert(
      'Supprimer cette fiche ?',
      `Supprimer « ${place.name} » ? Les livraisons déjà enregistrées seront conservées.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            await db.runAsync('DELETE FROM places WHERE id = ?', place.id);
            await refresh();
          },
        },
      ],
    );
  }

  async function toggleTheme() {
    const nextTheme = darkMode ? 'light' : 'dark';
    try {
      await db.runAsync(
        'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
        'theme',
        nextTheme,
      );
      setDarkMode(nextTheme === 'dark');
    } catch {
      Alert.alert('Thème non enregistré', 'Impossible d’enregistrer votre préférence pour le moment.');
    }
  }

  function changeDate(delta: number) {
    const nextDate = new Date(`${date}T12:00:00`);
    nextDate.setDate(nextDate.getDate() + delta);
    setDate(toDateString(nextDate));
  }

  const dayDeliveries = deliveries.filter(delivery => delivery.date === date);
  const listPlaces = places.filter(place =>
    (tab === 'Chantiers' ? place.kind === 'chantier' : place.kind === 'relais') &&
    (tab !== 'Chantiers' ||
      `${place.name} ${place.address} ${place.contact}`.toLocaleLowerCase('fr').includes(searchQuery.trim().toLocaleLowerCase('fr'))),
  );
  const weekDays = Array.from({ length: 5 }, (_, index) => {
    const day = new Date(`${date}T12:00:00`);
    const monday = (day.getDay() + 6) % 7;
    day.setDate(day.getDate() - monday + index);
    return toDateString(day);
  });
  const title =
    tab === 'Agenda'
      ? 'Mon agenda'
      : tab === 'Livraisons'
        ? 'Toutes les livraisons'
        : tab === 'Chantiers'
          ? 'Mes chantiers'
          : 'Sites de relais';

  return (
    <SafeAreaView style={styles.safe}>
      <ExpoStatusBar style={darkMode ? 'light' : 'dark'} />
      <View style={styles.header}>
        <View>
          <Text style={styles.brand}>
            <Text style={styles.brandOrange}>pieuvre</Text>{' '}
            <Text style={styles.brandPurple}>Note</Text>
          </Text>
          <Text style={styles.tagline}>Votre agenda de livraisons</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setAboutVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="Informations sur le développeur"
          >
            <Text style={styles.headerButtonText}>i</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerBadge}
            onPress={() => void toggleTheme()}
            accessibilityRole="button"
            accessibilityLabel={darkMode ? 'Activer le mode jour' : 'Activer le mode nuit'}
          >
            <Text style={styles.themeIcon}>{darkMode ? '☀️' : '🌙'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.pageHead}>
        <View>
          <Text style={styles.pageTitle}>{title}</Text>
          <Text style={styles.sub}>
            {tab === 'Agenda' ? formatDate(date) : 'Toutes vos informations au même endroit'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.plus}
          onPress={() => openModal(tab === 'Chantiers' ? 'chantier' : tab === 'Relais' ? 'relais' : 'delivery')}
          accessibilityRole="button"
          accessibilityLabel="Ajouter"
        >
          <Text style={styles.plusText}>＋</Text>
        </TouchableOpacity>
      </View>

      {tab === 'Agenda' ? (
        <>
          <View style={styles.weekNav}>
            <TouchableOpacity onPress={() => changeDate(-7)} accessibilityLabel="Semaine précédente">
              <Text style={styles.arrow}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.weekLabel}>
              SEMAINE DU{' '}
              {new Date(`${weekDays[0]}T12:00:00`)
                .toLocaleDateString('fr-FR', { day: '2-digit', month: 'long' })
                .toUpperCase()}
            </Text>
            <TouchableOpacity onPress={() => changeDate(7)} accessibilityLabel="Semaine suivante">
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.days}>
            {weekDays.map((day, index) => (
              <TouchableOpacity
                key={day}
                onPress={() => setDate(day)}
                style={[styles.day, day === date && styles.dayActive]}
              >
                <Text style={[styles.dayName, day === date && styles.dayTextActive]}>
                  {['LUN', 'MAR', 'MER', 'JEU', 'VEN'][index]}
                </Text>
                <Text style={[styles.dayNum, day === date && styles.dayTextActive]}>
                  {day.slice(-2)}
                </Text>
                <View style={[styles.dot, day === date && styles.activeDot]} />
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.countRow}>
            <Text style={styles.sectionTitle}>Livraisons du jour</Text>
            <Text style={styles.count}>{dayDeliveries.length} livraison(s)</Text>
          </View>
          <FlatList
            data={dayDeliveries}
            keyExtractor={item => String(item.id)}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <EmptyState
                theme={theme}
                title="Aucune livraison prévue"
                text="Ajoute une livraison avec le bouton + pour organiser ta journée."
              />
            }
            renderItem={({ item }) => (
              <DeliveryCard
                item={item}
                theme={theme}
                contact={places.find(place => place.id === item.destinationId)?.contact}
                onEdit={() => editDelivery(item)}
                onDelete={() => void removeDelivery(item.id)}
              />
            )}
          />
        </>
      ) : null}

      {tab === 'Livraisons' ? (
        <FlatList
          data={deliveries}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <EmptyState
              theme={theme}
              title="Aucune livraison enregistrée"
              text="Tes livraisons apparaîtront ici."
            />
          }
          renderItem={({ item }) => (
            <View>
              <Text style={styles.dateLabel}>{formatDate(item.date)}</Text>
              <DeliveryCard
                item={item}
                theme={theme}
                contact={places.find(place => place.id === item.destinationId)?.contact}
                onEdit={() => editDelivery(item)}
                onDelete={() => void removeDelivery(item.id)}
                onPress={() => setSelectedDelivery(item)}
              />
            </View>
          )}
        />
      ) : null}

      {tab === 'Chantiers' || tab === 'Relais' ? (
        <>
          {tab === 'Chantiers' ? (
            <View style={styles.searchWrap}>
              <Text style={styles.searchIcon}>⌕</Text>
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Rechercher un chantier..."
                placeholderTextColor={theme.muted}
                style={styles.searchInput}
                returnKeyType="search"
                accessibilityLabel="Rechercher un chantier"
              />
              {searchQuery ? (
                <TouchableOpacity onPress={() => setSearchQuery('')} accessibilityLabel="Effacer la recherche">
                  <Text style={styles.searchClear}>✕</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ) : null}
          <FlatList
            data={listPlaces}
            keyExtractor={item => String(item.id)}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <EmptyState
                theme={theme}
                title={
                  tab === 'Chantiers' && searchQuery
                    ? 'Aucun chantier trouvé'
                    : tab === 'Chantiers'
                      ? 'Aucun chantier'
                      : 'Aucun site de relais'
                }
                text={
                  tab === 'Chantiers' && searchQuery
                    ? 'Essaie un autre nom, une adresse ou un contact.'
                    : 'Ajoute une fiche pour la retrouver rapidement lors de la création d’une livraison.'
                }
              />
            }
            renderItem={({ item }) => (
              <View style={styles.placeCard}>
                <View style={styles.cardTop}>
                  <Text style={styles.placeName}>{item.name}</Text>
                  <View style={styles.placeActions}>
                    <TouchableOpacity
                      onPress={() => editPlace(item)}
                      accessibilityRole="button"
                      accessibilityLabel={`Modifier ${item.name}`}
                    >
                      <Text style={styles.edit}>Modifier</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => void removePlace(item)}
                      accessibilityRole="button"
                      accessibilityLabel={`Supprimer ${item.name}`}
                    >
                      <Text style={styles.delete}>Supprimer</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <Text style={styles.detail}>📍  {item.address}</Text>
                {item.contact ? <Text style={styles.detail}>👤  {item.contact}</Text> : null}
                {item.phone ? <Text style={styles.detail}>☎️  {item.phone}</Text> : null}
              </View>
            )}
          />
        </>
      ) : null}

      <View style={styles.bottom}>
        {(['Agenda', 'Livraisons', 'Chantiers', 'Relais'] as Tab[]).map((item, index) => (
          <TouchableOpacity
            key={item}
            onPress={() => setTab(item)}
            style={styles.navItem}
            accessibilityRole="button"
            accessibilityState={{ selected: tab === item }}
          >
            <Text style={[styles.navIcon, tab === item && styles.navSelected]}>
              {['▦', '↗', '⌂', '◎'][index]}
            </Text>
            <Text style={[styles.navText, tab === item && styles.navSelected]}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Modal visible={modal !== null} animationType="slide" transparent onRequestClose={() => setModal(null)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.overlay}
        >
          <View style={styles.sheet}>
            <View style={styles.sheetHead}>
              <Text style={styles.sheetTitle}>
                {modal === 'delivery'
                  ? editingDeliveryId !== null ? 'Modifier la livraison' : 'Nouvelle livraison'
                  : modal === 'chantier'
                    ? editingPlaceId !== null ? 'Modifier le chantier' : 'Nouveau chantier'
                    : editingPlaceId !== null ? 'Modifier le site de relais' : 'Nouveau site de relais'}
              </Text>
              <TouchableOpacity onPress={() => setModal(null)} accessibilityLabel="Fermer">
                <Text style={styles.close}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView keyboardShouldPersistTaps="handled">
              {modal === 'delivery' ? (
                <>
                  <Field
                    theme={theme}
                    label="Date (AAAA-MM-JJ)"
                    value={deliveryDate}
                    onChange={setDeliveryDate}
                    placeholder="2026-11-25"
                  />
                  <Text style={styles.fieldLabel}>Type de destination</Text>
                  <View style={styles.segment}>
                    {(['chantier', 'relais'] as PlaceKind[]).map(kind => (
                      <TouchableOpacity
                        key={kind}
                        onPress={() => {
                          setDestType(kind);
                          setDestId(null);
                          setName('');
                          setAddress('');
                        }}
                        style={[styles.segmentBtn, destType === kind && styles.segmentActive]}
                      >
                        <Text style={[styles.segmentText, destType === kind && styles.segmentTextActive]}>
                          {kind === 'chantier' ? 'Chantier' : 'Site de relais'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <Text style={styles.fieldLabel}>Destination enregistrée (facultatif)</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {places
                      .filter(place => place.kind === destType)
                      .map(place => (
                        <TouchableOpacity
                          key={place.id}
                          onPress={() => {
                            setDestId(place.id);
                            setName(place.name);
                            setAddress(place.address);
                          }}
                          style={[styles.chip, destId === place.id && styles.chipActive]}
                        >
                          <Text style={[styles.chipText, destId === place.id && styles.chipTextActive]}>
                            {place.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                  </ScrollView>
                  <DestinationAutocomplete
                    value={name}
                    selectedId={destId}
                    places={places}
                    kind={destType}
                    theme={theme}
                    onChange={value => {
                      if (destId !== null) {
                        setDestId(null);
                        setAddress('');
                      }
                      setName(value);
                    }}
                    onSelect={place => {
                      setDestId(place.id);
                      setName(place.name);
                      setAddress(place.address);
                    }}
                  />
                  <Field
                    theme={theme}
                    label="Adresse *"
                    value={address}
                    onChange={value => {
                      if (destId !== null) setDestId(null);
                      setAddress(value);
                    }}
                    placeholder="Adresse complète"
                  />
                  {places.find(place => place.id === destId)?.contact ? (
                    <View style={styles.contactPreview}>
                      <Text style={styles.contactIcon}>👤</Text>
                      <View>
                        <Text style={styles.contactLabel}>Contact du chantier</Text>
                        <Text style={styles.contactValue}>
                          {places.find(place => place.id === destId)?.contact}
                        </Text>
                      </View>
                    </View>
                  ) : null}
                  <View style={styles.twoFields}>
                    <View style={styles.flex}>
                      <Field
                        theme={theme}
                        label="Nombre de couvercles"
                        value={covers}
                        onChange={setCovers}
                        placeholder="0"
                        keyboard="numeric"
                      />
                    </View>
                    <View style={styles.flex}>
                      <Field
                        theme={theme}
                        label="Nombre de plans"
                        value={plans}
                        onChange={setPlans}
                        placeholder="0"
                        keyboard="numeric"
                      />
                    </View>
                  </View>
                  <Field
                    theme={theme}
                    label="Notes (facultatif)"
                    value={notes}
                    onChange={setNotes}
                    placeholder="Informations complémentaires"
                  />
                </>
              ) : (
                <>
                  <Field
                    theme={theme}
                    label="Nom *"
                    value={name}
                    onChange={setName}
                    placeholder="Nom du chantier ou du site"
                  />
                  <Field
                    theme={theme}
                    label="Adresse *"
                    value={address}
                    onChange={setAddress}
                    placeholder="Adresse complète"
                  />
                  <Field
                    theme={theme}
                    label="Contact sur place"
                    value={contact}
                    onChange={setContact}
                    placeholder="Nom du contact"
                  />
                  <Field
                    theme={theme}
                    label="Téléphone"
                    value={phone}
                    onChange={setPhone}
                    placeholder="06..."
                    keyboard="phone-pad"
                  />
                </>
              )}
              <TouchableOpacity
                style={styles.save}
                onPress={() => void (modal === 'delivery' ? saveDelivery() : savePlace())}
                accessibilityRole="button"
              >
                <Text style={styles.saveText}>Enregistrer</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={aboutVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setAboutVisible(false)}
      >
        <View style={styles.aboutOverlay}>
          <View style={styles.aboutCard}>
            <TouchableOpacity
              style={styles.aboutClose}
              onPress={() => setAboutVisible(false)}
              accessibilityLabel="Fermer les informations"
            >
              <Text style={styles.aboutCloseText}>✕</Text>
            </TouchableOpacity>
            <Image
              source={require('../../Logo-Pieuvre-Note.png')}
              style={styles.aboutLogo}
              resizeMode="contain"
              accessibilityLabel="Logo Pieuvre Note"
            />
            <Text style={styles.aboutBrand}>
              <Text style={styles.brandOrange}>pieuvre</Text>{' '}
              <Text style={styles.brandPurple}>Note</Text>
            </Text>
            <Text style={styles.aboutSubtitle}>Votre agenda de livraisons</Text>
            <View style={styles.aboutDivider} />
            <Text style={styles.aboutEyebrow}>CONÇU ET DÉVELOPPÉ PAR</Text>
            <Text style={styles.aboutName}>Papa Thiam</Text>
            <Text style={styles.aboutRole}>Développeur de Pieuvre Note</Text>
            <View style={styles.aboutContact}>
              <Text style={styles.aboutPhoneIcon}>☎</Text>
              <Text style={styles.aboutPhone}>0752834362</Text>
            </View>
            <Text style={styles.copyright}>© 2026 Pieuvre Note. Tous droits réservés.</Text>
          </View>
        </View>
      </Modal>

      <DeliveryInfoModal
        delivery={selectedDelivery}
        place={
          selectedDelivery?.destinationId === null || selectedDelivery === null
            ? undefined
            : places.find(place => place.id === selectedDelivery.destinationId)
        }
        theme={theme}
        onClose={() => setSelectedDelivery(null)}
        onEdit={delivery => {
          setSelectedDelivery(null);
          editDelivery(delivery);
        }}
      />
    </SafeAreaView>
  );
}

function createStyles(theme: (typeof themes)['light']) {
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: theme.background,
      paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    header: {
      backgroundColor: theme.surface,
      paddingHorizontal: 22,
      paddingVertical: 14,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    brand: { fontSize: 29, fontWeight: '900', letterSpacing: -1 },
    brandOrange: { color: ORANGE },
    brandPurple: { color: theme.purple },
    tagline: { color: theme.muted, fontSize: 11, letterSpacing: 0.4, marginTop: -2 },
    headerActions: { flexDirection: 'row', alignItems: 'center', gap: 9 },
    headerButton: {
      width: 38,
      height: 38,
      borderRadius: 13,
      backgroundColor: theme.background,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerButtonText: { color: theme.purple, fontSize: 18, fontWeight: '800' },
    headerBadge: {
      width: 43,
      height: 43,
      borderRadius: 15,
      backgroundColor: theme.chip,
      alignItems: 'center',
      justifyContent: 'center',
    },
    themeIcon: { fontSize: 21 },
    pageHead: {
      paddingHorizontal: 22,
      paddingTop: 22,
      paddingBottom: 12,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    pageTitle: { fontSize: 24, fontWeight: '800', color: theme.text },
    sub: { fontSize: 12, color: theme.muted, marginTop: 4 },
    plus: {
      width: 46,
      height: 46,
      borderRadius: 16,
      backgroundColor: ORANGE,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 3,
    },
    plusText: { fontSize: 29, color: '#FFFFFF', lineHeight: 32 },
    weekNav: {
      marginHorizontal: 20,
      marginTop: 8,
      backgroundColor: theme.surface,
      borderRadius: 14,
      paddingHorizontal: 15,
      paddingVertical: 8,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    arrow: { fontSize: 30, color: theme.purple, paddingHorizontal: 8 },
    weekLabel: { fontSize: 11, fontWeight: '800', color: theme.muted, letterSpacing: 0.7 },
    days: { flexDirection: 'row', marginHorizontal: 18, marginTop: 10, justifyContent: 'space-between' },
    day: {
      width: '18.5%',
      backgroundColor: theme.surface,
      borderRadius: 14,
      alignItems: 'center',
      paddingVertical: 12,
      borderWidth: 1,
      borderColor: theme.border,
    },
    dayActive: { backgroundColor: theme.purple, borderColor: theme.purple },
    dayName: { fontSize: 10, fontWeight: '800', color: theme.muted },
    dayNum: { fontSize: 20, fontWeight: '800', color: theme.text, marginTop: 4 },
    dayTextActive: { color: '#FFFFFF' },
    dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: ORANGE, marginTop: 6 },
    activeDot: { backgroundColor: '#FFFFFF' },
    countRow: {
      paddingHorizontal: 22,
      marginTop: 24,
      marginBottom: 8,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    sectionTitle: { fontSize: 16, fontWeight: '800', color: theme.text },
    count: { fontSize: 11, color: theme.purple, fontWeight: '700' },
    list: { paddingHorizontal: 18, paddingBottom: 25, flexGrow: 1 },
    dateLabel: {
      fontSize: 12,
      color: theme.purple,
      fontWeight: '800',
      marginTop: 8,
      marginBottom: 8,
      textTransform: 'capitalize',
    },
    placeCard: {
      backgroundColor: theme.surface,
      borderRadius: 16,
      padding: 16,
      marginBottom: 11,
      borderWidth: 1,
      borderColor: theme.border,
    },
    cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    placeName: { flex: 1, fontSize: 16, fontWeight: '800', color: theme.text, marginBottom: 7 },
    placeActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    edit: { fontSize: 10, color: theme.purple, fontWeight: '800', paddingLeft: 8 },
    detail: { fontSize: 12, color: theme.muted, marginTop: 4, flexShrink: 1 },
    delete: { fontSize: 10, color: '#D46F62', fontWeight: '700', paddingLeft: 8 },
    searchWrap: {
      marginHorizontal: 18,
      marginTop: 4,
      marginBottom: 12,
      paddingHorizontal: 13,
      height: 48,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.surface,
      flexDirection: 'row',
      alignItems: 'center',
    },
    searchIcon: { color: theme.purple, fontSize: 25, marginRight: 9, lineHeight: 28 },
    searchInput: { flex: 1, color: theme.text, fontSize: 14, paddingVertical: 8 },
    searchClear: { color: theme.muted, fontSize: 15, padding: 5 },
    bottom: {
      height: 69,
      backgroundColor: theme.surface,
      borderTopWidth: 1,
      borderTopColor: theme.border,
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      paddingBottom: Platform.OS === 'ios' ? 8 : 0,
    },
    navItem: { alignItems: 'center', justifyContent: 'center', minWidth: 65 },
    navIcon: { fontSize: 21, color: theme.muted },
    navText: { fontSize: 10, color: theme.muted, marginTop: 3, fontWeight: '600' },
    navSelected: { color: theme.purple, fontWeight: '900' },
    overlay: { flex: 1, backgroundColor: 'rgba(23,12,43,.55)', justifyContent: 'flex-end' },
    sheet: {
      backgroundColor: theme.surface,
      borderTopLeftRadius: 25,
      borderTopRightRadius: 25,
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 30,
      maxHeight: '92%',
    },
    sheetHead: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 18,
    },
    sheetTitle: { fontSize: 20, fontWeight: '800', color: theme.text },
    close: { fontSize: 20, color: theme.muted, padding: 5 },
    fieldLabel: { fontSize: 12, fontWeight: '700', color: theme.text, marginBottom: 7 },
    contactPreview: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.chip,
      borderRadius: 12,
      paddingHorizontal: 13,
      paddingVertical: 11,
      marginTop: -4,
      marginBottom: 13,
    },
    contactIcon: { fontSize: 18, marginRight: 10 },
    contactLabel: { fontSize: 10, color: theme.muted, fontWeight: '700' },
    contactValue: { fontSize: 13, color: theme.text, fontWeight: '800', marginTop: 2 },
    twoFields: { flexDirection: 'row', gap: 12 },
    flex: { flex: 1 },
    segment: {
      flexDirection: 'row',
      backgroundColor: theme.background,
      padding: 4,
      borderRadius: 12,
      marginBottom: 14,
    },
    segmentBtn: { flex: 1, padding: 11, alignItems: 'center', borderRadius: 9 },
    segmentActive: { backgroundColor: theme.purple },
    segmentText: { fontSize: 12, fontWeight: '700', color: theme.muted },
    segmentTextActive: { color: '#FFFFFF' },
    chip: {
      paddingHorizontal: 12,
      paddingVertical: 9,
      borderRadius: 20,
      backgroundColor: theme.chip,
      marginRight: 7,
      marginBottom: 13,
    },
    chipActive: { backgroundColor: theme.purple },
    chipText: { fontSize: 11, color: theme.chipText, fontWeight: '700' },
    chipTextActive: { color: '#FFFFFF' },
    save: {
      backgroundColor: ORANGE,
      borderRadius: 13,
      padding: 15,
      alignItems: 'center',
      marginTop: 7,
      marginBottom: 15,
    },
    saveText: { fontSize: 14, fontWeight: '800', color: '#FFFFFF' },
    aboutOverlay: {
      flex: 1,
      backgroundColor: 'rgba(15,10,28,.68)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    aboutCard: {
      width: '100%',
      maxWidth: 380,
      alignItems: 'center',
      backgroundColor: theme.surface,
      borderRadius: 28,
      paddingHorizontal: 25,
      paddingTop: 34,
      paddingBottom: 24,
      overflow: 'hidden',
    },
    aboutClose: {
      position: 'absolute',
      top: 14,
      right: 15,
      width: 34,
      height: 34,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.background,
    },
    aboutCloseText: { color: theme.muted, fontSize: 16 },
    aboutLogo: {
      width: 112,
      height: 112,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: '#FFFFFF',
      marginBottom: 15,
    },
    aboutBrand: { fontSize: 27, fontWeight: '900', letterSpacing: -0.8 },
    aboutSubtitle: { color: theme.muted, fontSize: 12, marginTop: 3 },
    aboutDivider: { height: 1, width: '100%', backgroundColor: theme.border, marginVertical: 23 },
    aboutEyebrow: { color: theme.muted, fontSize: 10, fontWeight: '800', letterSpacing: 1.2 },
    aboutName: { color: theme.text, fontSize: 23, fontWeight: '900', marginTop: 8 },
    aboutRole: { color: theme.muted, fontSize: 12, marginTop: 4 },
    aboutContact: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 20,
      paddingHorizontal: 18,
      paddingVertical: 12,
      borderRadius: 14,
      backgroundColor: theme.chip,
    },
    aboutPhoneIcon: { color: theme.purple, fontSize: 17, marginRight: 10 },
    aboutPhone: { color: theme.text, fontSize: 15, fontWeight: '800', letterSpacing: 0.3 },
    copyright: { color: theme.muted, fontSize: 10, marginTop: 24, textAlign: 'center' },
  });
}
