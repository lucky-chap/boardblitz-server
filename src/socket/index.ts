import type { Socket } from "socket.io";

import { io } from "@/index";
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
};

export const setupSocket = () => {
  io.on("connection", socketConnect);
};
