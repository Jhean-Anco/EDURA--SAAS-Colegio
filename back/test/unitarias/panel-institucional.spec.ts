import { ForbiddenException } from '@nestjs/common';
import { ObtenerResumenPanelInstitucionalConsulta } from '../../src/modulos/panel-institucional/aplicacion/obtener-resumen-panel-institucional.consulta';
import { PanelInstitucionalConsulta } from '../../src/modulos/panel-institucional/dominio/puertos/panel-institucional.consulta';

describe('ObtenerResumenPanelInstitucionalConsulta', () => {
  const respuestaBase = {
    institucion: { id: 'inst-1', codigo: 'IE-01', nombre: 'Institucion 1' },
    sede: null,
    periodoAcademico: null,
    indicadores: {
      totalSedesActivas: 1,
      totalUsuariosActivos: 1,
      totalEspaciosFisicosActivos: 1,
      infraestructuraPorEstado: [],
      alertasPendientes: [],
      comunicadosRecientes: [],
      totalEstudiantesActivos: null,
      totalDocentesActivos: null,
      matriculasPorEstado: [],
      asistenciaDelDia: null,
    },
    fechaActualizacion: new Date('2026-01-01T00:00:00.000Z').toISOString(),
  } as const;

  function crearConsulta() {
    const consulta: jest.Mocked<PanelInstitucionalConsulta> = {
      obtenerResumen: jest.fn().mockResolvedValue(respuestaBase),
    };
    return {
      consulta,
      casoUso: new ObtenerResumenPanelInstitucionalConsulta(consulta),
    };
  }

  it('permite consultar con institución válida', async () => {
    const { casoUso, consulta } = crearConsulta();
    const resultado = await casoUso.ejecutar(
      {
        usuarioId: 'usr-1',
        sesionId: 'ses-1',
        versionSeguridad: 1,
        tipoToken: 'ACCESO',
        ambito: 'INSTITUCION',
        rolId: 'rol-1',
        institucionId: 'inst-1',
        sedeId: null,
      },
      {},
    );

    expect(resultado).toEqual(respuestaBase);
    expect(consulta.obtenerResumen.mock.calls[0]?.[0]).toEqual({
      usuarioId: 'usr-1',
      institucionId: 'inst-1',
      sedeId: null,
      idPeriodoAcademico: null,
    });
  });

  it('fuerza la sede del contexto cuando el rol es de sede', async () => {
    const { casoUso, consulta } = crearConsulta();
    await casoUso.ejecutar(
      {
        usuarioId: 'usr-1',
        sesionId: 'ses-1',
        versionSeguridad: 1,
        tipoToken: 'ACCESO',
        ambito: 'SEDE',
        rolId: 'rol-1',
        institucionId: 'inst-1',
        sedeId: 'sede-1',
      },
      { sedeId: undefined, idPeriodoAcademico: 'per-1' },
    );

    expect(consulta.obtenerResumen.mock.calls[0]?.[0]).toEqual({
      usuarioId: 'usr-1',
      institucionId: 'inst-1',
      sedeId: 'sede-1',
      idPeriodoAcademico: 'per-1',
    });
  });

  it('rechaza cuando la sede solicitada no coincide con la sede del contexto', async () => {
    const { casoUso } = crearConsulta();
    await expect(
      Promise.resolve().then(() =>
        casoUso.ejecutar(
          {
            usuarioId: 'usr-1',
            sesionId: 'ses-1',
            versionSeguridad: 1,
            tipoToken: 'ACCESO',
            ambito: 'SEDE',
            rolId: 'rol-1',
            institucionId: 'inst-1',
            sedeId: 'sede-1',
          },
          { sedeId: 'sede-2' },
        ),
      ),
    ).rejects.toThrow(ForbiddenException);
  });

  it('rechaza sin contexto institucional', async () => {
    const { casoUso } = crearConsulta();
    await expect(
      Promise.resolve().then(() => casoUso.ejecutar(undefined, {})),
    ).rejects.toThrow(ForbiddenException);
  });

  it('mantiene la estructura estable sin datos sensibles', async () => {
    const { casoUso } = crearConsulta();
    const resultado = await casoUso.ejecutar(
      {
        usuarioId: 'usr-1',
        sesionId: 'ses-1',
        versionSeguridad: 1,
        tipoToken: 'ACCESO',
        ambito: 'INSTITUCION',
        rolId: 'rol-1',
        institucionId: 'inst-1',
        sedeId: null,
      },
      {},
    );

    expect(JSON.stringify(resultado)).not.toContain('correo');
    expect(JSON.stringify(resultado)).not.toContain('token');
    expect(JSON.stringify(resultado)).not.toContain('clave');
  });
});
