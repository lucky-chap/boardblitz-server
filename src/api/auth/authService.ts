import { activeGames } from "@/api/game/gameService";
import { defaultUserServiceInstance } from "@/api/user/userService";
import { HttpError } from "@/common/errors/HttpError";
import type { User } from "@/common/types";
import { logger } from "@/server";
import { io } from "@/server";
import { verify } from "argon2";
import { StatusCodes } from "http-status-codes";
import xss from "xss";
import type { IAuthService } from "./authTypes";

export class AuthService implements IAuthService {
  async updateGameParticipantName({
    data: { sessionId, name },
  }: {
    data: { sessionId: string; name: string };
  }): Promise<void> {
    const game = activeGames.find(
      (g) => g.white?.id === sessionId || g.black?.id === sessionId || g.observers?.find((o) => o.id === sessionId),
    );

    if (game) {
      if (game.host?.id === sessionId) {
        game.host.name = name;
      }
      if (game.white?.id === sessionId) {
        game.white.name = name;
      } else if (game.black?.id === sessionId) {
        game.black.name = name;
      } else {
        const observer = game.observers?.find((o) => o.id === sessionId);
        if (observer) {
          observer.name = name;
        }
      }
      io.to(game.code as string).emit("receivedLatestGame", game);
    }
  }

  async loginUser({
    data: { email, password },
  }: {
    data: { email: string; password: string };
  }): Promise<User> {
    try {
      const userWithPasswordField = await defaultUserServiceInstance.checkIfAccountExists({
        where: {
          email: email,
        },
      });

      if (!userWithPasswordField) {
        throw new HttpError("No account with that email exists", StatusCodes.NOT_FOUND);
      }

      const validPassword = await verify(userWithPasswordField.password as string, password);

      if (!validPassword) {
        throw new HttpError("Invalid email or password", StatusCodes.UNAUTHORIZED);
      }

      const userWithoutPasswordField = {
        id: userWithPasswordField.id,
        name: userWithPasswordField.name,
        email: userWithPasswordField.email,
        profile_picture: userWithPasswordField.profile_picture,
        banner_picture: userWithPasswordField.banner_picture,
        wins: userWithPasswordField.wins,
        losses: userWithPasswordField.losses,
        draws: userWithPasswordField.draws,
      } as User;

      return userWithoutPasswordField;
    } catch (error) {
      logger.error(error);
      if (error instanceof HttpError) throw error;
      throw new HttpError("Failed to register user", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async registerUser({
    data: { name, email, password },
  }: {
    data: { name: string; email: string; password: string };
  }): Promise<User> {
    try {
      const sanitizedName = xss(name);
      const duplicateUser = await defaultUserServiceInstance.findByEmail({
        where: {
          email: email,
        },
      });
      if (duplicateUser) {
        const dupl = duplicateUser.name === sanitizedName ? "Username" : "Email";
        console.log("duplicate", dupl);
        throw new HttpError(`${dupl} is already in use`, StatusCodes.CONFLICT);
      }

      const newUser = await defaultUserServiceInstance.create({
        data: {
          name: sanitizedName,
          email: email,
          password: password,
        },
      });
      if (!newUser) {
        throw new HttpError("Failed to create user", StatusCodes.INTERNAL_SERVER_ERROR);
      }

      return {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      };
    } catch (error) {
      logger.error(error);
      if (error instanceof HttpError) throw error;
      throw new HttpError("Failed to register user", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async logoutSession(): Promise<void> {
    // This is handled by the controller using req.session.destroy
    return Promise.resolve();
  }

  async updateGuestName(sessionId: string, name: string): Promise<User> {
    try {
      const sanitizedName = name;

      // Find and update game participants with new name
      const game = activeGames.find(
        (g) => g.white?.id === sessionId || g.black?.id === sessionId || g.observers?.find((o) => o.id === sessionId),
      );

      if (game) {
        if (game.host?.id === sessionId) {
          game.host.name = sanitizedName;
        }
        if (game.white?.id === sessionId) {
          game.white.name = sanitizedName;
        } else if (game.black?.id === sessionId) {
          game.black.name = sanitizedName;
        } else {
          const observer = game.observers?.find((o) => o.id === sessionId);
          if (observer) {
            observer.name = sanitizedName;
          }
        }
        io.to(game.code as string).emit("receivedLatestGame", game);
      }

      return {
        id: sessionId,
        name: sanitizedName,
      };
    } catch (error) {
      logger.error(error);
      if (error instanceof HttpError) throw error;
      throw new HttpError("Failed to update guest name", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
}
