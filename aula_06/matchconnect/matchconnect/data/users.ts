export interface User {
  id: string;
  name: string;
  age: number;
  bio: string;
  avatar: string;
  interests: string[];
}

export const currentUser: User = {
  id: '0',
  name: 'Você',
  age: 21,
  avatar: '',
  bio: 'Apaixonada por tecnologia',
  interests: ['Tecnologia', 'Design', 'Música', 'Viagens'],
};

export const users: User[] = [
  {
    id: '1',
    name: 'Ana Lima',
    age: 23,
    avatar: '',
    bio: 'Dev front-end',
    interests: ['React', 'Design', 'Café', 'Livros'],
  },
  {
    id: '2',
    name: 'Carlos Souza',
    age: 25,
    avatar: '',
    bio: 'Músico nas horas vagas',
    interests: ['Música', 'Viagens', 'Fotografia'],
  },
  {
    id: '3',
    name: 'Gabriel Ferreira',
    age: 20,
    avatar: '',
    bio: 'Artista por amor',
    interests: ['Música', 'Viagens', 'Livros'],
  },
];

export function calcMatch(a: User, b: User) {
  const common = a.interests.filter((i) => b.interests.includes(i));
  const percentage = Math.round(
    (common.length / Math.max(a.interests.length, b.interests.length)) * 100
  );
  return { common, percentage };
}
