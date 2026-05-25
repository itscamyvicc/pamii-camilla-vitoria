// Desenhar o formulário de cadastro, controlar o que o usuário digita e enviar tudo para o banco de dados.
import { useState } from "react";
import { useRouter } from "expo-router";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Platform, KeyboardAvoidingView, ScrollView, Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { cadastrarUsuario } from "../services/authService";

const PRIMARY = "#BC405E";
const PRIMARY_DARK = "#5A283E";
const BG = "#F9F9EC";
const TEXT = "#5A283E";

const INTERESSES_OPCOES = [
  "Tecnologia", "Design", "Música", "Viagens", "Esportes",
  "Fotografia", "Livros", "Jogos", "Culinária", "Arte",
  "Cinema", "Moda", "Natureza", "Dança", "Idiomas",
];

// Coleta as informações do usuário (Estados Locais).
export default function Cadastro() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [interessesSelecionados, setInteressesSelecionados] = useState<string[]>([]); // Em vez de guardar apenas um texto, guarda uma array de interesses selecionados.
  const [loading, setLoading] = useState(false);  // Estado booleano para saber se o app está salvando os dados do usuário.

  function toggleInteresse(interesse: string) { // Faz as tags funcionarem como um botão "liga" e "desliga" para selecionar ou desmarcar os interesses do usuário.
    setInteressesSelecionados((prev) => // Muda de cor para o usuário saber se foi selecionado ou não.
      prev.includes(interesse)
        ? prev.filter((i) => i !== interesse)
        : [...prev, interesse]
    );
  }

  async function handleCadastro() {   // Executa um passo a passo de segurança antes de "falar" com o Firebase.
    if (!nome || !email || !senha) {
      Alert.alert("Atenção", "Preencha todos os campos.");
      return;
    }
    if (interessesSelecionados.length === 0) {
      Alert.alert("Atenção", "Selecione pelo menos um interesse.");
      return;
    }

    setLoading(true);
    const result = await cadastrarUsuario(nome, email, senha, interessesSelecionados);
    setLoading(false);

    if (result.success) {
      router.replace("/home");
    } else {
      Alert.alert("Erro", result.error);
    }
  }

  return (
    <KeyboardAvoidingView   // A tela sobe automaticamente quando teclado do celular abre.
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView   // Permite que a tela seja rolada para baixo caso o celular seja pequeno e o formulário não caiba inteiro.
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View style={styles.logoBox}>
            <Ionicons name="heart" size={40} color="#fff" />
          </View>
          <Text style={styles.title}>Criar conta</Text>
          <Text style={styles.subtitle}>Junte-se ao MatchConnect</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputWrapper}>
            <Ionicons name="person-outline" size={20} color="#FFA79F" style={styles.inputIcon} />
            <TextInput
              placeholder="Nome completo"
              placeholderTextColor="#FFA79F"
              value={nome}
              onChangeText={setNome}
              style={styles.input}
            />
          </View>

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
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor="#FFA79F"
              value={senha}
              onChangeText={setSenha}
              secureTextEntry
              style={styles.input}
            />
          </View>

          <Text style={styles.interessesLabel}>Seus interesses</Text>
          <View style={styles.interessesWrap}>
            {INTERESSES_OPCOES.map((interesse) => {
              const selecionado = interessesSelecionados.includes(interesse);
              return (
                <TouchableOpacity
                  key={interesse}
                  style={[styles.interesseTag, selecionado && styles.interesseTagSelecionado]}
                  onPress={() => toggleInteresse(interesse)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.interesseText, selecionado && styles.interesseTextSelecionado]}>
                    {interesse}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, loading && { opacity: 0.7 }]}
            onPress={handleCadastro}
            activeOpacity={0.85}
            disabled={loading}
          >
            <Ionicons name="sparkles" size={18} color="#fff" style={{ marginRight: 6 }} />
            <Text style={styles.primaryButtonText}>
              {loading ? "Cadastrando..." : "Cadastrar"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.replace("/login")}>
            <Text style={styles.loginText}>
              Já tem conta? <Text style={styles.loginLink}>Entrar</Text>
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

  hero: { alignItems: "center", paddingBottom: 32 },
  logoBox: {
    height: 80, width: 80, borderRadius: 24,
    backgroundColor: PRIMARY, alignItems: "center",
    justifyContent: "center", marginBottom: 20,
  },
  title: { fontSize: 28, fontWeight: "700", color: TEXT, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: PRIMARY, marginTop: 8 },

  form: {},
  inputWrapper: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#fff", borderRadius: 16,
    height: 56, paddingHorizontal: 16, marginBottom: 12,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: TEXT },

  interessesLabel: { fontSize: 15, fontWeight: "600", color: TEXT, marginBottom: 12, marginTop: 4 },
  interessesWrap: { flexDirection: "row", flexWrap: "wrap", marginBottom: 20 },
  interesseTag: {
    borderRadius: 99, paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 1.5, borderColor: "#FFA79F",
    marginRight: 8, marginBottom: 8, backgroundColor: "#fff",
  },
  interesseTagSelecionado: { backgroundColor: PRIMARY, borderColor: PRIMARY },
  interesseText: { fontSize: 13, color: TEXT },
  interesseTextSelecionado: { color: "#fff", fontWeight: "600" },

  primaryButton: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    backgroundColor: PRIMARY, borderRadius: 16, height: 56, marginBottom: 16,
  },
  primaryButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },

  loginText: { textAlign: "center", fontSize: 13, color: PRIMARY },
  loginLink: { color: PRIMARY_DARK, fontWeight: "600" },
});