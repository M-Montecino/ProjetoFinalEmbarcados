import { router } from "expo-router";
import {
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
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
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