import { asyncHandler } from "@/common/middleware/asyncHandler";
import { Router } from "express";
import { type AuthController, defaultAuthControllerInstance } from "./authController";

export function createAuthRouter(controller?: AuthController) {
  const router = Router();
  const routeController = controller ?? defaultAuthControllerInstance;

  // Session management routes
  router.get(
    "/session",
    asyncHandler((req, res) => routeController.getCurrentSession(req, res)),
  );
  router.post(
    "/guest",
    asyncHandler((req, res) => routeController.guestSession(req, res)),
  );
  router.post(
    "/register",
    asyncHandler((req, res) => routeController.registerUser(req, res)),
  );
  router.post(
    "/login",
    asyncHandler((req, res) => routeController.loginUser(req, res)),
  );
  router.put(
    "/",
    asyncHandler((req, res) => routeController.updateUser(req, res)),
  );
  router.post(
    "/logout",
    asyncHandler((req, res) => routeController.logoutSession(req, res)),
  );

  return router;
}

export const authRouter = createAuthRouter();
