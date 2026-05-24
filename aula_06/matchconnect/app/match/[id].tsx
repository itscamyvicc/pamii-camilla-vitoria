import { useEffect, useRef, useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  View, Text, Image, TouchableOpacity, ScrollView,
  StyleSheet, Platform, Animated, ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../../config/firebase";

const PRIMARY = "#BC405E";
const PRIMARY_DARK = "#5A283E";
const CORAL = "#F6777E";
const BG = "#F9F9EC";
const TEXT = "#5A283E";

// ─── Tipos ───────────────────────────────────────────────────────────────────
interface UserData {
  id: string;
  nome_completo?: string;
  name?: string;         // fallback para docs antigos
  interesses?: string[];
  interests?: string[];  // fallback para docs antigos
  foto_url?: string;
  photoURL?: string;     // fallback para docs antigos
}

// ─── Calcula compatibilidade entre dois arrays de interesses ─────────────────
function calcMatch(a: string[], b: string[]) {
  const setB = new Set(b.map((i) => i.toLowerCase().trim()));
  const common = a.filter((i) => setB.has(i.toLowerCase().trim()));
  const union = new Set([...a.map((i) => i.toLowerCase().trim()), ...b.map((i) => i.toLowerCase().trim())]);
  const percentage = union.size === 0 ? 0 : Math.round((common.length / union.size) * 100);
  return { common, percentage };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getDisplayName(user: UserData) {
  return user.nome_completo || user.name || "Usuário";
}

function getFirstName(user: UserData) {
  return getDisplayName(user).split(" ")[0];
}

function getInterests(user: UserData): string[] {
  return user.interesses || user.interests || [];
}

function getAvatarUri(user: UserData, fallbackName: string) {
  return (
    user.foto_url ||
    user.photoURL ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackName)}&background=random`
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function Match() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [otherUser, setOtherUser] = useState<UserData | null>(null);
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const progressAnim = useRef(new Animated.Value(0)).current;

  // ─── Busca ambos os usuários no Firestore ───────────────────────────────────
  // Usa onAuthStateChanged para aguardar o Firebase restaurar a sessão
  // antes de tentar ler o Firestore (evita o bug "Seu perfil não foi encontrado")
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setError("Usuário não autenticado.");
        setLoading(false);
        return;
      }

      try {
        const [currentSnap, otherSnap] = await Promise.all([
          getDoc(doc(db, "cadastroUsuario", firebaseUser.uid)),
          getDoc(doc(db, "cadastroUsuario", id)),
        ]);

        if (!currentSnap.exists()) {
          setError("Seu perfil não foi encontrado.");
          setLoading(false);
          return;
        }
        if (!otherSnap.exists()) {
          setError("Perfil do outro usuário não encontrado.");
          setLoading(false);
          return;
        }

        setCurrentUser({ id: currentSnap.id, ...currentSnap.data() } as UserData);
        setOtherUser({ id: otherSnap.id, ...otherSnap.data() } as UserData);
      } catch (e) {
        console.error("Erro ao buscar usuários:", e);
        setError("Erro ao carregar dados. Tente novamente.");
      } finally {
        setLoading(false);
      }
    });

    // Cancela o listener quando o componente desmonta
    return () => unsubscribe();
  }, [id]);

  // ─── Anima a barra de progresso após carregar ───────────────────────────────
  useEffect(() => {
    if (!currentUser || !otherUser) return;

    const { percentage } = calcMatch(getInterests(currentUser), getInterests(otherUser));

    const timer = setTimeout(() => {
      Animated.timing(progressAnim, {
        toValue: percentage,
        duration: 1200,
        useNativeDriver: false,
      }).start();
    }, 200);

    return () => clearTimeout(timer);
  }, [currentUser, otherUser]);

  // ─── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: BG }]}>
        <ActivityIndicator size="large" color={PRIMARY} />
        <Text style={[styles.loadingText, { marginTop: 12 }]}>Calculando compatibilidade…</Text>
      </View>
    );
  }

  // ─── Erro ───────────────────────────────────────────────────────────────────
  if (error || !otherUser || !currentUser) {
    return (
      <View style={[styles.center, { backgroundColor: BG }]}>
        <Ionicons name="alert-circle-outline" size={48} color={CORAL} />
        <Text style={[styles.loadingText, { marginTop: 12, color: TEXT }]}>
          {error || "Dados não encontrados."}
        </Text>
        <TouchableOpacity style={styles.errorButton} onPress={() => router.back()}>
          <Text style={styles.outlineButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ─── Dados calculados ───────────────────────────────────────────────────────
  const { common, percentage } = calcMatch(getInterests(currentUser), getInterests(otherUser));

  const barWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  const message =
    percentage >= 60
      ? "Alta compatibilidade 🔥"
      : percentage >= 30
      ? "Vocês têm bastante em comum ✨"
      : "Vocês têm poucos interesses em comum";

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={TEXT} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Resultado do Match</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatares */}
        <View style={styles.avatarsRow}>
          <View style={styles.avatarCol}>
            <View style={[styles.avatarBorder, { backgroundColor: PRIMARY }]}>
              <Image
                source={{ uri: getAvatarUri(currentUser, getDisplayName(currentUser)) }}
                style={styles.avatarImg}
              />
            </View>
            <Text style={styles.avatarLabel}>Você</Text>
          </View>

          <View style={styles.heartCircle}>
            <Ionicons name="heart" size={24} color="#fff" />
          </View>

          <View style={styles.avatarCol}>
            <View style={[styles.avatarBorder, { backgroundColor: CORAL }]}>
              <Image
                source={{ uri: getAvatarUri(otherUser, getDisplayName(otherUser)) }}
                style={styles.avatarImg}
              />
            </View>
            <Text style={styles.avatarLabel}>{getFirstName(otherUser)}</Text>
          </View>
        </View>

        {/* Card compatibilidade */}
        <View style={styles.card}>
          <Text style={styles.compatLabel}>COMPATIBILIDADE</Text>
          <Text style={styles.percentageText}>{percentage}%</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressFill, { width: barWidth }]} />
          </View>
        </View>

        {/* Card interesses em comum */}
        <View style={[styles.card, { marginTop: 16 }]}>
          <Text style={styles.sectionTitle}>
            Interesses em comum{" "}
            <Text style={styles.sectionCount}>({common.length})</Text>
          </Text>
          {common.length === 0 ? (
            <Text style={styles.emptyText}>Nenhum interesse em comum encontrado ainda.</Text>
          ) : (
            <View style={styles.tagsWrap}>
              {common.map((c) => (
                <View key={c} style={styles.tag}>
                  <Text style={styles.tagText}>{c}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Botões */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.outlineButton}
            onPress={() => router.push("/home" as any)}
            activeOpacity={0.8}
          >
            <Text style={styles.outlineButtonText}>Voltar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.85}
            onPress={() => router.push({
              pathname: "/chat/[id]",
              params: { id: otherUser.id, nome: getFirstName(otherUser) }
            } as any)}
          >
            <Ionicons name="chatbubble-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
            <Text style={styles.primaryButtonText}>Conversar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  scroll: { paddingHorizontal: 24 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 },
  loadingText: { fontSize: 14, color: PRIMARY, textAlign: "center" },

  header: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24, paddingVertical: 12,
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
  headerSpacer: { width: 44 },

  avatarsRow: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "center", paddingVertical: 24,
  },
  avatarCol: { alignItems: "center", marginHorizontal: 10 },
  avatarLabel: { fontSize: 13, fontWeight: "500", color: TEXT, marginTop: 8 },
  avatarBorder: {
    padding: 3, borderRadius: 24,
    ...Platform.select({
      ios: { shadowColor: PRIMARY_DARK, shadowOpacity: 0.4, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
      android: { elevation: 6 },
    }),
  },
  avatarImg: { height: 88, width: 88, borderRadius: 20, backgroundColor: "#FFA79F55" },
  heartCircle: {
    height: 48, width: 48, borderRadius: 24,
    backgroundColor: CORAL, alignItems: "center", justifyContent: "center",
    marginHorizontal: 10,
    ...Platform.select({
      ios: { shadowColor: CORAL, shadowOpacity: 0.5, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
      android: { elevation: 6 },
    }),
  },

  card: {
    backgroundColor: "#fff", borderRadius: 24,
    padding: 24, alignItems: "center",
    ...Platform.select({
      ios: { shadowColor: PRIMARY_DARK, shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: 3 } },
      android: { elevation: 3 },
    }),
  },
  compatLabel: { fontSize: 11, color: "#BC405E", letterSpacing: 1.2, fontWeight: "600" },
  percentageText: { fontSize: 72, fontWeight: "800", color: PRIMARY, lineHeight: 80, marginTop: 4 },
  message: { fontSize: 15, fontWeight: "500", color: TEXT, marginTop: 8, textAlign: "center" },
  progressTrack: {
    marginTop: 20, height: 12, width: "100%",
    borderRadius: 99, backgroundColor: "#FFA79F33", overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 99, backgroundColor: PRIMARY },

  sectionTitle: { fontSize: 15, fontWeight: "600", color: TEXT, alignSelf: "flex-start", marginBottom: 12 },
  sectionCount: { fontWeight: "400", color: "#BC405E" },
  emptyText: { fontSize: 13, color: "#BC405E", alignSelf: "flex-start" },
  tagsWrap: { flexDirection: "row", flexWrap: "wrap", alignSelf: "flex-start" },
  tag: {
    backgroundColor: PRIMARY, borderRadius: 99,
    paddingHorizontal: 14, paddingVertical: 7,
    marginRight: 8, marginBottom: 8,
  },
  tagText: { color: "#fff", fontSize: 13, fontWeight: "500" },

  actions: { flexDirection: "row", marginTop: 16 },
  errorButton: {
    marginTop: 24, height: 56, borderRadius: 16,
    borderWidth: 2, borderColor: "#FFA79F",
    backgroundColor: "#fff", alignItems: "center", justifyContent: "center",
    paddingHorizontal: 32,
  },
  outlineButton: {
    flex: 1, height: 56, borderRadius: 16,
    borderWidth: 2, borderColor: "#FFA79F",
    backgroundColor: "#fff", alignItems: "center", justifyContent: "center",
    marginRight: 12,
  },
  outlineButtonText: { fontSize: 15, fontWeight: "600", color: TEXT },
  primaryButton: {
    flex: 1, height: 56, borderRadius: 16,
    backgroundColor: PRIMARY, flexDirection: "row",
    alignItems: "center", justifyContent: "center",
    ...Platform.select({
      ios: { shadowColor: PRIMARY_DARK, shadowOpacity: 0.4, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
      android: { elevation: 5 },
    }),
  },
  primaryButtonText: { color: "#fff", fontSize: 15, fontWeight: "600" },
});