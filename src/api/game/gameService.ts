import { HttpError } from "@/common/errors/HttpError";
import type { Game } from "@/common/types";
import { client as db } from "@/db/client";
import { logger } from "@/server";
import { StatusCodes } from "http-status-codes";
import type { IGameService } from "./gameTypes";

export const activeGames: Game[] = [];

export class GameService implements IGameService {
  async getActiveGame({
    where: { code },
  }: {
    where: { code: string };
  }): Promise<Game> {
    try {
      const game = await db.game.getActiveGame({ where: { code } });
      if (!game) {
        throw new HttpError("No active game found", StatusCodes.NOT_FOUND);
      }
      return game;
    } catch (error) {
      logger.error(error);
      if (error instanceof HttpError) throw error;
      throw new HttpError("Failed to fetch game", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async findUnique({
    where: { id },
  }: {
    where: { id: number };
  }): Promise<Game> {
    try {
      if (Number.isNaN(id)) {
        throw new HttpError("Game not found", StatusCodes.NOT_FOUND);
      }
      const game = await db.game.findUnique({ where: { id } });
      if (!game) {
        throw new HttpError("Game not found", StatusCodes.NOT_FOUND);
      }
      return game;
    } catch (error) {
      logger.error(error);
      if (error instanceof HttpError) throw error;
      throw new HttpError("Failed to fetch game", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async findByUserId({
    where: { userId, limit },
  }: {
    where: { userId: number; limit: number };
  }): Promise<Game[]> {
    try {
      if (Number.isNaN(userId)) {
        throw new HttpError("Game not found", StatusCodes.NOT_FOUND);
      }
      const game = await db.game.findByUserId({ where: { userId, limit } });
      if (!game) {
        throw new HttpError("Game not found", StatusCodes.NOT_FOUND);
      }
      return game;
    } catch (error) {
      logger.error(error);
      if (error instanceof HttpError) throw error;
      throw new HttpError("Failed to fetch game", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async delete({ where: { id } }: { where: { id: number } }): Promise<Game> {
    try {
      if (Number.isNaN(id)) {
        throw new HttpError("Game not found", StatusCodes.NOT_FOUND);
      }
      const game = await db.game.delete({ where: { id } });
      if (!game) {
        throw new HttpError("Game not found", StatusCodes.NOT_FOUND);
      }
      return game;
    } catch (error) {
      logger.error(error);
      if (error instanceof HttpError) throw error;
      throw new HttpError("Failed to fetch game", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async save({
    where: { game },
  }: {
    where: { game: Game };
  }): Promise<Game | null> {
    try {
      const newGame = await db.game.save({
        where: {
          game: game,
        },
      });
      return newGame;
    } catch (error) {
      logger.error(error);
      if (error instanceof HttpError) throw error;
      throw new HttpError("Failed to create game", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
}
