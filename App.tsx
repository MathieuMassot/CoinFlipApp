import React, { useState } from 'react'; 
import { View, Text, Button, FlatList, Switch, StyleSheet, TouchableOpacity } from 'react-native';

const CoinFlipApp = () => {
  const [numLancers, setNumLancers] = useState(0); // Nombre de lancers choisis
  const [results, setResults] = useState([]); // Résultats des lancers
  const [doubleCoin, setDoubleCoin] = useState(false); // Activer/Désactiver le double lancer

  // Fonction pour simuler un lancer de pièce
  const flipCoin = () => (Math.random() < 0.5 ? 'Win' : 'Lose');

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
  const StyledButton = ({ title, onPress }) => (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Coin Flip Simulator</Text>
      <Text style={styles.subtitle}>©Rye_Smut</Text>

      <Text style={styles.counterText}>Nombre de lancers : {numLancers}</Text>
      
      {/* Conteneur pour aligner les deux boutons sur une seule ligne */}
      <View style={styles.buttonRow}>
        <StyledButton title="Ajouter un lancer" onPress={() => setNumLancers(numLancers + 1)} />
        <StyledButton title="Retirer un lancer" onPress={() => setNumLancers(numLancers > 0 ? numLancers - 1 : 0)} />
      </View>

      <StyledButton title="Réinitialiser" onPress={() => setResults([])} />

      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Lancer deux pièces à la fois</Text>
        <Switch value={doubleCoin} onValueChange={() => setDoubleCoin(!doubleCoin)} />
      </View>

      <StyledButton title="Lancer les pièces" onPress={handleLancers} />
      <StyledButton title="Lancer jusqu'à un Lose" onPress={handleLancersUntilLose} />

      <FlatList
        data={results}
        renderItem={({ item }) => (
          <Text style={[styles.resultText, item.result === 'Win' ? styles.winText : styles.loseText]}>
            {item.text}
          </Text>
        )}
        keyExtractor={(item, index) => index.toString()}
      />
    </View>
  );

};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#34495e',
  },
  subtitle: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 30,
    color: '#7f8c8d',
  },
  counterText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 10,
    color: '#2c3e50',
  },
  button: {
    backgroundColor: '#3498db',
    padding: 15,
    marginVertical: 10,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#2c3e50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  buttonRow: {
    flexDirection: 'row',  // Permet d'aligner les boutons en ligne
    justifyContent: 'space-between',  // Espace entre les boutons
    marginVertical: 10,  // Espace vertical pour aérer un peu
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 15,
    paddingHorizontal: 20,
  },
  switchLabel: {
    fontSize: 16,
    color: '#34495e',
  },
  resultText: {
    fontSize: 20,
    textAlign: 'center',
    marginVertical: 5,
  },
  winText: {
    color: 'green',
    fontWeight: 'bold',
  },
  loseText: {
    color: 'red',
    fontWeight: 'bold',
  },
});

export default CoinFlipApp;