import {
  collection, addDoc, onSnapshot,
  orderBy, query, serverTimestamp, Timestamp,
} from "firebase/firestore";
import { db } from "../config/firebase";

export interface Mensagem {
  id: string;
  texto: string;
  de: string;
  timestamp: Timestamp | null;
}

// Gera ID da conversa sempre igual para os dois lados
export function getConversaId(uid1: string, uid2: string): string {
  return [uid1, uid2].sort().join("_");
}

export function ouvirMensagens(
  conversaId: string,
  callback: (msgs: Mensagem[]) => void
): () => void {
  const ref = collection(db, "conversas", conversaId, "mensagens");
  const q = query(ref, orderBy("timestamp", "asc"));

  const unsubscribe = onSnapshot(q, (snap) => {
    const msgs: Mensagem[] = snap.docs.map((d) => ({
      id: d.id,
      texto: d.data().texto,
      de: d.data().de,
      timestamp: d.data().timestamp ?? null,
    }));
    callback(msgs);
  });

  return unsubscribe;
}

export async function enviarMensagem(
  conversaId: string,
  texto: string,
  de: string
): Promise<void> {
  const ref = collection(db, "conversas", conversaId, "mensagens");
  await addDoc(ref, {
    texto: texto.trim(),
    de,
    timestamp: serverTimestamp(),
  });
}