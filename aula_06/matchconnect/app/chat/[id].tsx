import { useEffect, useRef, useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, Platform, KeyboardAvoidingView, ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { usuarioLogado } from "../../services/authService";
import { getConversaId, ouvirMensagens, enviarMensagem, Mensagem } from "../../services/chatServices";

const PRIMARY = "#BC405E";
const PRIMARY_DARK = "#5A283E";
const BG = "#F9F9EC";
const TEXT = "#5A283E";

export default function Chat() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id, nome } = useLocalSearchParams<{ id: string; nome: string }>();

  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [texto, setTexto] = useState("");
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  const conversaId = getConversaId(usuarioLogado?.id || "", id); // O aplicativo não usa o ID de uma pessoa como o ID da conversa, mas sim um terceiro ID gerado a partir dos dois ID's.

  // Recebe mensagens novas na hora, em tempo real, sem que o usuário precise ficar atualizando a página.
  useEffect(() => {
    const unsubscribe = ouvirMensagens(conversaId, (msgs) => { // Função de retorno que é chamada toda vez que tem uma nova mensagem.
      setMensagens(msgs); // o Firebase detecta a mudança e joga a lista atualizada de mensagens para dentro do parâmetro.
      setLoading(false);
    });
    return () => unsubscribe(); // Função de Limpeza (cleanup): Quando o usuário fechar a tela, o chat é "desligado".
  }, [conversaId]);

  async function handleEnviar() {
    if (!texto.trim() || !usuarioLogado) return;
    const textoAtual = texto;
    setTexto("");
    await enviarMensagem(conversaId, textoAtual, usuarioLogado.id);
  }

  function renderMensagem({ item }: { item: Mensagem }) {
    const minha = item.de === usuarioLogado?.id;
    return (
      <View style={[styles.msgWrapper, minha ? styles.msgRight : styles.msgLeft]}>
        <View style={[styles.bubble, minha ? styles.bubbleMinha : styles.bubbleDele]}>
          <Text style={[styles.bubbleText, minha ? styles.bubbleTextMinha : styles.bubbleTextDele]}>
            {item.texto}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: BG }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={TEXT} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{nome || "Conversa"}</Text> {/* Coloca o nome de quem você está conversando no topo.*/}
        <View style={styles.headerSpacer} />
      </View>

      {/* Mensagens */}
      {loading ? (
        <View style={styles.loadingWrapper}>
          <ActivityIndicator size="large" color={PRIMARY} />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={mensagens}
          keyExtractor={(item) => item.id}
          renderItem={renderMensagem}
          contentContainerStyle={styles.list}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Nenhuma mensagem ainda. Diga olá! 👋</Text>
          }
        />
      )}

      {/* Input */}
      <View style={[styles.inputRow, { paddingBottom: insets.bottom + 8 }]}>
        <TextInput
          style={styles.input}
          placeholder="Digite uma mensagem..."
          placeholderTextColor="#FFA79F"
          value={texto}
          onChangeText={setTexto}
          multiline
          onSubmitEditing={handleEnviar}
        />
        <TouchableOpacity
          style={[styles.sendButton, !texto.trim() && styles.sendButtonDisabled]}
          onPress={handleEnviar}
          disabled={!texto.trim()}
          activeOpacity={0.8}
        >
          <Ionicons name="send" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24, paddingBottom: 12,
    backgroundColor: BG,
    ...Platform.select({
      ios: { shadowColor: PRIMARY_DARK, shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
      android: { elevation: 2 },
    }),
  },
  backButton: {
    height: 44, width: 44, borderRadius: 22,
    backgroundColor: "#fff", alignItems: "center", justifyContent: "center",
    ...Platform.select({
      ios: { shadowColor: PRIMARY_DARK, shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
      android: { elevation: 3 },
    }),
  },
  headerTitle: { fontSize: 16, fontWeight: "600", color: TEXT, flex: 1, textAlign: "center" },
  headerSpacer: { width: 44 },

  loadingWrapper: { flex: 1, alignItems: "center", justifyContent: "center" },

  list: { paddingHorizontal: 16, paddingVertical: 16, flexGrow: 1 },
  emptyText: { textAlign: "center", color: "#FFA79F", marginTop: 40, fontSize: 14 },

  msgWrapper: { marginBottom: 8, maxWidth: "75%" },
  msgRight: { alignSelf: "flex-end" },
  msgLeft: { alignSelf: "flex-start" },

  bubble: { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleMinha: {
    backgroundColor: PRIMARY,
    borderBottomRightRadius: 4,
  },
  bubbleDele: {
    backgroundColor: "#fff",
    borderBottomLeftRadius: 4,
    ...Platform.select({
      ios: { shadowColor: PRIMARY_DARK, shadowOpacity: 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
      android: { elevation: 2 },
    }),
  },
  bubbleText: { fontSize: 14, lineHeight: 20 },
  bubbleTextMinha: { color: "#fff" },
  bubbleTextDele: { color: TEXT },

  inputRow: {
    flexDirection: "row", alignItems: "flex-end",
    paddingHorizontal: 16, paddingTop: 8,
    backgroundColor: BG,
    borderTopWidth: 1, borderTopColor: "#FFA79F22",
  },
  input: {
    flex: 1, minHeight: 44, maxHeight: 120,
    backgroundColor: "#fff", borderRadius: 22,
    paddingHorizontal: 16, paddingVertical: 10,
    fontSize: 14, color: TEXT, marginRight: 8,
    ...Platform.select({
      ios: { shadowColor: PRIMARY_DARK, shadowOpacity: 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
      android: { elevation: 2 },
    }),
  },
  sendButton: {
    height: 44, width: 44, borderRadius: 22,
    backgroundColor: PRIMARY, alignItems: "center", justifyContent: "center",
    ...Platform.select({
      ios: { shadowColor: PRIMARY_DARK, shadowOpacity: 0.35, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } },
      android: { elevation: 4 },
    }),
  },
  sendButtonDisabled: { opacity: 0.5 },
});