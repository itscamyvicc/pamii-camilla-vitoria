import { collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";

export interface FirebaseUser {
  id: string;
  nome_completo: string;
  email: string;
  interesses: string[];
  foto_url?: string; 
}

export async function getUsuarios(): Promise<FirebaseUser[]> {
  const snapshot = await getDocs(collection(db, "cadastroUsuario"));
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as FirebaseUser[];
}