import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, FlatList, ActivityIndicator, RefreshControl } from "react-native";

import { API_URL } from "@/config/api";
import { Button } from "@/components/Button";

type LogItem = {
  id: number;
  uid: string;
  status: string;
  name?: string;
  timestamp: string;
};

export default function Historico() {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function loadHistory() {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/history`);
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
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const displayName = item.name?.trim() || "Sem nome";
            return (
              <View style={styles.item}>
                <Text style={styles.nameText}>{displayName}</Text>
                <Text style={styles.uidText}>UID: {item.uid}</Text>
                <Text style={styles.statusText}>{item.status}</Text>
                <Text style={styles.timeText}>{item.timestamp}</Text>
              </View>
            );
          }}
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
  nameText: {
    color: "#F4F6F8",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  uidText: {
    color: "#9fb0c4",
    fontSize: 12,
    marginBottom: 4,
  },
  statusText: {
    color: "#cfd6df",
    fontSize: 14,
    marginBottom: 4,
  },
  timeText: {
    color: "#8f949c",
    fontSize: 12,
  },
});
