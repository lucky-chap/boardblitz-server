import type { User } from "@/common/types";
import PGSimple from "connect-pg-simple";
import { RedisStore } from "connect-redis";
import type { Session } from "express-session";
import session from "express-session";
import { nanoid } from "nanoid";
import { createClient } from "redis";

// init redis client
const redisClient = createClient();
redisClient.connect().catch(console.error);

// init redis store
const redisStore = new RedisStore({
  client: redisClient,
  prefix: "boardblitz:",
});

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
  //   errorLog: console.error,
  //   tableName: "session",
  // }),
  store: redisStore,
  secret: env.SESSION_SECRET || "cat on my keyboard",
  resave: true,
  saveUninitialized: false,
  name: "boardblitz",
  proxy: true,
  cookie: {
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    // secure: process.env.NODE_ENV === "production",
    secure: false,
    httpOnly: false,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  },
  genid: () => nanoid(21),
});

export default sessionMiddleware;
