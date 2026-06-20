/* eslint-disable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  EstudiantesConsulta,
  ListadoEstudiantesEntrada,
  FichaEstudiante,
} from '../../../../dominio/puertos/estudiantes.puerto';
import { EstudianteResumen } from '../../../../dominio/estudiantes/estudiante';

@Injectable()
export class EstudiantesTypeormConsulta implements EstudiantesConsulta {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  async listar(
    entrada: ListadoEstudiantesEntrada,
  ): Promise<{ datos: EstudianteResumen[]; total: number }> {
    const qb = this.ds
      .createQueryBuilder()
      .from('estudiantes', 'e')
      .innerJoin('sedes', 's', 's.id = e.id_sede')
      .innerJoin('personas', 'p', 'p.id = e.id_persona')
      .leftJoin(
        'documentos_identidad_persona',
        'd',
        "d.id_persona = p.id AND d.es_principal = true AND d.estado = 'ACTIVO'",
      )
      .select([
        'e.id as id',
        'e.codigo as codigo',
        'e.estado as estado',
        's.id as sede_id',
        's.codigo as sede_codigo',
        's.nombre as sede_nombre',
        'p.id as persona_id',
        'p.nombres as nombres',
        'p.apellido_paterno as apellido_paterno',
        'p.apellido_materno as apellido_materno',
        'd.id as documento_id',
        'd.numero as documento_numero',
        'd.id_tipo_documento as documento_tipo_id',
      ])
      .where('e.id_institucion_educativa = :inst', {
        inst: entrada.institucionId,
      });
    if (entrada.sedeId)
      qb.andWhere('e.id_sede = :sede', { sede: entrada.sedeId });
    if (entrada.estado)
      qb.andWhere('e.estado = :estado', { estado: entrada.estado });
    if (entrada.busqueda)
      qb.andWhere(
        '(unaccent(lower(p.nombres)) like unaccent(lower(:q)) or unaccent(lower(p.apellido_paterno)) like unaccent(lower(:q)) or unaccent(lower(p.apellido_materno)) like unaccent(lower(:q)) or e.codigo ilike :q)',
        { q: `%${entrada.busqueda}%` },
      );
    const total = await qb.getCount();
    const rows = await qb
      .orderBy('e.fecha_creacion', 'DESC')
      .skip((entrada.pagina - 1) * entrada.limite)
      .take(entrada.limite)
      .getRawMany();
    return {
      total,
      datos: rows.map((r) => ({
        id: r.id,
        codigo: r.codigo,
        estado: r.estado,
        sede: { id: r.sede_id, codigo: r.sede_codigo, nombre: r.sede_nombre },
        persona: {
          id: r.persona_id,
          nombres: r.nombres,
          apellidoPaterno: r.apellido_paterno,
          apellidoMaterno: r.apellido_materno,
        },
        documentoPrincipal: r.documento_id
          ? {
              id: r.documento_id,
              tipoDocumento: r.documento_tipo_id,
              numero: r.documento_numero,
            }
          : null,
      })),
    };
  }

  async obtener(
    id: string,
    institucionId: string,
  ): Promise<FichaEstudiante | null> {
    const estudiante = await this.ds
      .createQueryBuilder()
      .from('estudiantes', 'e')
      .innerJoin('sedes', 's', 's.id = e.id_sede')
      .innerJoin('personas', 'p', 'p.id = e.id_persona')
      .where('e.id = :id AND e.id_institucion_educativa = :inst', {
        id,
        inst: institucionId,
      })
      .select([
        'e.id as id',
        'e.codigo as codigo',
        'e.estado as estado',
        'e.fecha_ingreso as fecha_ingreso',
        'e.fecha_retiro as fecha_retiro',
        'e.observacion as observacion',
        's.id as sede_id',
        's.codigo as sede_codigo',
        's.nombre as sede_nombre',
        'p.id as persona_id',
        'p.nombres as nombres',
        'p.apellido_paterno as apellido_paterno',
        'p.apellido_materno as apellido_materno',
      ])
      .getRawOne();
    if (!estudiante) return null;
    const docsPersona = await this.ds.query(
      `SELECT d.id, t.nombre as "tipoDocumento", d.numero, d.es_principal as "esPrincipal", d.estado FROM documentos_identidad_persona d LEFT JOIN tipos_documento_identidad t ON t.id = d.id_tipo_documento WHERE d.id_persona = $1 AND d.id_institucion_educativa = $2 ORDER BY d.es_principal DESC, d.fecha_creacion DESC`,
      [estudiante.persona_id, institucionId],
    );
    const medios = await this.ds.query(
      `SELECT id, tipo, valor, es_principal as "esPrincipal", estado FROM medios_contacto_persona WHERE id_persona = $1 AND id_institucion_educativa = $2 ORDER BY es_principal DESC, fecha_creacion DESC`,
      [estudiante.persona_id, institucionId],
    );
    const apoderados = await this.ds.query(
      `SELECT id, id_persona as "idPersona", parentesco, es_principal as "esPrincipal", puede_recoger as "puedeRecoger", recibe_comunicaciones as "recibeComunicaciones", estado FROM apoderados_estudiante WHERE id_estudiante = $1 AND id_institucion_educativa = $2 ORDER BY es_principal DESC, fecha_creacion DESC`,
      [id, institucionId],
    );
    const docsAdmin = await this.ds.query(
      `SELECT id, tipo_documento as "tipoDocumento", nombre, estado FROM documentos_estudiante WHERE id_estudiante = $1 AND id_institucion_educativa = $2 ORDER BY fecha_creacion DESC`,
      [id, institucionId],
    );
    return {
      estudiante: {
        id: estudiante.id,
        codigo: estudiante.codigo,
        estado: estudiante.estado,
        fechaIngreso: estudiante.fecha_ingreso,
        fechaRetiro: estudiante.fecha_retiro,
        observacion: estudiante.observacion,
      },
      persona: {
        id: estudiante.persona_id,
        nombres: estudiante.nombres,
        apellidoPaterno: estudiante.apellido_paterno,
        apellidoMaterno: estudiante.apellido_materno,
      },
      sede: {
        id: estudiante.sede_id,
        codigo: estudiante.sede_codigo,
        nombre: estudiante.sede_nombre,
      },
      documentosIdentidadPersona: docsPersona,
      mediosContactoPersona: medios,
      apoderados,
      documentosAdministrativos: docsAdmin,
    };
  }
}
