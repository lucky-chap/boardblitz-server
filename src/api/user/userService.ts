import { defaultGameServiceInstance } from "@/api/game/gameService";
import { HttpError } from "@/common/errors/HttpError";
import type { Game, User } from "@/common/types";
import { client as db } from "@/db/client";
import { logger } from "@/server";
import { StatusCodes } from "http-status-codes";
import type { IUserService } from "./userTypes";

export class UserService implements IUserService {
  async findMany(): Promise<User[]> {
    try {
      return await db.user.findMany();
    } catch (error) {
      logger.error(error);
      throw new HttpError("Failed to fetch users", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async findUnique({
    where: { id },
  }: {
    where: { id: number };
  }): Promise<User> {
    try {
      if (Number.isNaN(id)) {
        throw new HttpError("User not found", StatusCodes.NOT_FOUND);
      }
      const user = await db.user.findUnique({ where: { id } });
      if (!user) {
        throw new HttpError("User not found", StatusCodes.NOT_FOUND);
      }
      return user;
    } catch (error) {
      logger.error(error);
      if (error instanceof HttpError) throw error;
      throw new HttpError("Failed to fetch user", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async findUserProfileWithGames({
    where: { id },
  }: {
    where: { id: number };
  }): Promise<User & { recentGames: Game[] }> {
    try {
      const user = await this.findUnique({ where: { id } });
      const recentGames = await defaultGameServiceInstance.findByUserId({
        where: { userId: id, limit: 5 },
      });
      return { ...user, recentGames };
    } catch (error) {
      logger.error(error);
      if (error instanceof HttpError) throw error;
      throw new HttpError("Failed to fetch user profile with games", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async findByEmail({
    where: { email },
  }: {
    where: { email: string };
  }): Promise<User | null> {
    try {
      const user = await db.user.findByEmail({ where: { email } });
      if (user) {
        throw new HttpError("An account with that email already existes", StatusCodes.CONFLICT);
      }
      return null;
    } catch (error) {
      logger.error(error);
      if (error instanceof HttpError) throw error;
      throw new HttpError("Failed to check user", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async checkIfAccountExists({
    where: { email },
  }: {
    where: { email: string };
  }): Promise<User | null> {
    try {
      const user = await db.user.findByEmail({ where: { email } });
      if (!user) {
        throw new HttpError("Account not found", StatusCodes.NOT_FOUND);
      }
      return user;
    } catch (error) {
      logger.error(error);
      if (error instanceof HttpError) throw error;
      throw new HttpError("Failed to check user", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async create({
    data,
  }: {
    data: Omit<User, "id" | "createdAt" | "updatedAt"> & { password: string };
  }): Promise<User | null> {
    try {
      const newUser = await db.user.create({ data });
      // if (!newUser) {
      //   throw new HttpError(
      //     "Failed to create user",
      //     StatusCodes.INTERNAL_SERVER_ERROR
      //   );
      // }
      return newUser;
    } catch (error) {
      logger.error(error);
      throw new HttpError("Failed to create user", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async update({
    where: { id },
    data,
  }: {
    where: { id: number };
    data: Partial<User> & { password?: string | undefined };
  }): Promise<User | null> {
    try {
      const existingUser = await db.user.findUnique({ where: { id } });
      if (!existingUser) {
        throw new HttpError("User not found", StatusCodes.NOT_FOUND);
      }
      return await db.user.update({ where: { id }, data });
    } catch (error) {
      logger.error(error);
      if (error instanceof HttpError) throw error;
      throw new HttpError("Failed to update user", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async delete({ where: { id } }: { where: { id: number } }): Promise<User> {
    try {
      const existingUser = await db.user.findUnique({ where: { id } });
      if (!existingUser) {
        throw new HttpError("User not found", StatusCodes.NOT_FOUND);
      }
      return await db.user.delete({ where: { id } });
    } catch (error) {
      logger.error(error);
      if (error instanceof HttpError) throw error;
      throw new HttpError("Failed to delete user", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
}

export const defaultUserServiceInstance = new UserService();
