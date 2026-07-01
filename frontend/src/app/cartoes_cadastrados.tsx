import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, FlatList, ActivityIndicator, RefreshControl } from "react-native";

import { Button } from "@/components/Button";

export default function CartoesCadastrados() {
  const [cards, setCards] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function loadCards() {
    try {
      setLoading(true);
      const res = await fetch("http://192.168.0.119:5000/cards");
      const data = await res.json();
      setCards(data.cards || []);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCards();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cartões Cadastrados</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#F4F6F8" />
      ) : (
        <FlatList
          data={cards}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <Text style={styles.itemText}>{item}</Text>
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 24 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={async () => {
                setRefreshing(true);
                await loadCards();
                setRefreshing(false);
              }}
              tintColor="#F4F6F8"
            />
          }
        />
      )}

      <Button label="Voltar" onPress={() => router.back()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#22242a",
    padding: 24,
  },
  title: {
    fontSize: 28,
    color: "#F4F6F8",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  item: {
    backgroundColor: "#2e3036",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  itemText: {
    color: "#F4F6F8",
    fontSize: 16,
  },
});
