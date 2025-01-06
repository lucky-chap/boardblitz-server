import { type GameService, defaultGameServiceInstance } from "@/api/game/gameService";
import { HttpError } from "@/common/errors/HttpError";
import type { Game, User } from "@/common/types";
import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { nanoid } from "nanoid";
import { activeGames } from "./gameService";

export class GameController {
  // private service: GameService;
  private service = defaultGameServiceInstance;

  // constructor(service: GameService = new GameService()) {
  constructor(service: GameService) {
    this.service = service;
  }

  async getActiveGame(req: Request, res: Response): Promise<void> {
    try {
      if (!/^\d+$/.test(req.params.code)) {
        throw new HttpError("No active game found", StatusCodes.NOT_FOUND);
      }

      const game = await this.service.getActiveGame({
        where: { code: req.params.code },
      });

      //   if (!game) {
      //     throw new HttpError("Game not found", StatusCodes.NOT_FOUND);
      //   } else {
      //     res.status(200).json(game);
      //   }
      res.json(game);
    } catch (error) {
      if (error instanceof HttpError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  }

  async getGames(req: Request, res: Response): Promise<void> {
    try {
      if (!req.query.id && !req.query.userid) {
        // get all active games
        res.status(200).json(activeGames.filter((g) => !g.unlisted && !g.winner));
        return;
      }

      let id: number | undefined;
      let userid: number | undefined;
      if (req.query.id) {
        id = Number.parseInt(req.query.id as string);
      }
      if (req.query.userid) {
        userid = Number.parseInt(req.query.userid as string);
      }
      if (id && !Number.isNaN(id)) {
        // get finished game by id
        const game = await this.service.findUnique({
          where: {
            id,
          },
        });
        if (!game) {
          res.status(404).end();
        } else {
          res.status(200).json(game);
        }
      } else if (userid && !Number.isNaN(userid)) {
        // get finished games by user id
        const games = await this.service.findByUserId({
          where: {
            userId: userid,
            limit: 10,
          },
        });
        if (!games) {
          res.status(404).end();
        } else {
          res.status(200).json(games);
        }
      } else {
        res.status(400).end();
      }
    } catch (error) {
      if (error instanceof HttpError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  }

  async createNewGame(req: Request, res: Response): Promise<void> {
    try {
      if (!req.session.user?.id) {
        console.log("unauthorized createGame");
        res.status(401).end();
        return;
      }
      const user: User = {
        id: req.session.user.id,
        name: req.session.user.name,
        connected: false,
      };
      const unlisted: boolean = req.body.unlisted ?? false;
      const game: Game = {
        code: nanoid(6),
        unlisted,
        host: user,
        pgn: "",
      };
      if (req.body.side === "white") {
        game.white = user;
      } else if (req.body.side === "black") {
        game.black = user;
      } else {
        // random
        if (Math.floor(Math.random() * 2) === 0) {
          game.white = user;
        } else {
          game.black = user;
        }
      }
      activeGames.push(game);

      res.status(201).json({ code: game.code });
    } catch (error) {
      if (error instanceof HttpError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  }
  async getGameById(req: Request, res: Response): Promise<void> {
    try {
      if (!/^\d+$/.test(req.params.id)) {
        throw new HttpError("Game not found", StatusCodes.NOT_FOUND);
      }
      const id = Number.parseInt(req.params.id);
      const game = await this.service.findUnique({ where: { id } });
      res.json(game);
    } catch (error) {
      if (error instanceof HttpError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  }
}

export const defaultGameControllerInstance = new GameController(defaultGameServiceInstance);
