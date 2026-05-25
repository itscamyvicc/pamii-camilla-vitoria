// Proteção de rota.
import { Redirect } from "expo-router";

export default function Index() {
  return <Redirect href="/login" />; // Componente que é disparado assim que o aplicativo é aberto.
}