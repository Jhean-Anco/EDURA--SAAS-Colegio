import { z } from 'zod';

const TIPOS_DETALLE = ['OBLIGATORIA', 'ELECTIVA'] as const;

export const esquemaAgregarDetalle = z.object({
  idAsignatura: z.string().uuid('Selecciona una asignatura'),
  tipo: z.enum(TIPOS_DETALLE, { message: 'Selecciona el tipo de asignatura' }),
  horasSemanales: z
    .number({ invalid_type_error: 'Ingresa un número válido' })
    .int('Las horas deben ser un número entero')
    .min(1, 'Las horas semanales deben ser al menos 1'),
  horasAnuales: z
    .number({ invalid_type_error: 'Ingresa un número válido' })
    .int('Las horas deben ser un número entero')
    .min(1, 'Las horas anuales deben ser al menos 1'),
  orden: z
    .number({ invalid_type_error: 'Ingresa un número válido' })
    .int('El orden debe ser un número entero')
    .min(1, 'El orden debe ser al menos 1'),
  observacion: z
    .string()
    .max(500, 'La observación no puede superar 500 caracteres')
    .trim()
    .nullish()
    .transform((v) => v ?? null),
});

export const esquemaActualizarDetalle = z.object({
  tipo: z.enum(TIPOS_DETALLE).optional(),
  horasSemanales: z
    .number({ invalid_type_error: 'Ingresa un número válido' })
    .int()
    .min(1, 'Las horas semanales deben ser al menos 1')
    .optional(),
  horasAnuales: z
    .number({ invalid_type_error: 'Ingresa un número válido' })
    .int()
    .min(1, 'Las horas anuales deben ser al menos 1')
    .optional(),
  orden: z
    .number({ invalid_type_error: 'Ingresa un número válido' })
    .int()
    .min(1, 'El orden debe ser al menos 1')
    .optional(),
  observacion: z
    .string()
    .max(500)
    .trim()
    .nullish()
    .transform((v) => v ?? null),
});

export type AgregarDetalleFormValues = z.infer<typeof esquemaAgregarDetalle>;
export type ActualizarDetalleFormValues = z.infer<typeof esquemaActualizarDetalle>;
