import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import Header from '../components/Header';

const INITIAL_PAIRS = [
  { id: '1', symbol: 'EUR / USD', price: 1.0852, change: 0.12, isUp: true },
  { id: '2', symbol: 'GBP / USD', price: 1.2645, change: -0.08, isUp: false },
  { id: '3', symbol: 'USD / JPY', price: 151.42, change: 0.34, isUp: true },
];

export default function DashboardScreen({ navigation }) {
  const [forexPairs, setForexPairs] = useState(INITIAL_PAIRS);

  useEffect(() => {
    const interval = setInterval(() => {
      setForexPairs((prev) => prev.map((pair) => {
        const movement = (Math.random() - 0.5) * 0.002;
        const newPrice = pair.price + movement;
        return { ...pair, price: parseFloat(newPrice.toFixed(4)), isUp: movement >= 0 };
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <FlatList
        data={forexPairs}
        contentContainerStyle={{ padding: 20 }}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Trade', { pair: item })}>
            <Text style={styles.symbol}>{item.symbol}</Text>
            <Text style={[styles.price, { color: item.isUp ? '#00FF87' : '#FF3B30' }]}>{item.price}</Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  card: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#111', padding: 20, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#1a1a2e' },
  symbol: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  price: { fontSize: 16, fontWeight: 'bold' },
});