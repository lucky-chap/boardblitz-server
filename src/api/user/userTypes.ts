import type { User } from "@/common/types";

export interface IUserService {
  findMany(): Promise<User[]>;
  findUnique(params: { where: { id: number } }): Promise<User>;
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
