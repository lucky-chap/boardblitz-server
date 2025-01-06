import type { Game, User } from "@/common/types";

export interface IUserService {
  findMany(): Promise<User[]>;
  findUnique(params: { where: { id: number } }): Promise<User>;
  findByEmail(params: { where: { email: string } }): Promise<User | null>;
  findUserProfileWithGames(params: {
    where: { id: number };
  }): Promise<User & { recentGames: Game[] }>;
  checkIfAccountExists(params: {
    where: { email: string };
  }): Promise<User | null>;
  create(params: {
    data: Omit<User, "id" | "createdAt" | "updatedAt">;
  }): Promise<User | null>;
  update(params: {
    where: { id: number };
    data: Partial<User>;
  }): Promise<User | null>;
  delete(params: { where: { id: number } }): Promise<User>;
}
