// Famosa tela de "Erro 404: Página não encontrada" (Fallback).
import { useEffect } from "react";  // Pega o link errado e exibe uma mensagem de erro no console.
import { useRouter, usePathname} from "expo-router";  // Descobre e captura qual foi o link errado que usuário tentou acessar.
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const PRIMARY = "#BC405E";
const PRIMARY_DARK = "#5A283E";
const BG = "#F9F9EC";

export default function NotFound() {
  const pathname = usePathname();
  const router = useRouter();
  const insets = useSafeAreaInsets(); // Garante que o conteúdo não fique escondido atrás de áreas seguras (como o notch ou a barra de navegação).

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", pathname);
  }, [pathname]);

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <Text style={styles.code}>404</Text>
      <Text style={styles.title}>Página não encontrada</Text>
      <TouchableOpacity onPress={() => router.replace /* Destrói o histórico de navegação errada e reinicia na raiz */ ("/" as any)} activeOpacity={0.8}>
        <Text style={styles.link}>Voltar para o início</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: BG,
    alignItems: "center", justifyContent: "center", gap: 12,
  },
  code: { fontSize: 64, fontWeight: "800", color: PRIMARY_DARK },
  title: { fontSize: 18, color: PRIMARY },
  link: { fontSize: 15, color: PRIMARY_DARK, fontWeight: "600", textDecorationLine: "underline" },
});