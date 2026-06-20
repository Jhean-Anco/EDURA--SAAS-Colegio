import { SetMetadata } from '@nestjs/common';

export const PERMISOS_REQUERIDOS = 'PERMISOS_REQUERIDOS';

export const Permisos = (
  ...permisos: string[]
): MethodDecorator & ClassDecorator =>
  SetMetadata(PERMISOS_REQUERIDOS, permisos);
