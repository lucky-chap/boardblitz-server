import type { Socket } from "socket.io";

import { io } from "@/server";
import { chat, claimAbandoned, getLatestGame, joinAsPlayer, joinLobby, leaveLobby, sendMove } from "./gameSocket";

const socketConnect = (socket: Socket) => {
  const req = socket.request;

  socket.use((__, next) => {
    req.session.reload((err) => {
      if (err) {
        socket.disconnect();
      } else {
        next();
      }
    });
  });

  socket.on("disconnect", leaveLobby);

  socket.on("joinLobby", joinLobby);
  socket.on("leaveLobby", leaveLobby);

  socket.on("getLatestGame", getLatestGame);
  socket.on("sendMove", sendMove);
  socket.on("joinAsPlayer", joinAsPlayer);
  socket.on("chat", chat);
  socket.on("claimAbandoned", claimAbandoned);

  socket.on("connect_error", (error) => {
    console.error("Connection Error:", error);
  });

  socket.on("connect_timeout", () => {
    console.error("Connection Timeout");
  });

  socket.on("reconnect_attempt", () => {
    console.log("Attempting to reconnect...");
  });

  socket.on("connection", (socket, reason) => {
    console.log("Client connected:", socket.id);

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}, Reason: ${reason}`);
    });
  });
};

export const setupSocket = () => {
  io.on("connection", socketConnect);
};
