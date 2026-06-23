import { ForbiddenException, BadRequestException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { RepositorioAuditoria } from '../../dominio/puertos/repositorios';
import { EventoAuditoria } from '../../dominio/auditoria/evento-auditoria';
import { ServicioTokenAccesoJwt } from '../../infraestructura/tokens/servicio-token-acceso-jwt';
import { ContextoAcceso } from '../../dominio/puertos/repositorios';
import { PayloadAcceso } from '../../dominio/valores/payload-acceso';
import { ConsultadorPermisosEfectivos } from '../../../../compartido/infraestructura/persistencia/consultador-permisos.typeorm';

export interface SeleccionarContextoEntrada {
  usuarioId: string;
  sesionId: string;
  contexto: ContextoAcceso;
  versionSeguridad: number;
  canalAcceso?: 'PLATAFORMA' | 'INSTITUCION';
  institucionAccesoId?: string | null;
}

export interface SeleccionarContextoSalida {
  accessToken: string;
  contexto: ContextoAcceso;
  permisos: string[];
}

export class SeleccionarContextoCasoUso {
  constructor(
    private readonly contextos: {
      listarPorUsuario(usuarioId: string): Promise<ContextoAcceso[]>;
    },
    private readonly auditoria: RepositorioAuditoria,
    private readonly tokenAcceso: ServicioTokenAccesoJwt,
    private readonly jwtAccesoTtlSegundos: number,
    private readonly consultadorPermisos: ConsultadorPermisosEfectivos,
  ) {}

  async ejecutar(
    entrada: SeleccionarContextoEntrada,
  ): Promise<SeleccionarContextoSalida> {
    if (!entrada.contexto || !entrada.contexto.rolId) {
      throw new BadRequestException(
        'El rolId es obligatorio para seleccionar un contexto.',
      );
    }
    const disponibles = await this.contextos.listarPorUsuario(
      entrada.usuarioId,
    );
    const coincidencia = disponibles.find(
      (contexto) =>
        contexto.ambito === entrada.contexto.ambito &&
        contexto.rolId === entrada.contexto.rolId &&
        contexto.institucionId === entrada.contexto.institucionId &&
        contexto.sedeId === entrada.contexto.sedeId,
    );
    if (!coincidencia) {
      throw new ForbiddenException('CONTEXTO_NO_AUTORIZADO');
    }

    // Validar aislamiento de canal de acceso y tenant
    if (entrada.canalAcceso === 'PLATAFORMA' && coincidencia.ambito !== 'PLATAFORMA') {
      throw new ForbiddenException('CONTEXTO_NO_AUTORIZADO');
    }
    if (entrada.canalAcceso === 'INSTITUCION' && coincidencia.institucionId !== entrada.institucionAccesoId) {
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
        canalAcceso: entrada.canalAcceso,
        institucionAccesoId: entrada.institucionAccesoId,
      } satisfies PayloadAcceso,
      this.jwtAccesoTtlSegundos,
    );
    const permisosEfectivos = await this.consultadorPermisos.listar({
      usuarioId: entrada.usuarioId,
      rolId: coincidencia.rolId,
      institucionId: coincidencia.institucionId,
      sedeId: coincidencia.sedeId,
    });
    await this.auditoria.registrar(
      new EventoAuditoria(
        randomUUID(),
        'CONTEXTO_SELECCIONADO',
        'autenticacion',
        'EXITO',
      ),
    );
    return {
      accessToken,
      contexto: coincidencia,
      permisos: permisosEfectivos,
    };
  }
}
