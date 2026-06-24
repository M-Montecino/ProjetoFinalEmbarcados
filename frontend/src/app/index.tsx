import { router } from "expo-router";
import { useState } from "react";
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
import { Input } from "@/components/Input";

export default function Index() {
  const [email, SetId] = useState("");
  const [password, SetPassword] = useState("");

  function handleSingIn() {
    if (!email.trim() || !password.trim()) {
      return Alert.alert("Entrar", "Favor preencher todos os campos");
    }

    const usuario = "admin";
    const senha = "123456";


  if (email === usuario && password === senha) {
    router.push("/painel_controle");
  } else {
    Alert.alert("Erro", "Usuário ou senha inválidos");
  }
}

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
          <Image source={require("@/assets/1.jpg")} style={styles.image} />

          <Text style={styles.title}>Entrar</Text>
          <Text style={styles.subtitle}>
            Acesse a conta mestre com ID e senha
          </Text>

          <View>
            <Input
              placeholder="ID"
              onChangeText={SetId}
            />

            <Input
              placeholder="Senha"
              secureTextEntry
              onChangeText={SetPassword}
            />

            <Button label="Entrar" onPress={handleSingIn} />
          </View>
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