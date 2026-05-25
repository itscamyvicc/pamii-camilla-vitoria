// Motor de comunicação do aplicativo (chat em tempo real).

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

// Gera ID da conversa sempre igual para os dois lados.
export function getConversaId(uid1: string, uid2: string): string {
  return [uid1, uid2].sort().join("_");
} // Para garantir que os dois usuários entrem sempre na mesma sala, a função pega os dois IDs, coloca em ordem alfabética e junta os dois com um underline.

export function ouvirMensagens(
  conversaId: string,
  callback: (msgs: Mensagem[]) => void
): () => void {
  const ref = collection(db, "conversas", conversaId, "mensagens");
  const q = query(ref, orderBy("timestamp", "asc"));

  const unsubscribe = onSnapshot(q, (snap) => { // Abre um canal direto de comunicação com a coleção de mensagens de uma conversa específica.
    const msgs: Mensagem[] = snap.docs.map((d) => ({
      id: d.id,
      texto: d.data().texto,
      de: d.data().de,
      timestamp: d.data().timestamp ?? null,
    }));
    callback(msgs);
  });

  return unsubscribe; // Quando o usuário sai da conversa, o aplicativo avisa ao Firebase. Isso economiza bateria e dados de internet, evitando o famoso Memory Leak!
}

export async function enviarMensagem( // Quando o usuário digita um texto e clica na setinha de enviar, essa função é ativada.
  conversaId: string,
  texto: string,
  de: string
): Promise<void> {
  const ref = collection(db, "conversas", conversaId, "mensagens");
  await addDoc(ref, {
    texto: texto.trim(),
    de,
    timestamp: serverTimestamp(), // Garante que a ordem das mensagens fique perfeita e baseada na hora exata do servidor do banco de dados.
  });
}