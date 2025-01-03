import type { User } from "@/common/types";
import PGSimple from "connect-pg-simple";
import type { Session } from "express-session";
import session from "express-session";
import { nanoid } from "nanoid";

import { pool } from "@/db";

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
  store: new PGSession({ pool: pool, createTableIfMissing: true }),
  secret: process.env.SESSION_SECRET || "super duper secret",
  resave: false,
  saveUninitialized: false,
  name: "boardblitz",
  proxy: true,
  cookie: {
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  },
  genid: () => nanoid(21),
});

export default sessionMiddleware;
