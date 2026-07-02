import { z } from "zod";

export const auraPasswordSchema = z
  .string()
  .min(8, "Le mot de passe doit contenir au moins 8 caractères.")
  .refine((value) => new TextEncoder().encode(value).length <= 72, "Le mot de passe est trop long pour bcrypt.");

export const authLoginInputSchema = z.object({
  username: z.string().min(1, "Saisissez votre nom d'utilisateur."),
  password: z.string().min(1, "Saisissez votre mot de passe."),
});

export type AuthLoginInput = z.infer<typeof authLoginInputSchema>;
