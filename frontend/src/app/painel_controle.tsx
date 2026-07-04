import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Button } from "@/components/Button";

export default function PainelControle() {
  const [cadastroAtivo, setCadastroAtivo] = useState(false);

  async function fetchCadastroStatus() {
    try {
      const res = await fetch("http://192.168.0.119:5000/cadastro/status");
      const data = await res.json();
      setCadastroAtivo(data.cadastro_ativo);
    } catch (e) {
      console.log("Erro ao carregar status do cadastramento:", e);
    }
  }

  async function toggleCadastro() {
    try {
      const res = await fetch("http://192.168.0.119:5000/cadastro/toggle", {
        method: "POST",
      });
      const data = await res.json();
      setCadastroAtivo(data.cadastro_ativo);
      Alert.alert(
        "Modo Cadastramento",
        data.cadastro_ativo
          ? "Modo de cadastramento ativado!"
          : "Modo de cadastramento desativado!"
      );
    } catch (e) {
      console.log("Erro ao alterar modo cadastramento:", e);
      Alert.alert("Erro", "Erro ao conectar com o servidor.");
    }
  }

  useEffect(() => {
    fetchCadastroStatus();
  }, []);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.select({ ios: "padding", android: "height" })}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
            <Image source={require("@/assets/2.jpg")} style={styles.image} />

            <Text style={styles.title}>Bem-Vindo!</Text>
            <Text style={styles.subtitle}>Acessos de Administrador</Text>
            <Button
              label={cadastroAtivo ? "Desativar Modo Cadastramento" : "Ativar Modo Cadastramento"}
              onPress={toggleCadastro}
              style={cadastroAtivo ? { backgroundColor: "#4caf50" } : undefined}
            />
            <Button
              label="Cartões Cadastrados"
              onPress={() => router.push("/cartoes_cadastrados")}
            />
            <Button
              label="Históricos"
              onPress={() => router.push("/historico")}
            />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
container: {
  flex: 1,
  backgroundColor: "#22242a",
  justifyContent: "center",
  padding: 24,
},

card: {
  backgroundColor: "#FFFFFF",
  padding: 24,
  borderRadius: 16,
  shadowColor: "#000",
  shadowOpacity: 0.1,
  shadowRadius: 8,
  elevation: 4,
},

image: {
  width: 120,
  height: 120,
  alignSelf: "center",
  marginBottom: 24,
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

forms: {
  gap: 12,
},
})