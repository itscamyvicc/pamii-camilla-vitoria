export interface User {
  id: string;
  name: string;
  age: number;
  bio: string;
  avatar: string;
  interests: string[];
}

export function calcMatch(a: User, b: User) {
  const common = a.interests.filter((i) => b.interests.includes(i));
  const percentage = Math.round(
    (common.length / Math.max(a.interests.length, b.interests.length)) * 100
  );
  return { common, percentage };
}