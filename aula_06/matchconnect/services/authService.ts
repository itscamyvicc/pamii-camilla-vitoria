// Isolar toda a parte burocrática de login, criação e exclusão de contas.
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  deleteUser,
  getAuth,
} from "firebase/auth";
import { doc, setDoc, getDoc, deleteDoc } from "firebase/firestore";
import { auth, db } from "../config/firebase";

export interface LoginResult {
  success: boolean;
  user?: {
    id: string;
    email: string;
    nome_completo: string;
    interesses: string[];
    foto_url?: string; 
  };
  error?: string;
}

// Usuário logado guardado globalmente.
export let usuarioLogado: LoginResult["user"] | null = null; // Essa variável começa vazia.

export async function loginUsuario(email: string, senha: string): Promise<LoginResult> {
  try {
    const credencial = await signInWithEmailAndPassword(auth, email, senha); // Checar se as credenciais estão certas.
    const uid = credencial.user.uid;

    const docSnap = await getDoc(doc(db, "cadastroUsuario", uid));
    if (!docSnap.exists()) {
      return { success: false, error: "Perfil não encontrado." };
    } // Assim que o usuário faz login com sucesso, o arquivo puxa os dados dele do banco de dados e joga dentro dessa variável.

    const dados = docSnap.data();
    usuarioLogado = {
    id: uid,
    email: dados.email,
    nome_completo: dados.nome_completo,
    interesses: dados.interesses,
    foto_url: dados.foto_url || null, 
    };

    return { success: true, user: usuarioLogado };
  } catch (error: any) {
    if (error.code === "auth/invalid-credential" || error.code === "auth/wrong-password") {
      return { success: false, error: "Email ou senha incorretos." };
    }
    return { success: false, error: "Erro ao fazer login. Tente novamente." };
  }
}

export async function cadastrarUsuario(
  nome: string,
  email: string,
  senha: string,
  interesses: string[]
): Promise<LoginResult> {
  try {
    const credencial = await createUserWithEmailAndPassword(auth, email, senha); // Registra o e-mail e a senha no sistema de autenticação do Firebase.
    const uid = credencial.user.uid;

    await setDoc(doc(db, "cadastroUsuario", uid), { // Cria um documento na coleção "cadastroUsuario" do Firestore, salvando o nome completo e a lista de interesses que o usuário escolheu.
      nome_completo: nome,
      email,
      interesses,
    });

    usuarioLogado = { id: uid, email, nome_completo: nome, interesses };
    return { success: true, user: usuarioLogado };
  } catch (error: any) {
    if (error.code === "auth/email-already-in-use") {
      return { success: false, error: "Este email já está cadastrado." };
    }
    if (error.code === "auth/weak-password") {
      return { success: false, error: "A senha deve ter pelo menos 6 caracteres." };
    }
    return { success: false, error: "Erro ao cadastrar. Tente novamente." };
  }
}

export async function deletarConta(): Promise<{ success: boolean; error?: string }> { // Essa função vai no banco de dados do Firestore e apaga o documento com os dados e o usuário do sistema.
  try {
    const currentUser = auth.currentUser;
    if (!currentUser || !usuarioLogado) {
      return { success: false, error: "Nenhum usuário logado." };
    }

    // Deleta do Firestore.
    await deleteDoc(doc(db, "cadastroUsuario", usuarioLogado.id));

    // Deleta do Authentication.
    await deleteUser(currentUser);

    usuarioLogado = null;
    return { success: true };
  } catch (error: any) {
    if (error.code === "auth/requires-recent-login") {
      return { success: false, error: "Por segurança, faça login novamente antes de deletar a conta." };
    }
    return { success: false, error: "Erro ao deletar conta. Tente novamente." };
  }
}

export async function logoutUsuario() { // Desconecta o usuário do Firebase Auth e limpa a variável, mudando ela para null e deixa o app pronto para o próximo login.
  await signOut(auth);
  usuarioLogado = null;
}