import { z } from "zod";

// Validador de número de WhatsApp brasileiro (limpo apenas com dígitos: 10 ou 11 números)
export const whatsappSchema = z
  .string()
  .min(10, "Número de WhatsApp deve ter pelo menos 10 dígitos (DDD + número)")
  .max(15, "Número de WhatsApp inválido")
  .transform((val) => val.replace(/\D/g, ""));

// Schema para login
export const loginSchema = z.object({
  whatsapp: whatsappSchema,
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

// Schema para cadastro
export const registerSchema = z.object({
  name: z.string().min(3, "Nome completo deve ter pelo menos 3 caracteres"),
  whatsapp: whatsappSchema,
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
