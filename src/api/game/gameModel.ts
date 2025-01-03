import { z } from "zod";

export const GameSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  releaseDate: z.date(),
  genre: z.string(),
  price: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Game = z.infer<typeof GameSchema>;
