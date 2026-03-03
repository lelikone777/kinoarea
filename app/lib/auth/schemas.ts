import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .min(1, "Email обязателен")
  .email("Введите корректный email");

export const nicknameSchema = z
  .string()
  .trim()
  .min(3, "Никнейм минимум 3 символа")
  .max(32, "Никнейм максимум 32 символа")
  .regex(/^[a-zA-Z0-9_.-]+$/, "Допустимы только буквы, цифры, _, ., -");

export const passwordSchema = z
  .string()
  .min(8, "Пароль минимум 8 символов")
  .max(72, "Пароль слишком длинный");

export const registerSchema = z
  .object({
    email: emailSchema,
    nickname: nicknameSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Введите пароль"),
});

export const profileUpdateSchema = z.object({
  nickname: nicknameSchema.optional(),
  avatarUrl: z.string().trim().url("Некорректный URL аватара").optional(),
});

export const passwordUpdateSchema = z
  .object({
    currentPassword: z.string().min(1, "Введите текущий пароль"),
    newPassword: passwordSchema,
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Пароли не совпадают",
    path: ["confirmNewPassword"],
  });
