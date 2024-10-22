/* eslint-disable react/no-unstable-nested-components */
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, Switch, StyleSheet, TouchableOpacity, ImageBackground, Image, Animated } from 'react-native';
import Sound from 'react-native-sound'; // Importer react-native-sound
import * as Animatable from 'react-native-animatable'; // Pour l'animation d'image

const CoinFlipApp = () => {
  const [numLancers, setNumLancers] = useState(0); // Nombre de lancers choisis
  const [results, setResults] = useState([]); // Résultats des lancers
  const [doubleCoin, setDoubleCoin] = useState(false); // Activer/Désactiver le double lancer
  const [showSecret, setShowSecret] = useState(false); // Pour l'image secrète
  const animationValue = new Animated.Value(0); // Animation de zoom

  const laughSound = useRef(null);

  useEffect(() => {
    // Charger le son du rire
    laughSound.current = new Sound('laugh.mp3', Sound.MAIN_BUNDLE, (error) => {
      if (error) {
        console.log('Erreur lors du chargement du son', error);
      }
    });

    // Nettoyage du son à la fin
    return () => {
      if (laughSound.current) {
        laughSound.current.release();
      }
    };
  }, []);

  // Fonction pour simuler un lancer de pièce
  const flipCoin = () => (Math.random() < 0.5 ? 'Win' : 'Lose');

    // Fonction pour vérifier si tous les résultats sont "Win"
    const checkForSecret = (newResults) => {
      if (numLancers === 5 && newResults.every(result => result.result === 'Win')) {
        triggerSecretFeature();
      }
    };

      // Fonction pour gérer l'affichage du "secret"
      const triggerSecretFeature = () => {
        setShowSecret(true);

      // Jouer le son du rire à partir de laughSound.current
      if (laughSound.current) {
        laughSound.current.play((success) => {
          if (!success) {
            console.log('Erreur lors de la lecture du son');
          }
        });
      }

    // Lancer l'animation de zoom
    Animated.timing(animationValue, {
      toValue: 1,
      duration: 5000, // Durée de l'animation
      useNativeDriver: true,
    }).start(() => {
      // Réinitialiser après l'animation
      setShowSecret(false);
      animationValue.setValue(0);
    });
  };

  // Fonction pour lancer les pièces
  const handleLancers = () => {
    const newResults = [];

    for (let i = 0; i < numLancers; i++) {
      if (doubleCoin) {
        const result1 = flipCoin();
        const result2 = flipCoin();
        const finalResult = (result1 === 'Win' || result2 === 'Win') ? 'Win' : 'Lose';
        newResults.push({ text: `Lancer ${i + 1}: ${finalResult} (${result1} & ${result2})`, result: finalResult });
      } else {
        const result = flipCoin();
        newResults.push({ text: `Lancer ${i + 1}: ${result}`, result });
      }
    }

    setResults(newResults);
    checkForSecret(newResults); // Vérifie la condition secrète
  };

  // Fonction pour lancer jusqu'à obtenir un "Lose"
  const handleLancersUntilLose = () => {
    const newResults = [];
    let i = 0;
    let lost = false;

    while (!lost) {
      i++;
      let finalResult;

      if (doubleCoin) {
        const result1 = flipCoin();
        const result2 = flipCoin();
        finalResult = (result1 === 'Win' || result2 === 'Win') ? 'Win' : 'Lose';
        newResults.push({ text: `Lancer ${i}: ${finalResult} (${result1} & ${result2})`, result: finalResult });
      } else {
        const result = flipCoin();
        finalResult = result;
        newResults.push({ text: `Lancer ${i}: ${result}`, result });
      }

      if (finalResult === 'Lose') {
        lost = true;
      }
    }

    setResults(newResults);
  };

  // Bouton stylisé
  const StyledButton = ({ title, onPress, disabled }) => (
    <TouchableOpacity
      style={[styles.button, disabled && styles.buttonDisabled]}
      onPress={!disabled ? onPress : null}
      disabled={disabled}
    >
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Image de fond */}
      <ImageBackground
        source={{ uri: 'https://i.pinimg.com/originals/7a/91/ae/7a91ae203093e855a79cee9d8e45e41c.png' }}  // Remplacer par l'image de fond
        style={styles.background}
      >
        {/* Overlay pour améliorer la lisibilité */}
        <View style={styles.overlay} />

        {/* Contenu principal */}
        <View style={styles.content}>
          <Text style={styles.title}>Coin Flip Simulator</Text>
          <Text style={styles.subtitle}>©Rye_Smut</Text>
          <Text style={styles.counterText}>Nombre de lancers : {numLancers}</Text>

          {/* Ligne des boutons pour ajouter/retirer des lancers */}
          <View style={styles.buttonRow}>
            <StyledButton
              title="-"
              onPress={() => setNumLancers(numLancers > 0 ? numLancers - 1 : 0)}
            />
            <StyledButton
              title="+"
              onPress={() => setNumLancers(numLancers + 1)}
            />
          </View>

          {/* Bouton pour réinitialiser les résultats */}
          <StyledButton
            title="Réinitialiser"
            onPress={() => setResults([])}
          />

          {/* Interrupteur pour activer/désactiver le Pouce de Krark */}
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Pouce de Krark</Text>
            <Switch
              value={doubleCoin}
              onValueChange={() => setDoubleCoin(!doubleCoin)}
              thumbColor={doubleCoin ? '#1abc9c' : '#f39c12'}
              trackColor={{ false: '#ecf0f1', true: '#2ecc71' }}
            />
          </View>

          {/* Boutons pour lancer les pièces et lancer jusqu'à un "Lose" */}
          <StyledButton
            title="Lancer les pièces"
            onPress={handleLancers}
            disabled={numLancers === 0}  // Désactiver si numLancers est à 0
          />
          <StyledButton
            title="Lancer jusqu'à un Lose"
            onPress={handleLancersUntilLose}
          />

          {/* Liste des résultats des lancers */}
          <FlatList
            data={results}
            renderItem={({ item }) => (
              <Text
                style={[
                  styles.resultText,
                  item.result === 'Win' ? styles.winText : styles.loseText,
                ]}
              >
                {item.text}
              </Text>
            )}
            keyExtractor={(item, index) => index.toString()}
          />
          {/* Animation secrète */}
          {showSecret && (
            <Animated.View style={[styles.secretContainer, { transform: [{ scale: animationValue }] }]}>
              <Image
                source={{ uri: 'https://cdn11.bigcommerce.com/s-641uhzxs7j/images/stencil/1280x1280/products/320053/383013/AMH260ns__05394.1643242659.jpg' }} // Remplace par ton image
                style={styles.secretImage}
              />
            </Animated.View>
          )}
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#f5f5f5', // Fond par défaut si l'image ne se charge pas
  },
  background: {
    flex: 1,
    resizeMode: 'cover', // Assure que l'image couvre tout l'écran
    justifyContent: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Couche semi-transparente (noir à 50%)
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 2,
    color: '#ecf0f1', // Texte blanc pour contraster avec le fond coloré
  },
  subtitle: {
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#ecf0f1', // Texte blanc pour contraster avec le fond coloré
  },
  counterText: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 15,
    color: '#ecf0f1',
  },
  button: {
    backgroundColor: '#2980b9',
    paddingVertical: 15,
    paddingHorizontal: 30,  // Rendre les boutons plus larges
    marginVertical: 5,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#2c3e50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
  },
  buttonDisabled: {
    backgroundColor: '#95a5a6',  // Couleur grise pour les boutons désactivés
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Centrer l'interrupteur
    marginVertical: 15,
  },
  switchLabel: {
    fontSize: 18,
    color: '#ecf0f1',
    marginRight: 10, // Un petit espace entre le texte et l'interrupteur
  },
  resultText: {
    fontSize: 18,
    textAlign: 'center',
    marginVertical: 3,
    color: '#ecf0f1',  // Texte en blanc pour plus de lisibilité
  },
  winText: {
    color: '#2ecc71', // Vert pour les victoires
    fontWeight: 'bold',
  },
  loseText: {
    color: '#e74c3c', // Rouge pour les défaites
    fontWeight: 'bold',
  },
   // Styles pour l'animation secrète
   secretContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Fond semi-transparent
  },
  secretImage: {
    width: 200,
    height: 200,
  },
});


export default CoinFlipApp;
