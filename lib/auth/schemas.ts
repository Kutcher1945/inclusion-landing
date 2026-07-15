import { z } from "zod";

export const loginCredentialsSchema = z.object({
  username: z.string().trim().min(1, "Введите имя пользователя"),
  password: z.string().min(1, "Введите пароль"),
});

export type LoginCredentials = z.infer<typeof loginCredentialsSchema>;

export const currentUserSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string(),
  first_name: z.string().default(""),
  last_name: z.string().default(""),
  is_staff: z.boolean(),
});

export type CurrentUser = z.infer<typeof currentUserSchema>;
