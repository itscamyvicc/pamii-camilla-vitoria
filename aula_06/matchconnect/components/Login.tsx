import { useState } from "react";
import { useRouter } from "expo-router";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Platform, KeyboardAvoidingView, ScrollView, Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { loginUsuario } from "../services/authService";

const PRIMARY = "#BC405E";
const PRIMARY_DARK = "#5A283E";
const BG = "#F9F9EC";
const TEXT = "#5A283E";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert("Atenção", "Preencha email e senha.");
      return;
    }

    setLoading(true);
    try {
      const result = await loginUsuario(email, password);
      if (result.success) {
        router.replace("/home");
      } else {
        Alert.alert("Erro", result.error || "Email ou senha incorretos.");
      }
    } catch (error) {
      Alert.alert("Erro", "Não foi possível fazer login. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View style={styles.logoBox}>
            <Ionicons name="heart" size={40} color="#fff" />
          </View>
          <Text style={styles.title}>MatchConnect</Text>
          <Text style={styles.subtitle}>
            Conecte-se com pessoas que combinam com você
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={20} color="#FFA79F" style={styles.inputIcon} />
            <TextInput
              placeholder="seu@email.com"
              placeholderTextColor="#FFA79F"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={20} color="#FFA79F" style={styles.inputIcon} />
            <TextInput
              placeholder="Sua senha"
              placeholderTextColor="#FFA79F"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.input}
            />
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            activeOpacity={0.85}
            disabled={loading}
          >
            <Ionicons name="sparkles" size={18} color="#fff" style={{ marginRight: 6 }} />
            <Text style={styles.primaryButtonText}>
              {loading ? "Entrando..." : "Entrar"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/cadastro")}>
            <Text style={styles.cadastroText}>
              Não tem conta? <Text style={styles.cadastroLink}>Cadastre-se</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 60, paddingBottom: 24 },

  hero: { alignItems: "center", paddingBottom: 36 },
  logoBox: {
    height: 80, width: 80, borderRadius: 24,
    backgroundColor: PRIMARY, alignItems: "center",
    justifyContent: "center", marginBottom: 20,
  },
  title: { fontSize: 28, fontWeight: "700", color: TEXT, letterSpacing: -0.5, textAlign: "center" },
  subtitle: { fontSize: 14, color: PRIMARY, textAlign: "center", marginTop: 8, lineHeight: 20 },

  form: {},
  inputWrapper: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#fff", borderRadius: 16,
    height: 56, paddingHorizontal: 16, marginBottom: 12,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: TEXT },

  primaryButton: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    backgroundColor: PRIMARY, borderRadius: 16, height: 56, marginBottom: 16,
  },
  primaryButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },

  cadastroText: { textAlign: "center", fontSize: 13, color: PRIMARY },
  cadastroLink: { color: PRIMARY_DARK, fontWeight: "600" },
});