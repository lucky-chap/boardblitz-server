import type { User } from "@/common/types";
import PGSimple from "connect-pg-simple";
import type { Session } from "express-session";
import session from "express-session";
import { nanoid } from "nanoid";

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
  store: new PGSession({
    pool: pool,
    createTableIfMissing: true,
    errorLog: console.error,
    tableName: "session",
  }),
  secret: env.SESSION_SECRET || "cat on my keyboard",
  resave: false,
  saveUninitialized: false,
  name: "boardblitz",
  proxy: true,
  cookie: {
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    secure: process.env.NODE_ENV === "production",
    // secure: false,
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? false : "lax",
  },
  genid: () => nanoid(21),
});

export default sessionMiddleware;
