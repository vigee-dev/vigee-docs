# Setup React Native

Guide de configuration et commandes pour le développement React Native avec Expo.

::: warning Package Manager
Utiliser **YARN** et non PNPM pour les projets Expo.
:::

## Prérequis

- Node.js 18+
- Yarn
- Compte Expo (pour les builds EAS)
- Xcode (pour iOS)
- Android Studio (pour Android)

## Configuration

Le fichier `.env.local` doit être présent à la racine du projet.

## Développement

### Lancer le serveur de développement

```bash
npx expo start
```

Lance le serveur de développement Metro et ouvre l'interface développeur dans votre navigateur. Affiche un QR code pour tester sur mobile.

Dans le terminal, appuyer sur :

```
› Press s │ switch to Expo Go
```

### Modes de développement

| Mode | Description |
|------|-------------|
| **Expo Go** | Lance directement depuis l'app Expo (téléchargeable sur les stores). Pas besoin de build. |
| **Development Build** | Nécessite d'avoir installé un build development. Permet de tester les fonctionnalités natives (Face ID, etc.). |

::: info Différence clé
Le **Development Build** permet d'utiliser les fonctionnalités natives (Face ID, notifications push, etc.) contrairement à Expo Go qui est limité aux fonctionnalités de base.
:::

## Builds de développement

### Android

```bash
eas build --platform android --local --profile development
```

Génère un **APK Android** installable directement sur le téléphone sans passer par les stores.

Avantages :
- Voir les changements en direct (hot reload)
- Utiliser les fonctionnalités natives Android
- Tester sur un vrai appareil

### iOS

```bash
eas build --platform ios --local --profile development
```

Génère une **app iOS** installable directement sur les appareils enregistrés.

Avantages :
- Voir les changements en direct (hot reload)
- Utiliser les fonctionnalités natives iOS (Face ID, etc.)
- Tester sur un vrai appareil

## Enregistrer un appareil iOS

Pour les builds de développement iOS, les appareils doivent être enregistrés :

1. Connectez-vous à [developer.apple.com](https://developer.apple.com)
2. Allez dans **"Certificates, Identifiers & Profiles"**
3. Section **"Devices"** → **"Register a New Device"**
4. Ajoutez le **nom** et l'**UDID** de l'appareil

::: tip Trouver l'UDID
Connectez l'iPhone à un Mac, ouvrez Finder, cliquez sur l'iPhone, puis cliquez sur les informations sous le nom de l'appareil pour révéler l'UDID.
:::

## Quand refaire un Development Build ?

::: danger Rebuild nécessaire
Un nouveau development build est nécessaire **à chaque fois** que l'on installe via `yarn` une nouvelle librairie Expo de fonctionnalité native.
:::

Exemples de librairies nécessitant un rebuild :
- `expo-camera`
- `expo-local-authentication` (Face ID)
- `expo-notifications`
- `expo-location`

## Builds de production

### Android

```bash
eas build --platform android --local --profile production
```

Génère un **AAB** (Android App Bundle) pour publication sur le Play Store.

### iOS

```bash
eas build --platform ios --local --profile production
```

Génère un **IPA** pour publication sur l'App Store.

## Publication sur les stores

### iOS

Utiliser **Transporter** (app Apple) pour uploader l'IPA sur App Store Connect.

### Android

Uploader directement l'AAB sur la **Google Play Console**.

## Récapitulatif des commandes

| Commande | Description |
|----------|-------------|
| `npx expo start` | Lance le serveur de développement |
| `eas build --platform android --local --profile development` | Build dev Android (APK) |
| `eas build --platform ios --local --profile development` | Build dev iOS |
| `eas build --platform android --local --profile production` | Build prod Android (AAB) |
| `eas build --platform ios --local --profile production` | Build prod iOS (IPA) |
