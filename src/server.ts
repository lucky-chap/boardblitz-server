import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";
import { pino } from "pino";

import { authRouter } from "@/api/auth/authRouter";
import { gameRouter } from "@/api/game/gameRouter";
import { userRouter } from "@/api/user/userRouter";
import errorHandler from "@/common/middleware/errorHandler";
import rateLimiter from "@/common/middleware/rateLimiter";
import requestLogger from "@/common/middleware/requestLogger";
import { env } from "@/common/utils/envConfig";
import { initializeTables } from "@/db";
import session from "express-session";
import { Server } from "socket.io";
import sessionMiddleware from "./common/middleware/session";

export const corsConfig = {
  origin: env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true,
};

export const logger = pino({ name: "server start" });
const app: Express = express();

export const server = app
  .listen(env.PORT, () => {
    logger.info(`Server (${env.NODE_ENV}) running on port http://${env.HOST}:${env.PORT}`);
  })
  .on("error", (err) => {
    console.error("Failed to start server:", err);
  });

const onCloseSignal = () => {
  logger.info("sigint received, shutting down");
  server.close(() => {
    logger.info("server closed");
    process.exit();
  });
  setTimeout(() => process.exit(1), 10000).unref(); // Force shutdown after 10s
};

process.on("SIGINT", onCloseSignal);
process.on("SIGTERM", onCloseSignal);

// database initialization
initializeTables()
  .then(() => logger.info("Database tables initialized"))
  .catch((error) => logger.error(error));

// Set the application to trust the reverse proxy
app.set("trust proxy", true);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsConfig));
app.use(helmet());
app.use(rateLimiter);

// Request logging
app.use(requestLogger);

// Session
app.use(sessionMiddleware);

// Routes
const v1Router = express.Router();

// V1 routes
v1Router.use("/test", (_req, res) => {
  res.status(200).json({
    message: "Hello World",
  });
});
v1Router.use("/auth", authRouter);
v1Router.use("/users", userRouter);
v1Router.use("/games", gameRouter);

app.use("/v1", v1Router);

// Error handlers
app.use(errorHandler());

// socket.io
export const io = new Server(server, {
  cors: corsConfig,
  pingInterval: 30000,
  pingTimeout: 50000,
});
io.use((socket, next) => {
  (session as any)(socket.request, {} as any, next);
});
io.use((socket, next) => {
  const session = socket.request.session;
  if (session?.user) {
    next();
  } else {
    console.log("io.use: no session");
    socket.disconnect();
  }
});
