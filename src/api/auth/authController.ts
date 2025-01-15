import { HttpError } from "@/common/errors/HttpError";
import type { User } from "@/common/types";
import { hash } from "argon2";
import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import xss from "xss";
import { AuthService } from "./authService";

import { io } from "@/server";
import { nanoid } from "nanoid";
import { activeGames } from "../game/gameService";
import { defaultUserServiceInstance } from "../user/userService";

export class AuthController {
  private service: AuthService;

  constructor(service: AuthService = new AuthService()) {
    this.service = service;
  }

  async getCurrentSession(req: Request, res: Response): Promise<void> {
    try {
      if (req.session.user) {
        res.status(StatusCodes.OK).json(req.session.user);
      } else {
        res.status(StatusCodes.NO_CONTENT).end();
      }
    } catch (error) {
      console.error(error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).end();
    }
  }

  async guestSession(req: Request, res: Response): Promise<void> {
    try {
      if (req.session.user?.id && typeof req.session.user.id === "number") {
        res.status(StatusCodes.FORBIDDEN).end();
        return;
      }

      const name = xss(req.body.name);
      const pattern = /^[A-Za-z0-9]+$/;

      if (!pattern.test(name)) {
        res.status(StatusCodes.BAD_REQUEST).json({
          message: "Invalid name",
        });
        return;
      }

      if (req.session === undefined || req.session.user === undefined) {
        // Create new guest session

        const user: User = {
          id: nanoid(), // Generate a unique ID for guest user
          name,
        };
        req.session.user = user;
      } else if (req.session && typeof req.session.user.id === "string" && req.session.user.name !== name) {
        // Update existing guest session name
        req.session.user.name = name;
        await this.service.updateGameParticipantName({
          data: {
            sessionId: req.session.user.id,
            name,
          },
        });
      }

      req.session.save(() => {
        res.status(StatusCodes.CREATED).json(req.session.user);
      });
    } catch (error) {
      if (error instanceof HttpError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        console.error(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          message: "Failed to create guest session",
          error: error,
        });
      }
    }
  }

  async registerUser(req: Request, res: Response): Promise<void> {
    try {
      if (req.session?.user?.id && typeof req.session.user.id === "number") {
        res.status(StatusCodes.FORBIDDEN).end();
        return;
      }

      const name = xss(req.body.name);
      const email = xss(req.body.email);
      const password = await hash(req.body.password);

      const pattern = /^[A-Za-z0-9]+$/;
      if (!pattern.test(name)) {
        res.status(StatusCodes.BAD_REQUEST).end();
        return;
      }

      const user = await this.service.registerUser({
        data: {
          name,
          email,
          password,
        },
      });

      if (req.session?.user?.id && typeof req.session.user.id === "string") {
        // Update game participants if registering from guest session
        await this.service.updateGameParticipantName({
          data: {
            sessionId: req.session.user.id,
            name: user.name as string,
          },
        });
      }

      req.session.user = user;
      res.status(StatusCodes.CREATED).json(user);
    } catch (error) {
      if (error instanceof HttpError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        console.error(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          message: "Failed to register user",
          error: error,
        });
      }
    }
  }

  async loginUser(req: Request, res: Response): Promise<void> {
    try {
      if (req.session?.user?.id && typeof req.session.user.id === "number") {
        res.status(StatusCodes.FORBIDDEN).end();
        return;
      } else {
        const email = xss(req.body.email);
        const password = req.body.password;

        const user = await this.service.loginUser({
          data: {
            email,
            password,
          },
        });

        const publicUser = {
          id: user.id,
          name: user.name,
        };

        if (req.session.user?.id && typeof req.session.user.id === "string") {
          const game = activeGames.find(
            (g) =>
              g.white?.id === req.session.user.id ||
              g.black?.id === req.session.user.id ||
              g.observers?.find((o) => o.id === req.session.user.id),
          );
          if (game) {
            if (game.host?.id === req.session.user.id) {
              game.host = publicUser;
            }
            if (game.white && game.white?.id === req.session.user.id) {
              game.white = publicUser;
            } else if (game.black && game.black?.id === req.session.user.id) {
              game.black = publicUser;
            } else {
              const observer = game.observers?.find((o) => o.id === req.session.user.id);
              if (observer) {
                observer.id = publicUser.id;
                observer.name = publicUser.name;
              }
            }
            io.to(game.code as string).emit("receivedLatestGame", game);
          }
        }

        req.session.user = {
          id: user.id,
          name: user.name,
          email: user.email,
          wins: user.wins,
          losses: user.losses,
          draws: user.draws,
        };
        req.session.save((err) => {
          if (err) {
            console.error("Session save error:", err);
          }
          res.status(StatusCodes.OK).json(req.session.user);
        });
      }
    } catch (error) {
      if (error instanceof HttpError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        console.error(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Failed to login" });
      }
    }
  }

  async logoutSession(req: Request, res: Response): Promise<void> {
    try {
      req.session.destroy(() => {
        res.status(StatusCodes.NO_CONTENT).end();
      });
    } catch (error) {
      console.error(error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).end();
    }
  }

  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      if (!req.session.user?.id || typeof req.session.user.id === "string") {
        res.status(403).end();
        return;
      }

      if (!req.body.name && !req.body.email && !req.body.password) {
        res.status(400).end();
        return;
      }

      const name = xss(req.body.name || req.session.user.name);
      // const pattern = /^[A-Za-z0-9]+$/;
      // if (!pattern.test(name)) {
      //   res.status(400).end();
      //   return;
      // }

      const email = xss(req.body.email || req.session.user.email);
      const previousEmail = xss(req.body.oldEmail);
      const profile_picture = xss(req.body.profile_picture);
      const banner_picture = xss(req.body.banner_picture);

      console.log("Name:", name);
      console.log("Previous email:", previousEmail);
      console.log("New email:", email);
      console.log("Profile picture:", profile_picture);
      console.log("Banner picture:", banner_picture);

      const duplicateUser = await defaultUserServiceInstance.checkIfAccountExists({
        where: { email: previousEmail },
      });
      if (duplicateUser && duplicateUser.id !== req.session.user.id) {
        const dupl = duplicateUser.name === name ? "Username" : "Email";
        res.status(409).json({ message: `${dupl} is already in use.` });
        return;
      }

      let password: string | undefined = undefined;
      if (req.body.password) {
        password = await hash(req.body.password);
      }

      const dataToUpdate = {
        name,
        email,
        password,
        profile_picture,
        banner_picture,
      };

      const updatedUser = await defaultUserServiceInstance.update({
        where: {
          id: req.session.user.id,
        },
        data: dataToUpdate,
      });

      if (!updatedUser) {
        throw new HttpError("Failed to update user data", StatusCodes.INTERNAL_SERVER_ERROR);
      }

      const publicUser = {
        id: updatedUser.id,
        name: updatedUser.name,
      };

      const game = activeGames.find(
        (g) =>
          g.white?.id === req.session.user.id ||
          g.black?.id === req.session.user.id ||
          g.observers?.find((o) => o.id === req.session.user.id),
      );
      if (game) {
        if (game.host?.id === req.session.user.id) {
          game.host = publicUser;
        }
        if (game.white && game.white?.id === req.session.user.id) {
          game.white = publicUser;
        } else if (game.black && game.black?.id === req.session.user.id) {
          game.black = publicUser;
        } else {
          const observer = game.observers?.find((o) => o.id === req.session.user.id);
          if (observer) {
            observer.id = publicUser.id;
            observer.name = publicUser.name;
          }
        }
        io.to(game.code as string).emit("receivedLatestGame", game);
      }

      req.session.user = updatedUser;
      req.session.save(() => {
        res.status(200).json(req.session.user);
      });
    } catch (err: unknown) {
      console.log(err);
      res.status(500).end();
    }
  }
}

export const defaultAuthControllerInstance = new AuthController();
