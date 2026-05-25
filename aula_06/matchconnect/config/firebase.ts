// Conecta o aplicativo mobile aos serviços em nuvem do Firebase.

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY, // Significa as senhas reais foram guardadas em um arquivo secreto chamado .env.
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};  // Endereço e a senha que o Firebase deu para o aplicativo. Elas dizem para o sistema do Firebase exatamente qual é o banco de dados que pertence ao seu projeto,
    // garantindo que os dados dos seus usuários não se misturem com os de outros aplicativos.

const app = initializeApp(firebaseConfig);  // Utiliza as chaves de configuração e liga o aplicativo ao Firebase.

export const db = getFirestore(app);  // Cloud Firestore: Guarda as listas de usuários, tags de interesse e o histórico de mensagens.
export const auth = getAuth(app);   // Firebase Authentication: trata de segurança e autenticação da criação de contas e validação de e-mails e senhas.