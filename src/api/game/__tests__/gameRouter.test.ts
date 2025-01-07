import errorHandler from "@/common/middleware/errorHandler";
import type { Game } from "@/common/types";
import express from "express";
import { StatusCodes } from "http-status-codes";
import request from "supertest";
import { GameController } from "../gameController";
import { createGameRouter } from "../gameRouter";
import { GameService } from "../gameService";

// Mock the GameService
vi.mock("../gameService");

// Create a mock instance of GameService
const mockGameServiceInstance = {
  getActiveGame: vi.fn(),
};

// Mock the constructor to return our mock instance
vi.mocked(GameService).mockImplementation(() => mockGameServiceInstance as any);

describe("Game Router", () => {
  let app: express.Express;

  const mockUser = {
    id: 1,
    email: "test@example.com",
    name: "Test User",
    createdAt: `${new Date()}`,
    updatedAt: `${new Date()}`,
  };

  const mockGame: Game = {
    id: 1,
    pgn: "e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Be7 Re1 b5 Bb3 d6 c3 O-O h3 Nb8 d4 Nbd7 Nbd2 Bb7 Bc2 Re8 a4 Bf8 b4 g6 Bb2 Bg7 d5 c6 dxc6 Bxc6 c4 bxa4 Bxa4 Bxa4 Rxa4 Qc7 Qa1 Qb7 Nc4 Bf8 Nfd2 Rec8 f3 Nb6 Nxb6 Qxb6+ Kh1 Qf2 Rd1 Nh5 Nf1 Rc2 Ne3 Qxe3 Qb1 Qf2 Rg1 Rxb2 Qc1 Nf4 Qc6 Nxh3 Qxa8 Nxg1 Qxa6 Qxg2# 1-0",
    white: mockUser,
    black: mockUser,
    winner: "black",
    endReason: "checkmate",
    host: mockUser,
    code: "abc123",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    app = express();
    app.use(express.json());
    const controller = new GameController(mockGameServiceInstance as unknown as GameService);
    app.use("/api/v1/games", createGameRouter(controller));
    app.use(errorHandler);
  });

  describe("GET /api/v1/games/:code", () => {
    it("should return a game by code", async () => {
      mockGameServiceInstance.getActiveGame.mockResolvedValue(mockGame);

      const response = await request(app).get("/api/v1/games/1");

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toEqual(mockGame);
      expect(mockGameServiceInstance.getActiveGame).toHaveBeenCalledWith({
        where: { code: "1" },
      });
    });

    it("should return 404 when game is not found", async () => {
      mockGameServiceInstance.getActiveGame.mockResolvedValue(null);

      const response = await request(app).get("/api/v1/games/554");

      expect(response.status).toBe(StatusCodes.NOT_FOUND);
    });
  });
});
