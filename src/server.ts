import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";
import { pino } from "pino";

import { userRouter } from "@/api/user/userRouter";
import errorHandler from "@/common/middleware/errorHandler";
import rateLimiter from "@/common/middleware/rateLimiter";
import requestLogger from "@/common/middleware/requestLogger";
import { env } from "@/common/utils/envConfig";
import { initializeTables } from "@/db";

export const corsConfig = {
  origin: env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true,
};

const logger = pino({ name: "server start" });
const app: Express = express();

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

// Routes
app.use("/api/test", (_req, res) => {
  res.status(200).json({
    message: "Hello World",
  });
});

app.use("/api/users", userRouter);

// Error handlers
app.use(errorHandler());

export { app, logger };
