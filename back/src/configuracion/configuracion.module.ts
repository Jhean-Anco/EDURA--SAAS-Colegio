import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { variablesEntornoEsquema } from './variables-entorno.esquema';
import { ConfiguracionAplicacion } from './configuracion-aplicacion';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      expandVariables: true,
      validate: (variables) => {
        const resultado = variablesEntornoEsquema.validate(variables, {
          abortEarly: false,
          allowUnknown: true,
          convert: true,
        });
        if (resultado.error) {
          throw resultado.error;
        }
        return resultado.value as Record<string, unknown>;
      },
    }),
  ],
  providers: [ConfiguracionAplicacion],
  exports: [ConfiguracionAplicacion],
})
export class ConfiguracionModule {}
