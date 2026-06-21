import { z } from 'zod';

export const esquemaCrearPlan = z.object({
  idAnioAcademico: z.string().uuid('Selecciona un año académico'),
  idGradoEducativo: z.string().uuid('Selecciona un grado educativo'),
  codigo: z
    .string()
    .min(1, 'El código es obligatorio')
    .max(40, 'El código no puede superar 40 caracteres')
    .trim(),
  nombre: z
    .string()
    .min(1, 'El nombre es obligatorio')
    .max(180, 'El nombre no puede superar 180 caracteres')
    .trim(),
  observacion: z
    .string()
    .max(500, 'La observación no puede superar 500 caracteres')
    .trim()
    .nullish()
    .transform((v) => v ?? null),
});

export const esquemaActualizarPlan = z.object({
  codigo: z
    .string()
    .min(1, 'El código es obligatorio')
    .max(40, 'El código no puede superar 40 caracteres')
    .trim()
    .optional(),
  nombre: z
    .string()
    .min(1, 'El nombre es obligatorio')
    .max(180, 'El nombre no puede superar 180 caracteres')
    .trim()
    .optional(),
  observacion: z
    .string()
    .max(500, 'La observación no puede superar 500 caracteres')
    .trim()
    .nullish()
    .transform((v) => v ?? null),
});

export const esquemaDuplicarPlan = z.object({
  idAnioAcademico: z.string().uuid('Selecciona un año académico').optional(),
  codigo: z
    .string()
    .min(1, 'El código es obligatorio')
    .max(40, 'El código no puede superar 40 caracteres')
    .trim(),
  nombre: z
    .string()
    .min(1, 'El nombre es obligatorio')
    .max(180, 'El nombre no puede superar 180 caracteres')
    .trim(),
  observacion: z
    .string()
    .max(500, 'La observación no puede superar 500 caracteres')
    .trim()
    .nullish()
    .transform((v) => v ?? null),
});

export type CrearPlanFormValues = z.infer<typeof esquemaCrearPlan>;
export type ActualizarPlanFormValues = z.infer<typeof esquemaActualizarPlan>;
export type DuplicarPlanFormValues = z.infer<typeof esquemaDuplicarPlan>;
