import { SetMetadata } from '@nestjs/common';

export const ES_PUBLICO = 'ES_PUBLICO';
export const Publico = (): MethodDecorator & ClassDecorator =>
  SetMetadata(ES_PUBLICO, true);
