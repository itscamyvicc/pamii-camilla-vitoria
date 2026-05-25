// Tela principal do app, onde o usuário vê a listagem de outros usuários e pode clicar para ir à tela de match.

import { useEffect, useState } from "react";  // Busca todos os usuários do Firebase.
import { useRouter } from "expo-router";
import {
  View, Text, TextInput, Image, TouchableOpacity,   // Card com botão clicável para ir a tela de match.
  ScrollView, StyleSheet, Platform, ActivityIndicator,  // Enquanto os dados são carregados, exibe a tela de loading.
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getUsuarios, FirebaseUser } from "../services/userService";
import { usuarioLogado } from "../services/authService";
import { calcMatch } from "../data/users";
const PRIMARY = "#BC405E";
const PRIMARY_DARK = "#5A283E";
const BG = "#F9F9EC";
const CARD = "#fff";
const TEXT = "#5A283E";
const TAG_BG = "#FFA79F33";
const TAG_TEXT = "#5A283E";

export default function Home() {
  const router = useRouter();
  const [usuarios, setUsuarios] = useState<FirebaseUser[]>([]);
  const [filtrados, setFiltrados] = useState<FirebaseUser[]>([]);
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);

  // Também filtra essa listagem para que o próprio usuário não apareça.
  useEffect(() => {
    async function carregar() {
      try {
        const dados = await getUsuarios();
        // Remove o próprio usuário logado da lista
        const semEuMesmo = dados.filter((u) => u.id !== usuarioLogado?.id);
        setUsuarios(semEuMesmo);
        setFiltrados(semEuMesmo);
      } catch (error) {
        console.error("Erro ao carregar usuários:", error);
      } finally {
        setLoading(false);
      }
    }
    carregar();
  }, []);

  function handleBusca(texto: string) {
    setBusca(texto);
    if (!texto.trim()) {
      setFiltrados(usuarios);
      return;
    }
    const termo = texto.toLowerCase();
    setFiltrados(
      usuarios.filter((u) =>
        u.interesses.some((i) => i.toLowerCase().includes(termo)) ||
        u.nome_completo.toLowerCase().includes(termo)
      )
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Descobrir pessoas</Text>
        <TouchableOpacity
          style={styles.perfilButton}
          onPress={() => router.push("/perfil")}  // Botão para ir à tela de chat do usuário que você deu match (navegador do Expo Router).
        >
          <Ionicons name="person-outline" size={22} color={TEXT} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchWrapper}>
        <Ionicons name="search-outline" size={20} color="#FFA79F" style={styles.searchIcon} />
        <TextInput  // Campo de busca.
          placeholder="Buscar por interesses..."
          placeholderTextColor="#FFA79F"
          style={styles.searchInput}
          value={busca}
          onChangeText={handleBusca}
        />
      </View>

      {/* Lista */}
      {loading ? (
        <View style={styles.loadingWrapper}>
          <ActivityIndicator size="large" color={PRIMARY} />
          <Text style={styles.loadingText}>Carregando pessoas...</Text>
        </View>
      ) : (
        <ScrollView   // Lista deslizável.
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        >
          {filtrados.length === 0 ? (
            <Text style={styles.emptyText}>Nenhuma pessoa encontrada.</Text>
          ) : (
            filtrados.map((u) => {
              const userAdaptado = {
                id: u.id,
                name: u.nome_completo,
                age: 0,
                bio: "",
                avatar: "",
                interests: u.interesses,
              };
              const logadoAdaptado = {
                id: usuarioLogado?.id || "",
                name: usuarioLogado?.nome_completo || "",
                age: 0,
                bio: "",
                avatar: "",
                interests: usuarioLogado?.interesses || [],
              };
              const { percentage } = calcMatch(logadoAdaptado, userAdaptado);  // Liga o usuário logado ao de outros usuários para calcular a porcentagem de match. Depois, vira um badge no perfil do usuário listado.


              return (
                <View key={u.id} style={styles.card}>
                  <View style={styles.avatarWrapper}>
                    <Image
                      source={{ uri: u.foto_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.nome_completo || "U")}&background=FFA79F&color=fff` }}
                      style={styles.avatar}
                    />
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{percentage}%</Text>
                    </View>
                  </View>

                  <View style={styles.info}>
                    <Text style={styles.name} numberOfLines={1}>
                      {u.nome_completo}
                    </Text>
                    <Text style={styles.bio} numberOfLines={1}>{u.email}</Text>
                    <View style={styles.tags}>
                      {u.interesses.slice(0, 2).map((interesse) => (
                        <View key={interesse} style={styles.tag}>
                          <Text style={styles.tagText}>{interesse}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.matchButton}
                    onPress={() => router.push(`/match/${u.id}`)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="sparkles" size={15} color="#fff" style={{ marginRight: 4 }} />
                    <Text style={styles.matchButtonText}>Match</Text>
                  </TouchableOpacity>
                </View>
              );
            })
          )}
        </ScrollView>   // Lista deslizável.
      )}
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
  title: { fontSize: 22, fontWeight: "700", color: TEXT, marginTop: 2 },
  perfilButton: {
    height: 44, width: 44, borderRadius: 22,
    backgroundColor: CARD, alignItems: "center", justifyContent: "center",
    ...Platform.select({
      ios: { shadowColor: PRIMARY_DARK, shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
      android: { elevation: 3 },
    }),
  },

  searchWrapper: {
    marginHorizontal: 24, marginBottom: 16,
    flexDirection: "row", alignItems: "center",
    backgroundColor: CARD, borderRadius: 16,
    paddingHorizontal: 14, height: 48,
    ...Platform.select({
      ios: { shadowColor: PRIMARY_DARK, shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
      android: { elevation: 2 },
    }),
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: TEXT },

  loadingWrapper: { flex: 1, alignItems: "center", justifyContent: "center" },
  loadingText: { marginTop: 12, fontSize: 14, color: PRIMARY },
  emptyText: { textAlign: "center", color: PRIMARY, marginTop: 40, fontSize: 14 },

  list: { paddingHorizontal: 24, paddingBottom: 24 },

  card: {
    backgroundColor: CARD, borderRadius: 24, padding: 14,
    flexDirection: "row", alignItems: "center", marginBottom: 12,
    ...Platform.select({
      ios: { shadowColor: PRIMARY_DARK, shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: 3 } },
      android: { elevation: 3 },
    }),
  },
  avatarWrapper: { position: "relative", marginRight: 12 },
  avatar: { height: 64, width: 64, borderRadius: 16, backgroundColor: "#FFA79F55" },
  badge: {
    position: "absolute", bottom: -4, right: -4,
    backgroundColor: PRIMARY, borderRadius: 99,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  badgeText: { color: "#fff", fontSize: 10, fontWeight: "700" },

  info: { flex: 1, minWidth: 0, marginRight: 12 },
  name: { fontSize: 15, fontWeight: "600", color: TEXT },
  bio: { fontSize: 13, color: "#BC405E", marginTop: 2 },
  tags: { flexDirection: "row", marginTop: 6 },
  tag: {
    backgroundColor: TAG_BG, borderRadius: 99,
    paddingHorizontal: 8, paddingVertical: 3, marginRight: 6,
  },
  tagText: { fontSize: 11, color: TAG_TEXT },

  matchButton: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: PRIMARY, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10,
    ...Platform.select({
      ios: { shadowColor: PRIMARY_DARK, shadowOpacity: 0.35, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } },
      android: { elevation: 4 },
    }),
  },
  matchButtonText: { color: "#fff", fontSize: 13, fontWeight: "600" },
});