import { GameDelegate } from "./gameDelegate";
import { UserDelegate } from "./userDelegate";

export const client = {
  user: new UserDelegate(),
  game: new GameDelegate(),
};
