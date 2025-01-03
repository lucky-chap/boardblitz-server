import { type GameController, defaultGameControllerInstance } from "@/api/game/gameController";
import { asyncHandler } from "@/common/middleware/asyncHandler";
import { Router } from "express";

// Create router function to ensure routes are set up after any potential mocks
export function createGameRouter(controller?: GameController) {
  const router = Router();
  const routeController = controller ?? defaultGameControllerInstance;

  router.get(
    "/",
    asyncHandler((req, res) => routeController.getGames(req, res)),
  );
  router.get(
    "/:code",
    asyncHandler((req, res) => routeController.getActiveGame(req, res)),
  );
  router.post(
    "/",
    asyncHandler((req, res) => routeController.createNewGame(req, res)),
  );

  return router;
}

export const gameRouter = createGameRouter();
