import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity, Alert, Platform, TextInput } from "react-native";

import { API_URL } from "@/config/api";
import { Button } from "@/components/Button";

type CardItem = {
  uid: string;
  name: string;
};

export default function CartoesCadastrados() {
  const [cards, setCards] = useState<CardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function loadCards() {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/cards`);
      const data = await res.json();
      const normalizedCards = (data.cards || []).map((card: any) =>
        typeof card === "string"
          ? { uid: card, name: card }
          : { uid: card.uid, name: card.name || card.uid || "" }
      );
      setCards(normalizedCards);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  }

  async function saveCardName(uid: string, name: string) {
    try {
      const res = await fetch(`${API_URL}/cards/${encodeURIComponent(uid)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (data.status === "ok") {
        setCards((prev) => prev.map((card) => (card.uid === uid ? { ...card, name } : card)));
      } else {
        Alert.alert("Erro", "Não foi possível salvar o nome.");
      }
    } catch (e) {
      console.log(e);
      Alert.alert("Erro", "Erro ao conectar com o servidor.");
    }
  }

  async function confirmDeleteCard(uid: string) {
    try {
      const res = await fetch(`${API_URL}/cards/${encodeURIComponent(uid)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.status === "ok") {
        setCards((prev) => prev.filter((card) => card.uid !== uid));
      } else {
        Alert.alert("Erro", "Não foi possível excluir o cartão.");
      }
    } catch (e) {
      console.log(e);
      Alert.alert("Erro", "Erro ao conectar com o servidor.");
    }
  }

  function deleteCard(uid: string) {
    if (Platform.OS === "web") {
      if (window.confirm(`Tem certeza que deseja excluir o cartão ${uid}?`)) {
        confirmDeleteCard(uid);
      }
    } else {
      Alert.alert(
        "Excluir Cartão",
        `Tem certeza que deseja excluir o cartão ${uid}?`,
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Excluir", style: "destructive", onPress: () => confirmDeleteCard(uid) },
        ]
      );
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
          keyExtractor={(item) => item.uid}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <TextInput
                value={item.name}
                onChangeText={(text) =>
                  setCards((prev) => prev.map((card) => (card.uid === item.uid ? { ...card, name: text } : card)))
                }
                placeholder="Nome"
                placeholderTextColor="#8f949c"
                style={styles.input}
              />
              <View style={styles.actions}>
                <TouchableOpacity style={styles.saveButton} onPress={() => saveCardName(item.uid, item.name)}>
                  <Text style={styles.saveButtonText}>Salvar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButton} onPress={() => deleteCard(item.uid)}>
                  <Text style={styles.deleteButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
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
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: "#22242a",
    color: "#F4F6F8",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#444",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
  },
  saveButton: {
    backgroundColor: "#4caf50",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 8,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  deleteButton: {
    padding: 8,
  },
  deleteButtonText: {
    color: "#ff4d4d",
    fontSize: 18,
    fontWeight: "bold",
  },
});
