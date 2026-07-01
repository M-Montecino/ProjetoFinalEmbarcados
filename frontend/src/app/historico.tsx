import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, FlatList, ActivityIndicator, RefreshControl } from "react-native";

import { Button } from "@/components/Button";

type LogItem = {
  id: number;
  uid: string;
  status: string;
  timestamp: string;
};

export default function Historico() {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function loadHistory() {
    try {
      setLoading(true);
      const res = await fetch("http://192.168.0.119:5000/history");
      const data = await res.json();
      setLogs(data || []);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHistory();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Histórico de Cartões</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#F4F6F8" />
      ) : (
        <FlatList
          data={logs}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <Text style={styles.itemText}>{item.timestamp} — {item.uid} — {item.status}</Text>
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 24 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={async () => {
                setRefreshing(true);
                await loadHistory();
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
    fontSize: 14,
  },
});
