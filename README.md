# Coin Flip App

## Description
**Coin Flip App** est une application mobile conçue pour simuler des lancers de pièces, spécifiquement pensée pour les joueurs de *Magic: The Gathering*. Cette application est particulièrement utile pour les decks qui reposent sur des mécaniques de lancers de pièces, comme les decks utilisant **Yusri, Fortune’s Flame**, **Okaun, Eye of Chaos**, ou **Zndrsplt, Eye of Wisdom**. Elle prend également en charge le double lancer pour des cartes comme **Pouce de Krark**.

## Fonctionnalités principales :
- **Lancer simple ou double** : Simulez un lancer de pièce avec ou sans le **Pouce de Krark**. Si un seul des deux résultats est "Win", le lancer est considéré comme un succès.
- **Résultats visuels** :
  - *Win* s'affiche en vert (succès).
  - *Lose* s'affiche en rouge (échec).
- **Arrêt au premier échec** : Une option pour effectuer des lancers de pièces jusqu'à obtenir un "Lose", pratique pour des mécaniques où un seul échec met fin à une chaîne de succès (comme pour **Okaun, Eye of Chaos** ou **Zndrsplt, Eye of Wisdom**).
- **Gestion des lancers** : Ajoutez ou retirez des lancers à volonté et réinitialisez les résultats en un clic.

## Pourquoi utiliser Coin Flip App pour Magic: The Gathering ?
Cette application est spécifiquement conçue pour répondre aux besoins des joueurs de decks orientés vers les mécaniques de lancers de pièces dans *Magic: The Gathering*. Elle offre une solution rapide et claire pour effectuer plusieurs lancers en un minimum de temps, ce qui est particulièrement utile dans des parties avec des cartes comme :

## Fonctionnalités futures
- **Sons interactifs** : Des effets sonores pour accompagner les succès ou échecs des lancers, pour une meilleure immersion.
- **Personnalisation visuelle** : Ajout d'animations et de styles spécifiques pour encore plus de fun.

## Technologies utilisées
- **React Native** : Framework principal pour le développement de l'application.
- **JavaScript (ES6)** : Langage utilisé pour l'ensemble de la logique de l'application.

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

## Installation de l'APK
Pour installer l'APK directement sur votre appareil Android :

1. Générer le fichier APK avec la commande :

    ```bash
    cd android
    ./gradlew assembleRelease
    ```

2. Transférez le fichier APK généré sur votre téléphone Android et installez-le.


## Auteur
Mathieu "Rye Smut" Massot

## Licence
Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails.
