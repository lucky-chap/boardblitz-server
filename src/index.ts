import { env } from "@/common/utils/envConfig";
import { app, corsConfig, logger } from "@/server";
import session from "express-session";
import { Server } from "socket.io";
import { setupSocket } from "./socket";

const server = app.listen(env.PORT, () => {
  const { NODE_ENV, HOST, PORT } = env;
  logger.info(`Server (${NODE_ENV}) running on port http://${HOST}:${PORT}`);
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

// socket setup
setupSocket();
