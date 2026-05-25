// Rota para carregar o link da página de login. 
import { Redirect } from "expo-router";

export default function Index() {
  return <Redirect href="/login" />; // Componente que é disparado assim que o aplicativo é aberto.
}