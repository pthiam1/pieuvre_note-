export type Tab = 'Agenda' | 'Livraisons' | 'Chantiers' | 'Relais';
export type PlaceKind = 'chantier' | 'relais';

export type Place = {
  id: number;
  name: string;
  address: string;
  contact: string;
  phone: string;
  kind: PlaceKind;
};

export type Delivery = {
  id: number;
  date: string;
  destinationType: string;
  destinationId: number | null;
  destinationName: string;
  address: string;
  covers: number | null;
  plans: number | null;
  notes: string;
};

export type AppTheme = {
  background: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  muted: string;
  border: string;
  purple: string;
  orange: string;
  chip: string;
  chipText: string;
};
