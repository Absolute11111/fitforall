import { z } from "zod"

export const onboardingSchema = z.object({
  name: z.string().min(2, "Prénom requis"),
  age: z.coerce.number().min(13).max(100),
  gender: z.enum(["male", "female", "other"]).optional(),
  heightCm: z.coerce.number().min(100).max(250),
  currentWeightKg: z.coerce.number().min(30).max(300),
  targetWeightKg: z.coerce.number().min(30).max(300),
  targetWeeks: z.coerce.number().min(4).max(52).default(16),
  goals: z.array(z.enum(["FAT_LOSS", "MUSCLE_GAIN", "RECOMPOSITION", "HEALTH", "ENDURANCE"])).min(1, "Choisis au moins un objectif"),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  sessionDuration: z.coerce.number().min(15).max(90),
  sessionsPerWeek: z.coerce.number().min(1).max(7),
  equipment: z.array(z.string()).default([]),
  injuries: z.string().optional(),
  useWhey: z.boolean().default(false),
  useCreatine: z.boolean().default(false),
})

export type OnboardingValues = z.input<typeof onboardingSchema>

export const registerSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Mot de passe min 8 caractères"),
  name: z.string().min(2, "Prénom requis"),
})

export type RegisterValues = z.infer<typeof registerSchema>

export const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
})

export type LoginValues = z.infer<typeof loginSchema>

export const measurementSchema = z.object({
  weightKg: z.coerce.number().min(30).max(300).optional(),
  waistCm: z.coerce.number().min(40).max(200).optional(),
  energyLevel: z.coerce.number().min(1).max(5).optional(),
})

export type MeasurementValues = z.infer<typeof measurementSchema>

export const workoutLogSchema = z.object({
  programSessionId: z.string().optional(),
  durationMin: z.coerce.number().min(1).max(300).optional(),
  rpe: z.coerce.number().min(1).max(10).optional(),
  feedback: z.string().optional(),
  notes: z.string().optional(),
})

export type WorkoutLogValues = z.infer<typeof workoutLogSchema>
