// Tela de gerenciamento de conta do usuário.

import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Platform, ScrollView, Alert, ActivityIndicator, Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { doc, updateDoc, getDoc } from "firebase/firestore"; // O app pega esse link e salva no cadastro do usuário.
import { db } from "../config/firebase";
import { usuarioLogado, logoutUsuario, deletarConta } from "../services/authService";
import * as ImagePicker from "expo-image-picker";  // Quando o usuário clica na foto, o app abre a galeria do celular para ele escolher uma imagem (API REST).

const PRIMARY = "#BC405E";
const PRIMARY_DARK = "#5A283E";
const BG = "#F9F9EC";
const TEXT = "#5A283E";

// O Cloudinary (nuvem de hospedagem de imagens) armazena a foto e devolve um link de internet (URL).
const CLOUDINARY_CLOUD = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD!;
const CLOUDINARY_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_PRESET!;

const INTERESSES_OPCOES = [
  "Tecnologia", "Design", "Música", "Viagens", "Esportes",
  "Fotografia", "Livros", "Jogos", "Culinária", "Arte",
  "Cinema", "Moda", "Natureza", "Dança", "Idiomas",
];

// Função utilitária para gerar iniciais corretamente
function gerarIniciais(nome: string): string {
  if (!nome) return "?";
  return nome
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function Perfil() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [interesses, setInteresses] = useState<string[]>([]);
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingFoto, setUploadingFoto] = useState(false);

  useEffect(() => {   // Assim que o usuário abre a tela de perfil, o componente vai carregar as informações atuais dele.
    if (!usuarioLogado) {
      router.replace("/login");
      return;
    }
    setNome(usuarioLogado.nome_completo);
    setEmail(usuarioLogado.email);
    setInteresses(usuarioLogado.interesses);

    // Busca foto_url direto do Firestore (getDoc agora importado corretamente)
    getDoc(doc(db, "cadastroUsuario", usuarioLogado.id)).then((snap) => {
      if (snap.exists()) {
        const dados = snap.data();
        setFotoUrl(dados.foto_url || null);
        usuarioLogado!.foto_url = dados.foto_url || null;
      }
    });
  }, []);

  function toggleInteresse(interesse: string) {
    setInteresses((prev) =>
      prev.includes(interesse)
        ? prev.filter((i) => i !== interesse)
        : [...prev, interesse]
    );
  }

  async function handleEscolherFoto() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permissão necessária", "Permita o acesso à galeria para escolher uma foto.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (result.canceled) return;

    const uri = result.assets[0].uri;
    setUploadingFoto(true);

    try {
      const url = await uploadParaCloudinary(uri);
      setFotoUrl(url);

      await updateDoc (doc(db, "cadastroUsuario", usuarioLogado!.id), { // Ela vai lá na coleção do banco de dados, encontra o ID desse usuário e sobrescreve as informações antigas pelas novas.
        foto_url: url,
      });
      usuarioLogado!.foto_url = url;
    } catch (e) {
      Alert.alert("Erro", "Não foi possível enviar a foto. Tente novamente.");
    } finally {
      setUploadingFoto(false);
    }
  }

  async function uploadParaCloudinary(uri: string): Promise<string> {
    const data = new FormData();
    data.append("file", { uri, type: "image/jpeg", name: "foto.jpg" } as any);
    data.append("upload_preset", CLOUDINARY_PRESET);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`,
      { method: "POST", body: data }
    );
    const json = await res.json();
    if (!json.secure_url) throw new Error("Upload falhou");
    return json.secure_url;
  }

  async function handleAtualizar() {
    if (!nome || !email) {
      Alert.alert("Atenção", "Preencha nome e email.");
      return;
    }
    if (interesses.length === 0) {
      Alert.alert("Atenção", "Selecione pelo menos um interesse.");
      return;
    }
    setLoading(true);
    try {
      await updateDoc (doc(db, "cadastroUsuario", usuarioLogado!.id), { // Ela vai lá na coleção do banco de dados, encontra o ID desse usuário e sobrescreve as informações antigas pelas novas.
        nome_completo: nome,
        email,
        interesses,
      });
      if (usuarioLogado) {
        usuarioLogado.nome_completo = nome;
        usuarioLogado.email = email;
        usuarioLogado.interesses = interesses;
      }
      Alert.alert("Sucesso!", "Perfil atualizado com sucesso.");
    } catch (error) {
      Alert.alert("Erro", "Não foi possível atualizar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeletar() {
    Alert.alert(
      "Deletar conta",
      "Tem certeza? Esta ação não pode ser desfeita.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Deletar",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            const result = await deletarConta();
            setLoading(false);
            if (result.success) {
              router.replace("/login"); // Manda o usuário para a tela inicial.
            } else {
              Alert.alert("Erro", result.error);
            }
          },
        },
      ]
    );
  }

  function handleLogout() {
    logoutUsuario();
    router.replace("/login"); // Manda o usuário para a tela inicial.
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={TEXT} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meu Perfil</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color={PRIMARY} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Avatar */}
        <View style={styles.avatarWrapper}>
          <TouchableOpacity onPress={handleEscolherFoto} activeOpacity={0.8}>
            {fotoUrl ? (
              <Image source={{ uri: fotoUrl }} style={styles.avatarImg} />
            ) : (
              <View style={styles.avatar}>
                {/* Iniciais geradas corretamente: "Claudia" → "C", "Ana Lima" → "AL" */}
                <Text style={styles.avatarText}>
                  {gerarIniciais(nome)}
                </Text>
              </View>
            )}
            <View style={styles.cameraIcon}>
              {uploadingFoto ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="camera" size={16} color="#fff" />
              )}
            </View>
          </TouchableOpacity>
          <Text style={styles.fotoHint}>Toque para alterar a foto</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.label}>Nome completo</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="person-outline" size={20} color="#FFA79F" style={styles.inputIcon} />
            <TextInput
              value={nome}
              onChangeText={setNome}
              style={styles.input}
              placeholderTextColor="#FFA79F"
            />
          </View>

          <Text style={styles.label}>Email</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={20} color="#FFA79F" style={styles.inputIcon} />
            <TextInput
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              placeholderTextColor="#FFA79F"
            />
          </View>

          <Text style={styles.label}>Interesses</Text>
          <View style={styles.interessesWrap}>
            {INTERESSES_OPCOES.map((interesse) => {
              const selecionado = interesses.includes(interesse);
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
            onPress={handleAtualizar}
            activeOpacity={0.85}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="save-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
                <Text style={styles.primaryButtonText}>Salvar alterações</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeletar}
            activeOpacity={0.85}
            disabled={loading}
          >
            <Ionicons name="trash-outline" size={18} color={PRIMARY} style={{ marginRight: 6 }} />
            <Text style={styles.deleteButtonText}>Deletar conta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },

  header: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8,
  },
  backButton: {
    height: 44, width: 44, borderRadius: 22,
    backgroundColor: "#fff", alignItems: "center", justifyContent: "center",
    ...Platform.select({
      ios: { shadowColor: PRIMARY_DARK, shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
      android: { elevation: 3 },
    }),
  },
  headerTitle: { fontSize: 16, fontWeight: "600", color: TEXT },
  logoutButton: {
    height: 44, width: 44, borderRadius: 22,
    backgroundColor: "#fff", alignItems: "center", justifyContent: "center",
    ...Platform.select({
      ios: { shadowColor: PRIMARY_DARK, shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
      android: { elevation: 3 },
    }),
  },

  scroll: { paddingHorizontal: 24, paddingBottom: 40 },

  avatarWrapper: { alignItems: "center", paddingVertical: 24 },
  avatarImg: {
    height: 90, width: 90, borderRadius: 24,
    backgroundColor: "#FFA79F55",
  },
  avatar: {
    height: 90, width: 90, borderRadius: 24,
    backgroundColor: PRIMARY, alignItems: "center", justifyContent: "center",
  },
  avatarText: { fontSize: 32, fontWeight: "700", color: "#fff" },
  cameraIcon: {
    position: "absolute", bottom: -4, right: -4,
    height: 28, width: 28, borderRadius: 14,
    backgroundColor: PRIMARY, alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: BG,
  },
  fotoHint: { fontSize: 12, color: "#FFA79F", marginTop: 10 },

  form: {},
  label: { fontSize: 13, fontWeight: "600", color: TEXT, marginBottom: 8, marginTop: 4 },
  inputWrapper: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#fff", borderRadius: 16,
    height: 56, paddingHorizontal: 16, marginBottom: 16,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: TEXT },

  interessesWrap: { flexDirection: "row", flexWrap: "wrap", marginBottom: 24 },
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
    backgroundColor: PRIMARY, borderRadius: 16, height: 56, marginBottom: 12,
  },
  primaryButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },

  deleteButton: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    borderRadius: 16, height: 56,
    borderWidth: 2, borderColor: PRIMARY, backgroundColor: "#fff",
  },
  deleteButtonText: { color: PRIMARY, fontSize: 16, fontWeight: "600" },
});