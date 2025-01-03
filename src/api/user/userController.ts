import type { UserService } from "@/api/user/userService";
import { HttpError } from "@/common/errors/HttpError";
import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

export class UserController {
  private service: UserService;

  constructor(service: UserService) {
    this.service = service;
  }

  async getUsers(req: Request, res: Response): Promise<void> {
    const users = await this.service.findMany();
    res.status(StatusCodes.OK).json(users);
  }

  async getUserById(req: Request, res: Response): Promise<void> {
    try {
      if (!/^\d+$/.test(req.params.id)) {
        throw new HttpError("User not found", StatusCodes.NOT_FOUND);
      }
      const id = Number.parseInt(req.params.id);
      const user = await this.service.findUnique({ where: { id } });
      res.json(user);
    } catch (error) {
      if (error instanceof HttpError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  }

  async getUserByEmail(req: Request, res: Response): Promise<void> {
    try {
      if (req.params.email === undefined) {
        throw new HttpError("Email field is required", StatusCodes.CONFLICT);
      }
      const email = req.params.email;
      const user = await this.service.findByEmail({
        where: { email },
      });
      res.json(user);
    } catch (error) {
      if (error instanceof HttpError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  }

  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const user = await this.service.create({ data: req.body });
      res.status(StatusCodes.CREATED).json(user);
    } catch (error) {
      if (error instanceof HttpError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal server error" });
      }
    }
  }

  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      if (!/^\d+$/.test(req.params.id)) {
        throw new HttpError("User not found", StatusCodes.NOT_FOUND);
      }
      const id = Number.parseInt(req.params.id);
      const user = await this.service.update({
        where: { id },
        data: req.body,
      });
      res.json(user);
    } catch (error) {
      if (error instanceof HttpError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal server error" });
      }
    }
  }

  async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      if (!/^\d+$/.test(req.params.id)) {
        throw new HttpError("User not found", StatusCodes.NOT_FOUND);
      }
      const id = Number.parseInt(req.params.id);
      const user = await this.service.delete({ where: { id } });
      res.json(user);
    } catch (error) {
      if (error instanceof HttpError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal server error" });
      }
    }
  }
}

// export const defaultUserControllerInstance = new UserController();
