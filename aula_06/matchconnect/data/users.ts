export interface User { // Define quais informações todo usuário deve ter.
  id: string;
  name: string;
  age: number;
  bio: string;
  avatar: string;
  interests: string[];
} // Nota: esse molde previne o código de nunca tentar ler, por exemplo, a foto de um usuário que tem o nome errado, evitando bugs.

export function calcMatch(a: User, b: User) {
  const common = a.interests.filter((i) => b.interests.includes(i));  // Descobre quais interesses os dois usuários têm em comum, criando um array chamado "common".
  const percentage = Math.round(
    (common.length / Math.max(a.interests.length, b.interests.length)) * 100  // Pega a quantidade de interesses em comum e divide pelo total de interesses da pessoa que tem a maior lista
  );
  return { common, percentage }; // Arredonda o número, gerando uma porcentagem inteira e limpa de 0% a 100%.
} // Nota: esse cálculo roda de forma síncrona e instantânea no celular do usuário!