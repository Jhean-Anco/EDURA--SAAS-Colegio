import { Module } from '@nestjs/common';
import { ConfiguracionAplicacion } from '../../configuracion/configuracion-aplicacion';
import { IdentidadAccesoModule } from '../identidad-acceso/identidad-acceso.module';
import {
  CONSULTADOR_DNI,
  ConsultadorDni,
} from './dominio/puertos/consultador-dni';
import {
  CONSULTADOR_RUC,
  ConsultadorRuc,
} from './dominio/puertos/consultador-ruc';
import {
  CALCULADOR_RUTAS,
  CalculadorRutas,
} from './dominio/puertos/calculador-rutas';
import { DniNoDisponible } from './infraestructura/proveedores-no-disponibles/dni-no-disponible';
import { RucNoDisponible } from './infraestructura/proveedores-no-disponibles/ruc-no-disponible';
import { RutasNoDisponible } from './infraestructura/proveedores-no-disponibles/rutas-no-disponible';
import { ApisperuDniAdaptador } from './infraestructura/apisperu/apisperu-dni.adaptador';
import { ApisperuRucAdaptador } from './infraestructura/apisperu/apisperu-ruc.adaptador';
import { GoogleRoutesApiAdaptador } from './infraestructura/google/google-routes-api.adaptador';
import { ConsultarDniCasoUso } from './aplicacion/consultar-dni.caso-uso';
import { ConsultarRucCasoUso } from './aplicacion/consultar-ruc.caso-uso';
import { CalcularRutaCasoUso } from './aplicacion/calcular-ruta.caso-uso';
import { IntegracionesControlador } from './presentacion/http/integraciones.controlador';

@Module({
  imports: [IdentidadAccesoModule],
  providers: [
    ConfiguracionAplicacion,
    DniNoDisponible,
    RucNoDisponible,
    RutasNoDisponible,
    ApisperuDniAdaptador,
    ApisperuRucAdaptador,
    GoogleRoutesApiAdaptador,
    {
      provide: CONSULTADOR_DNI,
      useFactory: (
        config: ConfiguracionAplicacion,
        apisperu: ApisperuDniAdaptador,
        noDisponible: DniNoDisponible,
      ): ConsultadorDni =>
        config.integracionDocumentosHabilitada ? apisperu : noDisponible,
      inject: [ConfiguracionAplicacion, ApisperuDniAdaptador, DniNoDisponible],
    },
    {
      provide: CONSULTADOR_RUC,
      useFactory: (
        config: ConfiguracionAplicacion,
        apisperu: ApisperuRucAdaptador,
        noDisponible: RucNoDisponible,
      ): ConsultadorRuc =>
        config.integracionDocumentosHabilitada ? apisperu : noDisponible,
      inject: [ConfiguracionAplicacion, ApisperuRucAdaptador, RucNoDisponible],
    },
    {
      provide: CALCULADOR_RUTAS,
      useFactory: (
        config: ConfiguracionAplicacion,
        google: GoogleRoutesApiAdaptador,
        noDisponible: RutasNoDisponible,
      ): CalculadorRutas =>
        config.integracionRutasHabilitada ? google : noDisponible,
      inject: [
        ConfiguracionAplicacion,
        GoogleRoutesApiAdaptador,
        RutasNoDisponible,
      ],
    },
    {
      provide: ConsultarDniCasoUso,
      useFactory: (consultadorDni: ConsultadorDni) =>
        new ConsultarDniCasoUso(consultadorDni),
      inject: [CONSULTADOR_DNI],
    },
    {
      provide: ConsultarRucCasoUso,
      useFactory: (consultadorRuc: ConsultadorRuc) =>
        new ConsultarRucCasoUso(consultadorRuc),
      inject: [CONSULTADOR_RUC],
    },
    {
      provide: CalcularRutaCasoUso,
      useFactory: (calculadorRutas: CalculadorRutas) =>
        new CalcularRutaCasoUso(calculadorRutas),
      inject: [CALCULADOR_RUTAS],
    },
  ],
  controllers: [IntegracionesControlador],
})
export class IntegracionesExternasModule {}
