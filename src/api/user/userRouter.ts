import { type UserController, defaultUserControllerInstance } from "@/api/user/userController";
import { asyncHandler } from "@/common/middleware/asyncHandler";
import { Router } from "express";
import { defaultUserServiceInstance } from "./userService";

// Create router function to ensure routes are set up after any potential mocks
export function createUserRouter(controller?: UserController) {
  const router = Router();
  // for some reason, now using "new UserController()" throws an error of
  // UserController not being a constructor. So I had to remove that code.
  // This happens when I try to test the app

  // const routeController = controller || new UserController(); // this doesn't work
  // const routeController = controller ?? new UserController(); // used to work, now it doesn't
  // when testing the app but the one below works.
  // Since controller can be undefined, I set up a default user controller
  // instance to prevent undefined errors.
  const routeController = controller ?? defaultUserControllerInstance;

  router.get(
    "/",
    asyncHandler((req, res) => routeController!.getUsers(req, res)),
  );
  router.get(
    "/:id",
    asyncHandler((req, res) => routeController!.getUserById(req, res)),
  );
  router.get(
    "/check/:email",
    asyncHandler((req, res) => routeController!.getUserByEmail(req, res)),
  );
  router.post(
    "/",
    asyncHandler((req, res) => routeController!.createUser(req, res)),
  );
  router.put(
    "/:id",
    asyncHandler((req, res) => routeController!.updateUser(req, res)),
  );
  router.delete(
    "/:id",
    asyncHandler((req, res) => routeController!.deleteUser(req, res)),
  );

  return router;
}

export const userRouter = createUserRouter();
