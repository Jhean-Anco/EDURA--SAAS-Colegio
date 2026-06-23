import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResolvedorPuntoAccesoInstitucion } from '../../dominio/puertos/puertos';
import {
  RepositorioIdentidadVisual,
  RepositorioVersionesIdentidad,
} from '../../dominio/puertos/repositorios';
import { InstitucionEducativaTypeormEntidad } from '../../../estructura-institucional/infraestructura/persistencia/typeorm/entidades/institucion-educativa.typeorm-entidad';

@Injectable()
export class ResolverExperienciaAccesoConsulta {
  constructor(
    @Inject('RESOLVEDOR_PUNTO_ACCESO_INSTITUCION')
    private readonly resolvedor: ResolvedorPuntoAccesoInstitucion,
    @Inject('REPOSITORIO_IDENTIDAD_VISUAL')
    private readonly identidadRepo: RepositorioIdentidadVisual,
    @Inject('REPOSITORIO_VERSIONES_IDENTIDAD')
    private readonly versionesRepo: RepositorioVersionesIdentidad,
    @InjectRepository(InstitucionEducativaTypeormEntidad)
    private readonly institucionRepo: Repository<InstitucionEducativaTypeormEntidad>,
  ) {}

  async ejecutar(tipo: string, identificador: string) {
    const acceso = await this.resolvedor.resolver(tipo, identificador);

    if (acceso.tipoAcceso === 'PLATAFORMA') {
      return {
        tipoAcceso: 'PLATAFORMA',
        identidadVisual: {
          nombreMarca: 'EDURA',
        },
      };
    }

    if (!acceso.institucionId) {
      throw new NotFoundException('Punto de acceso no encontrado o institución inactiva.');
    }

    const institucion = await this.institucionRepo.findOne({
      where: { id: acceso.institucionId },
    });

    if (!institucion) {
      throw new NotFoundException('Institución no encontrada.');
    }

    const identidad = await this.identidadRepo.buscarPorInstitucion(acceso.institucionId);
    let versionPublicada = null;

    if (identidad?.idVersionPublicada && identidad.estado === 'ACTIVA') {
      versionPublicada = await this.versionesRepo.buscarPublicada(identidad.id);
    }

    const fallbackTema = {
      version: 0,
      nombreMarca: institucion.nombreLegal,
      lema: 'Plataforma Educativa EDURA',
      tituloLogin: `Bienvenido a ${institucion.nombreLegal}`,
      mensajeLogin: 'Accede a tus servicios educativos.',
      textoPieLogin: 'Tecnología provista por EDURA',
      colorPrimario: '#1E3A8A',
      colorSobrePrimario: '#FFFFFF',
      colorSecundario: '#D8A72D',
      colorAcento: '#3B82F6',
      colorFondo: '#F8FAFC',
      colorSuperficie: '#FFFFFF',
      colorTextoPrincipal: '#172033',
      colorTextoSecundario: '#536078',
      logoPrincipalUrl: null,
      faviconUrl: null,
      fondoLoginUrl: null,
    };

    if (!versionPublicada) {
      return {
        tipoAcceso: 'INSTITUCION',
        identificador: acceso.identificadorNormalizado,
        institucion: {
          nombreMarca: institucion.nombreLegal,
          nombreShort: institucion.nombreCorto || institucion.nombreLegal,
        },
        identidadVisual: fallbackTema,
      };
    }

    // Buscamos los urls de activos
    const logoActivo = versionPublicada.activos.find((a) => a.tipo === 'LOGO_PRINCIPAL' && a.estado === 'ACTIVO');
    const faviconActivo = versionPublicada.activos.find((a) => a.tipo === 'FAVICON' && a.estado === 'ACTIVO');
    const fondoActivo = versionPublicada.activos.find((a) => a.tipo === 'FONDO_LOGIN' && a.estado === 'ACTIVO');

    return {
      tipoAcceso: 'INSTITUCION',
      identificador: acceso.identificadorNormalizado,
      institucion: {
        nombreMarca: versionPublicada.nombreMarca,
        nombreShort: versionPublicada.nombreCortoVisual || institucion.nombreCorto || versionPublicada.nombreMarca,
      },
      identidadVisual: {
        version: versionPublicada.numeroVersion,
        nombreMarca: versionPublicada.nombreMarca,
        lema: versionPublicada.lema,
        tituloLogin: versionPublicada.tituloLogin || fallbackTema.tituloLogin,
        mensajeLogin: versionPublicada.mensajeLogin || fallbackTema.mensajeLogin,
        textoPieLogin: versionPublicada.textoPieLogin || fallbackTema.textoPieLogin,
        colorPrimario: versionPublicada.colorPrimario,
        colorSobrePrimario: versionPublicada.colorSobrePrimario,
        colorSecundario: versionPublicada.colorSecundario,
        colorAcento: versionPublicada.colorAcento,
        colorFondo: versionPublicada.colorFondo,
        colorSuperficie: versionPublicada.colorSuperficie,
        colorTextoPrincipal: versionPublicada.colorTextoPrincipal,
        colorTextoSecundario: versionPublicada.colorTextoSecundario,
        logoPrincipalUrl: logoActivo ? `/api/v1/publico/activos/${logoActivo.claveAlmacenamiento}` : null,
        faviconUrl: faviconActivo ? `/api/v1/publico/activos/${faviconActivo.claveAlmacenamiento}` : null,
        fondoLoginUrl: fondoActivo ? `/api/v1/publico/activos/${fondoActivo.claveAlmacenamiento}` : null,
      },
    };
  }
}
