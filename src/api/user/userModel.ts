import { z } from "zod";

export const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  wins: z.optional(z.number()),
  losses: z.optional(z.number()),
  draws: z.optional(z.number()),
  connected: z.optional(z.boolean()),
  disconnectedOn: z.optional(z.number()),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type User = z.infer<typeof UserSchema>;
