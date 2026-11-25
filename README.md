# Pieuvre Note

Application mobile React Native avec Expo et TypeScript pour organiser les livraisons de pieuvres électriques.

## Aperçus de l'application

<p align="center">
  <img src="./aper%C3%A7u/page_agenda.jpg" alt="Écran Agenda" width="190" />
  <img src="./aper%C3%A7u/page_livraisons.jpg" alt="Liste des livraisons" width="190" />
  <img src="./aper%C3%A7u/page_chantiers.jpg" alt="Liste des chantiers" width="190" />
</p>
<p align="center">
  <img src="./aper%C3%A7u/page_site_relais.jpg" alt="Sites de relais" width="190" />
  <img src="./aper%C3%A7u/page_info.jpg" alt="Page À propos" width="190" />
</p>

## Fonctionnalités incluses
- Agenda du lundi au vendredi avec sélection de la journée.
- Création et consultation des livraisons.
- Type de destination : chantier ou site de relais.
- Quantité de couvercles et de plans (champ vide = non renseigné).
- Fiches chantiers et sites de relais avec adresse, contact et téléphone.
- Recherche et suggestions de destinations enregistrées pendant la saisie d'une livraison.
- Recherche de chantiers par nom, adresse ou contact.
- Modification des fiches de chantiers et de sites de relais.
- Consultation du contact du chantier depuis une livraison et modification des livraisons existantes.
- Détails d'une livraison accessibles en touchant sa carte, avec actions pour copier ou appeler le contact.
- Mode jour/nuit avec mémorisation du choix sur l'appareil.
- Suppression des fiches et livraisons.
- Base SQLite locale persistante : aucune connexion Internet nécessaire pour utiliser les données.
- Page « À propos » avec les informations du développeur et le copyright, accessible depuis le bouton « i » de l'en-tête.

## Prérequis
- Node.js 22.13 ou plus récent (SDK Expo 58).
- npm.
- Android Studio / émulateur Android ou l'application Expo Go sur téléphone.
- Pour compiler iOS localement : macOS avec Xcode.

## Installation
```bash
npm install
npx expo install --fix
npx expo start
```
Scanne le QR code avec Expo Go ou lance un émulateur Android avec `a`.

## Structure
- `App.tsx` : initialisation du fournisseur SQLite et de l'écran principal.
- `src/screens/` : écran principal, navigation et formulaires.
- `src/components/` : composants réutilisables (champs, suggestions, cartes et états vides).
- `src/database.ts` : initialisation des tables SQLite.
- `src/theme.ts` et `src/utils/` : couleurs et fonctions utilitaires.
- `src/types.ts` : types TypeScript partagés.
- `app.json` : configuration Expo Android/iOS.
- `package.json` : dépendances et scripts.
- SQLite : fichier `pieuvre-note.db` conservé sur l'appareil.

## Informations développeur
Développé par Papa Thiam — 0752834362.

## À savoir
Cette première version est un socle fonctionnel. Elle ne synchronise pas les données entre plusieurs téléphones : les données restent sur l'appareil. Pense à prévoir une fonction d'export/sauvegarde avant une utilisation en production.
