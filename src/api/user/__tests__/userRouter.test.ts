import errorHandler from "@/common/middleware/errorHandler";
import express from "express";
import { StatusCodes } from "http-status-codes";
import request from "supertest";
import { UserController } from "../userController";
import { createUserRouter } from "../userRouter";
import { UserService } from "../userService";

// Mock the UserService
vi.mock("../userService");

// Create a mock instance of UserService
const mockUserServiceInstance = {
  findMany: vi.fn(),
  findUnique: vi.fn(),
  findByEmail: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

// Mock the constructor to return our mock instance
vi.mocked(UserService).mockImplementation(() => mockUserServiceInstance as any);

describe("User Router", () => {
  let app: express.Express;

  const mockUser = {
    id: 1,
    email: "test@example.com",
    name: "Test User",
    createdAt: `${new Date()}`,
    updatedAt: `${new Date()}`,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    app = express();
    app.use(express.json());
    const controller = new UserController(mockUserServiceInstance as unknown as UserService);
    app.use("/api/users", createUserRouter(controller));
    app.use(errorHandler);
  });

  describe("GET /api/users", () => {
    it("should return all users", async () => {
      const mockUsers = [mockUser];
      mockUserServiceInstance.findMany.mockResolvedValue(mockUsers);

      const response = await request(app).get("/api/users");

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toEqual(mockUsers);
      expect(mockUserServiceInstance.findMany).toHaveBeenCalled();
    });
  });

  describe("GET /api/users/:id", () => {
    it("should return a user by id", async () => {
      mockUserServiceInstance.findUnique.mockResolvedValue(mockUser);

      const response = await request(app).get("/api/users/1");

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toEqual(mockUser);
      expect(mockUserServiceInstance.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it("should return 404 when user is not found", async () => {
      mockUserServiceInstance.findUnique.mockResolvedValue(null);

      const response = await request(app).get("/api/users/hh");

      expect(response.status).toBe(StatusCodes.NOT_FOUND);
    });
  });

  describe("GET /api/users/check/:email", () => {
    it("should return 200 when user with that email already exists", async () => {
      mockUserServiceInstance.findByEmail.mockResolvedValue(mockUser);

      const response = await request(app).get("/api/users/check/test@example.com");

      expect(response.status).toBe(StatusCodes.OK);
      // expect(response.body).toEqual({
      //   message: "An account with that email already exists",
      // });
      expect(mockUserServiceInstance.findByEmail).toHaveBeenCalledWith({
        where: { email: "test@example.com" },
      });
    });

    it("should return null if no user with that email exists", async () => {
      mockUserServiceInstance.findByEmail.mockResolvedValue(null);

      const response = await request(app).get("/api/users/check/quavo@example.com");

      // expect(response.status).toBe(StatusCodes.NOT_FOUND);

      expect(response.body).toEqual(null);
    });
  });

  describe("POST /api/users", () => {
    it("should create a new user", async () => {
      const newUser = {
        email: "new@example.com",
        name: "New User",
      };
      mockUserServiceInstance.create.mockResolvedValue({
        ...mockUser,
        ...newUser,
      });

      const response = await request(app).post("/api/users").send(newUser);

      expect(response.status).toBe(StatusCodes.CREATED);
      expect(response.body).toMatchObject(newUser);
      expect(mockUserServiceInstance.create).toHaveBeenCalledWith({
        data: newUser,
      });
    });
  });

  describe("PUT /api/users/:id", () => {
    it("should update an existing user", async () => {
      const updateData = {
        name: "Updated Name",
      };
      mockUserServiceInstance.update.mockResolvedValue({
        ...mockUser,
        ...updateData,
      });

      const response = await request(app).put("/api/users/1").send(updateData);

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toMatchObject(updateData);
      expect(mockUserServiceInstance.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateData,
      });
    });

    it("should return 404 when updating non-existent user", async () => {
      mockUserServiceInstance.update.mockRejectedValue(new Error("User not found"));

      const response = await request(app).put("/api/users/hh").send({ name: "Updated Name" });

      expect(response.status).toBe(StatusCodes.NOT_FOUND);
    });
  });

  describe("DELETE /api/users/:id", () => {
    it("should delete an existing user", async () => {
      mockUserServiceInstance.delete.mockResolvedValue(mockUser);

      const response = await request(app).delete("/api/users/1");

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toEqual(mockUser);
      expect(mockUserServiceInstance.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it("should return 404 when deleting non-existent user", async () => {
      mockUserServiceInstance.delete.mockRejectedValue(new Error("User not found"));

      const response = await request(app).delete("/api/users/hh");

      expect(response.status).toBe(StatusCodes.NOT_FOUND);
    });
  });
});
