import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { Button } from "@/components/Button";

export default function Historico() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Histórico de Cartões</Text>
      <Text style={styles.subtitle}>A lista do histórico de entradas aparecerá aqui.</Text>
      <Button label="Voltar" onPress={() => router.back()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#22242a",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 28,
    color: "#F4F6F8",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    textAlign: "center",
    color: "#F4F6F8",
    marginBottom: 24,
  },
});
