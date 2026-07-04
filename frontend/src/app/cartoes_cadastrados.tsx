import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity, Alert } from "react-native";


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

  async function deleteCard(uid: string) {
    Alert.alert(
      "Excluir Cartão",
      `Tem certeza que deseja excluir o cartão ${uid}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              const res = await fetch(`http://192.168.0.119:5000/cards/${uid}`, {
                method: "DELETE",
              });
              const data = await res.json();
              if (data.status === "ok") {
                setCards((prev) => prev.filter((c) => c !== uid));
              } else {
                Alert.alert("Erro", "Não foi possível excluir o cartão.");
              }
            } catch (e) {
              console.log(e);
              Alert.alert("Erro", "Erro ao conectar com o servidor.");
            }
          },
        },
      ]
    );
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
              <TouchableOpacity style={styles.deleteButton} onPress={() => deleteCard(item)}>
                <Text style={styles.deleteButtonText}>✕</Text>
              </TouchableOpacity>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemText: {
    color: "#F4F6F8",
    fontSize: 16,
    flex: 1,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  deleteButtonText: {
    color: "#ff4d4d",
    fontSize: 18,
    fontWeight: "bold",
  },
});
