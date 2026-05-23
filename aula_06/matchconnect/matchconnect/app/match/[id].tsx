import { useEffect, useRef } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  View, Text, Image, TouchableOpacity, ScrollView,
  StyleSheet, Platform, Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { users, currentUser, calcMatch } from "../../data/users";

const PRIMARY = "#BC405E";
const PRIMARY_DARK = "#5A283E";
const CORAL = "#F6777E";
const BG = "#F9F9EC";
const TEXT = "#5A283E";

export default function Match() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const other = users.find((u) => u.id === id) ?? users[0];
  const { common, percentage } = calcMatch(currentUser, other);

  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(progressAnim, {
        toValue: percentage,
        duration: 1200,
        useNativeDriver: false,
      }).start();
    }, 200);
    return () => clearTimeout(timer);
  }, [percentage]);

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
              <Image source={{ uri: currentUser.avatar }} style={styles.avatarImg} />
            </View>
            <Text style={styles.avatarLabel}>Você</Text>
          </View>

          <View style={styles.heartCircle}>
            <Ionicons name="heart" size={24} color="#fff" />
          </View>

          <View style={styles.avatarCol}>
            <View style={[styles.avatarBorder, { backgroundColor: CORAL }]}>
              <Image source={{ uri: other.avatar }} style={styles.avatarImg} />
            </View>
            <Text style={styles.avatarLabel}>{other.name.split(" ")[0]}</Text>
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

          <TouchableOpacity style={styles.primaryButton} activeOpacity={0.85}>
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
    justifyContent: "center", gap: 20, paddingVertical: 24,
  },
  avatarCol: { alignItems: "center", gap: 8 },
  avatarBorder: {
    padding: 3, borderRadius: 24,
    ...Platform.select({
      ios: { shadowColor: PRIMARY_DARK, shadowOpacity: 0.4, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
      android: { elevation: 6 },
    }),
  },
  avatarImg: { height: 88, width: 88, borderRadius: 20, backgroundColor: "#FFA79F55" },
  avatarLabel: { fontSize: 13, fontWeight: "500", color: TEXT },
  heartCircle: {
    height: 48, width: 48, borderRadius: 24,
    backgroundColor: CORAL, alignItems: "center", justifyContent: "center",
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
  tagsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, alignSelf: "flex-start" },
  tag: { backgroundColor: PRIMARY, borderRadius: 99, paddingHorizontal: 14, paddingVertical: 7 },
  tagText: { color: "#fff", fontSize: 13, fontWeight: "500" },

  actions: { flexDirection: "row", gap: 12, marginTop: 16 },
  outlineButton: {
    flex: 1, height: 56, borderRadius: 16,
    borderWidth: 2, borderColor: "#FFA79F",
    backgroundColor: "#fff", alignItems: "center", justifyContent: "center",
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