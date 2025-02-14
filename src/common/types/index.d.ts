export interface User {
  id?: number | string; // ID for guest players
  name?: string | null;
  email?: string;
  password?: string | null;
  profile_picture?: string;
  banner_picture?: string;
  wins?: number;
  losses?: number;
  draws?: number;

  // player fields (not spectators)
  connected?: boolean;
  disconnectedOn?: number;
}

export interface Game {
  id?: number;
  pgn?: string;
  white?: User;
  white_name?: string;
  black?: User;
  black_name?: string;
  winner?: "white" | "black" | "draw";
  endReason?: "draw" | "checkmate" | "stalemate" | "repetition" | "insufficient" | "abandoned";
  host?: User;
  code?: string;
  unlisted?: boolean;
  timeout?: number;
  observers?: User[];
  startedAt?: number;
  endedAt?: number;
}
