// Coleta a lista de todas as pessoas cadastradas no aplicativo.
import { collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";

export interface FirebaseUser { // Checa se todos os dados estão vindo corretamente.
  id: string;
  nome_completo: string;
  email: string;
  interesses: string[];
  foto_url?: string; 
} 

export async function getUsuarios(): Promise<FirebaseUser[]> {
  const snapshot = await getDocs /* Usa a nuvem para coletar os dados */(collection(db, "cadastroUsuario")); // Vizualiza a coleção onde todos os usuários estão cadastrados.
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(), // Pega os dados de cada usuário e os organiza em um formato específico, onde o id é separado do restante dos dados e depois juntado com os dados internos.
  })) as FirebaseUser[];
}