import React, { useState } from 'react'; 
import { View, Text, Button, FlatList, Switch, StyleSheet } from 'react-native';

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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Coin Flip Simulator</Text>
      <Text style={styles.subtitle}>©Rye_Smut</Text>

      <Text>Nombre de lancers : {numLancers}</Text>
      <Button title="Ajouter un lancer" onPress={() => setNumLancers(numLancers + 1)} />
      <Button title="Retirer un lancer" onPress={() => setNumLancers(numLancers > 0 ? numLancers - 1 : 0)} />
      <Button title="Réinitialiser" onPress={() => setResults([])} />

      <View style={styles.switchContainer}>
        <Text>Lancer deux pièces à la fois</Text>
        <Switch value={doubleCoin} onValueChange={() => setDoubleCoin(!doubleCoin)} />
      </View>

      <Button title="Lancer les pièces" onPress={handleLancers} />
      <Button title="Lancer jusqu'à un Lose" onPress={handleLancersUntilLose} />

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
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 7,
  },
  subtitle: {
    fontSize: 10,
    fontWeight: 'normal',
    textAlign: 'center',
    marginBottom: 20,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  resultText: {
    fontSize: 18,
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
