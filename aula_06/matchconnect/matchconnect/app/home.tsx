import { useRouter } from "expo-router";
import { View, Text, TextInput, Image, TouchableOpacity, ScrollView, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { users, currentUser, calcMatch } from "../data/users";

const PRIMARY = "#BC405E";
const PRIMARY_DARK = "#5A283E";
const BG = "#F9F9EC";
const CARD = "#fff";
const TEXT = "#5A283E";
const MUTED = "#BC405E99";
const TAG_BG = "#FFA79F33";
const TAG_TEXT = "#5A283E";

export default function Home() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Descobrir pessoas</Text>
        </View>
        <TouchableOpacity style={styles.bellButton}>
          <Ionicons name="notifications-outline" size={22} color={TEXT} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchWrapper}>
        <Ionicons name="search-outline" size={20} color="#FFA79F" style={styles.searchIcon} />
        <TextInput
          placeholder="Buscar por interesses..."
          placeholderTextColor="#FFA79F"
          style={styles.searchInput}
        />
      </View>

      {/* Lista */}
      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {users.map((u) => {
          const { percentage } = calcMatch(currentUser, u);
          return (
            <View key={u.id} style={styles.card}>
              <View style={styles.avatarWrapper}>
                <Image source={{ uri: u.avatar }} style={styles.avatar} />
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{percentage}%</Text>
                </View>
              </View>

              <View style={styles.info}>
                <Text style={styles.name} numberOfLines={1}>
                  {u.name},{" "}
                  <Text style={styles.age}>{u.age}</Text>
                </Text>
                <Text style={styles.bio} numberOfLines={1}>{u.bio}</Text>
                <View style={styles.tags}>
                  {u.interests.slice(0, 2).map((interest) => (
                    <View key={interest} style={styles.tag}>
                      <Text style={styles.tagText}>{interest}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <TouchableOpacity
                style={styles.matchButton}
                onPress={() => router.push(`/match/${u.id}`)}
                activeOpacity={0.8}
              >
                <Ionicons name="sparkles" size={15} color="#fff" />
                <Text style={styles.matchButtonText}>Match</Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  greeting: { fontSize: 13, color: "#BC405E" },
  title: { fontSize: 22, fontWeight: "700", color: TEXT, marginTop: 2 },
  bellButton: {
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

  list: { paddingHorizontal: 24, gap: 12 },

  card: {
    backgroundColor: CARD, borderRadius: 24, padding: 14,
    flexDirection: "row", alignItems: "center", gap: 12,
    ...Platform.select({
      ios: { shadowColor: PRIMARY_DARK, shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: 3 } },
      android: { elevation: 3 },
    }),
  },

  avatarWrapper: { position: "relative" },
  avatar: { height: 64, width: 64, borderRadius: 16, backgroundColor: "#FFA79F55" },
  badge: {
    position: "absolute", bottom: -4, right: -4,
    backgroundColor: PRIMARY, borderRadius: 99,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  badgeText: { color: "#fff", fontSize: 10, fontWeight: "700" },

  info: { flex: 1, minWidth: 0 },
  name: { fontSize: 15, fontWeight: "600", color: TEXT },
  age: { fontWeight: "400", color: "#BC405E" },
  bio: { fontSize: 13, color: "#BC405E", marginTop: 2 },
  tags: { flexDirection: "row", gap: 6, marginTop: 6 },
  tag: { backgroundColor: TAG_BG, borderRadius: 99, paddingHorizontal: 8, paddingVertical: 3 },
  tagText: { fontSize: 11, color: TAG_TEXT },

  matchButton: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: PRIMARY, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10,
    ...Platform.select({
      ios: { shadowColor: PRIMARY_DARK, shadowOpacity: 0.35, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } },
      android: { elevation: 4 },
    }),
  },
  matchButtonText: { color: "#fff", fontSize: 13, fontWeight: "600" },
});