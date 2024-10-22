# Coin Flip App


## Description
*Marre de perdre ton temps à lancer 300 pièces dans une partie ? Utilise **CoinFlipApp** et laisse la magie des flips faire le boulot à ta place !*
**Coin Flip App** est une application mobile conçue pour simuler des lancers de pièces, spécifiquement pensée pour les joueurs de *Magic: The Gathering*. Cette application est particulièrement utile pour les decks qui reposent sur des mécaniques de lancers de pièces, comme les decks utilisant **Yusri, Fortune’s Flame**, **Okaun, Eye of Chaos**, ou **Zndrsplt, Eye of Wisdom**. Elle prend également en charge le **Pouce de Krark** pour le double lancer.

## Fonctionnalités principales :
- **Lancer simple ou double** : Simulez un lancer de pièce avec ou sans le **Pouce de Krark**. Si un seul des deux résultats est "Win", le lancer est considéré comme un succès.
- **Résultats visuels** :
  - *Win* s'affiche en vert (succès).
  - *Lose* s'affiche en rouge (échec).
- **Arrêt au premier échec** : Une option pour effectuer des lancers de pièces jusqu'à obtenir un "Lose", pratique pour des mécaniques où un seul échec met fin à une chaîne de succès (comme pour **Okaun, Eye of Chaos** ou **Zndrsplt, Eye of Wisdom**).
- **Gestion des lancers** : Ajoutez ou retirez des lancers à volonté et réinitialisez les résultats en un clic.

## Pourquoi utiliser Coin Flip App pour Magic: The Gathering ?
Cette application est spécifiquement conçue pour répondre aux besoins des joueurs de decks orientés vers les mécaniques de lancers de pièces dans *Magic: The Gathering*. Elle offre une solution rapide et claire pour effectuer plusieurs lancers en un minimum de temps, ce qui est particulièrement utile dans des parties avec des cartes comme :

## Technologies utilisées
- **React Native** : Framework principal pour le développement de l'application.
- **JavaScript (ES6)** : Langage utilisé pour l'ensemble de la logique de l'application.
- **React Hooks** : Utilisation des hooks (`useState`, `useEffect`, etc.) pour la gestion de l'état et les effets dans les composants fonctionnels.
- **React Native Sound** : Bibliothèque pour jouer des fichiers audio locaux dans l'application.
- **Gradle** : Outil de build utilisé pour gérer les dépendances et compiler l'application Android.
- **Android SDK** : Environnement de développement pour construire et tester l'application sur Android.
- **Git** : Système de contrôle de version pour gérer le code source.

## Installation

Pour exécuter cette application localement :

1. Clonez le projet :

    ```bash
    git clone https://github.com/MathieuMassot/CoinFlipApp.git
    cd CoinFlipApp
    ```

2. Installez les dépendances :

    ```bash
    npm install
    ```

3. Exécutez l'application sur un émulateur ou appareil physique :

    ```bash
    npx react-native run-android
    ```

## Installation

### Prérequis

- Node.js (version X ou supérieure) : [télécharger Node.js](https://nodejs.org/)
- npm (généralement installé avec Node.js) ou Yarn
- Android Studio (pour configurer un émulateur Android) ou un appareil physique Android

### Exécuter l'application localement

1. Clonez le projet :

    ```bash
    git clone https://github.com/MathieuMassot/CoinFlipApp.git
    cd CoinFlipApp
    ```

2. Installez les dépendances :

    ```bash
    npm install
    ```

3. Connectez un appareil Android ou lancez un émulateur via Android Studio.

4. Exécutez l'application sur l'appareil ou l'émulateur :

    ```bash
    npx react-native run-android
    ```

## Installation de l'APK

Pour installer l'APK directement sur votre appareil Android :

1. Générer le fichier APK avec la commande :

    ```bash
    cd android
    ./gradlew assembleRelease
    ```

2. Le fichier APK sera généré dans :

    ```bash
    android/app/build/outputs/apk/release/app-release.apk
    ```

3. Activez l'installation à partir de sources inconnues sur votre téléphone Android. Allez dans **Paramètres > Sécurité > Sources inconnues** et activez cette option.

4. Transférez le fichier APK sur votre appareil Android et ouvrez-le pour l'installer.
   

## Auteur
Mathieu "Rye Smut" Massot

=======
## Licence
Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails.
