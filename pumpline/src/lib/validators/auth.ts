import { z } from "zod/v4";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters"),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const providerRegisterSchema = z.object({
  // Account info
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  // Business info
  businessName: z.string().min(2, "Business name is required"),
  phone: z.string().min(10, "Phone number is required"),
  bio: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  licenseNumber: z.string().optional(),
  yearsInBusiness: z.coerce.number().int().min(0).optional(),
  responseTime: z.string().optional(),
  // Service areas
  zipCodes: z.array(z.string().min(5)).min(1, "At least one service area is required"),
  // Services
  services: z
    .array(
      z.object({
        serviceTypeId: z.string(),
        priceMin: z.coerce.number().min(0).optional(),
        priceMax: z.coerce.number().min(0).optional(),
        priceUnit: z.string().optional(),
      })
    )
    .min(1, "At least one service is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ProviderRegisterInput = z.infer<typeof providerRegisterSchema>;
