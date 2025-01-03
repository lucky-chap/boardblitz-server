import type { Game } from "@/common/types";

export interface IGameService {
  getActiveGame(params: {
    where: { code: string };
  }): Promise<Game | null | undefined>;
  findUnique(params: { where: { id: number } }): Promise<Game>;
  findByUserId(params: {
    where: { userId: number; limit: number };
  }): Promise<Game[]>;
  save(params: { where: { game: Game } }): Promise<Game | null>;
  delete(params: { where: { id: number } }): Promise<Game>;
}
