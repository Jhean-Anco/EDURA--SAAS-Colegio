import { ForbiddenException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { RepositorioAuditoria } from '../../dominio/puertos/repositorios';
import { EventoAuditoria } from '../../dominio/auditoria/evento-auditoria';
import { ServicioTokenAccesoJwt } from '../../infraestructura/tokens/servicio-token-acceso-jwt';
import { ContextoAcceso } from '../../dominio/puertos/repositorios';
import { PayloadAcceso } from '../../dominio/valores/payload-acceso';

export interface SeleccionarContextoEntrada {
  usuarioId: string;
  sesionId: string;
  contexto: ContextoAcceso;
  versionSeguridad: number;
}

export interface SeleccionarContextoSalida {
  accessToken: string;
}

export class SeleccionarContextoCasoUso {
  constructor(
    private readonly contextos: {
      listarPorUsuario(usuarioId: string): Promise<ContextoAcceso[]>;
    },
    private readonly auditoria: RepositorioAuditoria,
    private readonly tokenAcceso: ServicioTokenAccesoJwt,
    private readonly jwtAccesoTtlSegundos: number,
  ) {}

  async ejecutar(
    entrada: SeleccionarContextoEntrada,
  ): Promise<SeleccionarContextoSalida> {
    const disponibles = await this.contextos.listarPorUsuario(
      entrada.usuarioId,
    );
    const coincidencia = disponibles.find(
      (contexto) =>
        contexto.ambito === entrada.contexto.ambito &&
        (!entrada.contexto.rolId || contexto.rolId === entrada.contexto.rolId) &&
        contexto.institucionId === entrada.contexto.institucionId &&
        contexto.sedeId === entrada.contexto.sedeId,
    );
    if (!coincidencia) {
      throw new ForbiddenException('CONTEXTO_NO_AUTORIZADO');
    }
    const accessToken = this.tokenAcceso.firmar(
      {
        sub: entrada.usuarioId,
        sid: entrada.sesionId,
        versionSeguridad: entrada.versionSeguridad,
        tipoToken: 'ACCESO',
        ambito: coincidencia.ambito,
        rolId: coincidencia.rolId,
        institucionId: coincidencia.institucionId,
        sedeId: coincidencia.sedeId,
      } satisfies PayloadAcceso,
      this.jwtAccesoTtlSegundos,
    );
    await this.auditoria.registrar(
      new EventoAuditoria(
        randomUUID(),
        'CONTEXTO_SELECCIONADO',
        'autenticacion',
        'EXITO',
      ),
    );
    return { accessToken };
  }
}
