// Esqueleto do layout principal do aplicativo (Root Component).
import { Stack } from "expo-router";  // Navegação do aplicativo.
import { SafeAreaProvider } from "react-native-safe-area-context";  // Protetor de tela (parte responsiva).

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false /* Visual limpo sem cabeçalhos.*/ }} />
    </SafeAreaProvider>
  );
}