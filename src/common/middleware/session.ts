import type { User } from "@/common/types";
import PGSimple from "connect-pg-simple";
import { RedisStore } from "connect-redis";
import type { Session } from "express-session";
import session from "express-session";
import { nanoid } from "nanoid";
import { createClient } from "redis";

const client = createClient({
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: Number.parseInt(process.env.REDIS_PORT || "6379"),
  },
});

client.on("error", (err) => console.log("Redis Client Error", err));

client.connect();

import { pool } from "@/db";
import { env } from "../utils/envConfig";

const PGSession = PGSimple(session);

declare module "express-session" {
  // eslint-disable-next-line no-unused-vars
  interface SessionData {
    user: User;
  }
}
declare module "http" {
  // eslint-disable-next-line no-unused-vars
  interface IncomingMessage {
    session: Session & {
      user: User;
    };
  }
}
const sessionMiddleware = session({
  // store: new PGSession({
  //   pool: pool,
  //   createTableIfMissing: true,
  //   errorLog: (error) => {
  //     console.error("Session store error:", error);
  //   },
  //   tableName: "session",
  // }),
  store: new RedisStore({
    client: client,
  }),
  secret: env.SESSION_SECRET || "cat on my keyboard",
  resave: false,
  saveUninitialized: false,
  name: "boardblitz",
  proxy: undefined,
  cookie: {
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    // secure: process.env.NODE_ENV === "production",
    secure: false,
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    domain: process.env.NODE_ENV === "production" ? process.env.COOKIE_DOMAIN : "localhost",
  },
  genid: () => nanoid(21),
});

export default sessionMiddleware;
