import { CrearAnioAcademicoCasoUso } from '../../src/modulos/estructura-academica/aplicacion/calendario/crear-anio-academico.caso-uso';
import { CrearPeriodoAcademicoCasoUso } from '../../src/modulos/estructura-academica/aplicacion/calendario/crear-periodo-academico.caso-uso';
import { CambiarEstadoAnioAcademicoCasoUso } from '../../src/modulos/estructura-academica/aplicacion/calendario/cambiar-estado-anio-academico.caso-uso';
import { CrearSeccionAcademicaCasoUso } from '../../src/modulos/estructura-academica/aplicacion/oferta/crear-seccion-academica.caso-uso';
import {
  AlcanceAcceso,
  RepositorioCalendarioAcademico,
  RepositorioOfertaAcademica,
} from '../../src/modulos/estructura-academica/dominio/puertos/estructura-academica.puerto';
import {
  AnioAcademicoNoEncontradoError,
  AnioAcademicoYaExisteError,
  AnioEnCursoYaExisteError,
  EspacioFisicoFueraDeSedeError,
  OfertaGradoSedeNoEncontradaError,
  PeriodoCodigoDuplicadoError,
  PeriodoSolapamientoError,
  TransicionAnioInvalidaError,
  TutorFueraDeSedeError,
} from '../../src/modulos/estructura-academica/dominio/errores-estructura-academica';

const ALCANCE_INST: AlcanceAcceso = {
  usuarioId: 'u1',
  institucionId: 'i1',
  ambito: 'INSTITUCION',
  sedeId: null,
};

const ALCANCE_SEDE: AlcanceAcceso = {
  usuarioId: 'u1',
  institucionId: 'i1',
  ambito: 'SEDE',
  sedeId: 'sede-a',
};

function mockRepoCalendario(
  overrides: Partial<RepositorioCalendarioAcademico> = {},
): jest.Mocked<RepositorioCalendarioAcademico> {
  return {
    existeAnioEnInstitucion: jest.fn().mockResolvedValue(false),
    existeCodigoAnioEnInstitucion: jest.fn().mockResolvedValue(false),
    existeAnioActivo: jest.fn().mockResolvedValue(false),
    crearAnioAcademico: jest.fn().mockResolvedValue({ id: 'a1' }),
    obtenerAnioBase: jest
      .fn()
      .mockResolvedValue({ id: 'a1', estado: 'PLANIFICADO', anio: 2026 }),
    actualizarAnioAcademico: jest.fn().mockResolvedValue(true),
    cambiarEstadoAnio: jest.fn().mockResolvedValue(true),
    existePeriodoActivoEnAnio: jest.fn().mockResolvedValue(false),
    existeCodigoPeriodoEnAnio: jest.fn().mockResolvedValue(false),
    existeOrdenPeriodoEnAnio: jest.fn().mockResolvedValue(false),
    existeSolapamientoPeriodo: jest.fn().mockResolvedValue(false),
    crearPeriodoAcademico: jest.fn().mockResolvedValue({ id: 'p1' }),
    obtenerPeriodoBase: jest
      .fn()
      .mockResolvedValue({ id: 'p1', estado: 'PLANIFICADO' }),
    actualizarPeriodoAcademico: jest.fn().mockResolvedValue(true),
    cambiarEstadoPeriodo: jest.fn().mockResolvedValue(true),
    ...overrides,
  } as unknown as jest.Mocked<RepositorioCalendarioAcademico>;
}

function mockRepoOferta(
  overrides: Partial<RepositorioOfertaAcademica> = {},
): jest.Mocked<RepositorioOfertaAcademica> {
  return {
    existeOfertaEnSede: jest.fn().mockResolvedValue(false),
    crearOfertaGradoSede: jest.fn().mockResolvedValue({ id: 'o1' }),
    obtenerOfertaBase: jest
      .fn()
      .mockResolvedValue({ id: 'o1', estado: 'ACTIVA', idSede: 'sede-a' }),
    actualizarOferta: jest.fn().mockResolvedValue(true),
    existeSeccionEnOferta: jest.fn().mockResolvedValue(false),
    crearSeccionAcademica: jest.fn().mockResolvedValue({ id: 's1' }),
    obtenerSeccionBase: jest.fn().mockResolvedValue({
      id: 's1',
      estado: 'ACTIVA',
      idOfertaGradoSede: 'o1',
      idSede: 'sede-a',
    }),
    actualizarSeccion: jest.fn().mockResolvedValue(true),
    verificarEspacioFisicoEnSede: jest.fn().mockResolvedValue(true),
    verificarDocenteTutorEnSede: jest.fn().mockResolvedValue(true),
    ...overrides,
  } as unknown as jest.Mocked<RepositorioOfertaAcademica>;
}

describe('CrearAnioAcademicoCasoUso', () => {
  it('CP-EA-001: crea año académico válido', async () => {
    const repo = mockRepoCalendario();
    const caso = new CrearAnioAcademicoCasoUso(repo);
    await expect(
      caso.ejecutar(
        {
          anio: 2026,
          codigo: '2026',
          nombre: 'Año Académico 2026',
          fechaInicio: '2026-03-01',
          fechaFin: '2026-12-20',
        },
        ALCANCE_INST,
      ),
    ).resolves.toEqual({ id: 'a1' });
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(repo.crearAnioAcademico).toHaveBeenCalledTimes(1);
  });

  it('CP-EA-002: rechaza si año ya existe', async () => {
    const repo = mockRepoCalendario({
      existeAnioEnInstitucion: jest.fn().mockResolvedValue(true),
    });
    const caso = new CrearAnioAcademicoCasoUso(repo);
    await expect(
      caso.ejecutar(
        {
          anio: 2026,
          codigo: '2026',
          nombre: 'Año Académico 2026',
          fechaInicio: '2026-03-01',
          fechaFin: '2026-12-20',
        },
        ALCANCE_INST,
      ),
    ).rejects.toBeInstanceOf(AnioAcademicoYaExisteError);
  });

  it('CP-EA-003: rechaza si código ya existe', async () => {
    const repo = mockRepoCalendario({
      existeCodigoAnioEnInstitucion: jest.fn().mockResolvedValue(true),
    });
    const caso = new CrearAnioAcademicoCasoUso(repo);
    await expect(
      caso.ejecutar(
        {
          anio: 2026,
          codigo: '2026',
          nombre: 'Año Académico 2026',
          fechaInicio: '2026-03-01',
          fechaFin: '2026-12-20',
        },
        ALCANCE_INST,
      ),
    ).rejects.toBeInstanceOf(AnioAcademicoYaExisteError);
  });

  it('CP-EA-004: rechaza si se quiere crear en ACTIVO y ya hay un año activo', async () => {
    const repo = mockRepoCalendario({
      existeAnioActivo: jest.fn().mockResolvedValue(true),
    });
    const caso = new CrearAnioAcademicoCasoUso(repo);
    await expect(
      caso.ejecutar(
        {
          anio: 2026,
          codigo: '2026',
          nombre: 'Año Académico 2026',
          fechaInicio: '2026-03-01',
          fechaFin: '2026-12-20',
          estado: 'ACTIVO',
        },
        ALCANCE_INST,
      ),
    ).rejects.toBeInstanceOf(AnioEnCursoYaExisteError);
  });
});

describe('CrearPeriodoAcademicoCasoUso', () => {
  it('CP-EA-005: crea período académico válido', async () => {
    const repo = mockRepoCalendario();
    const caso = new CrearPeriodoAcademicoCasoUso(repo);
    await expect(
      caso.ejecutar(
        {
          idAnioAcademico: 'a1',
          codigo: 'B1',
          nombre: 'Primer Bimestre',
          tipo: 'BIMESTRE',
          orden: 1,
          fechaInicio: '2026-03-01',
          fechaFin: '2026-04-30',
        },
        ALCANCE_INST,
      ),
    ).resolves.toEqual({ id: 'p1' });
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(repo.crearPeriodoAcademico).toHaveBeenCalledTimes(1);
  });

  it('CP-EA-006: rechaza si año académico no existe', async () => {
    const repo = mockRepoCalendario({
      obtenerAnioBase: jest.fn().mockResolvedValue(null),
    });
    const caso = new CrearPeriodoAcademicoCasoUso(repo);
    await expect(
      caso.ejecutar(
        {
          idAnioAcademico: 'a1',
          codigo: 'B1',
          nombre: 'Primer Bimestre',
          tipo: 'BIMESTRE',
          orden: 1,
          fechaInicio: '2026-03-01',
          fechaFin: '2026-04-30',
        },
        ALCANCE_INST,
      ),
    ).rejects.toBeInstanceOf(AnioAcademicoNoEncontradoError);
  });

  it('CP-EA-007: rechaza si código de período está duplicado', async () => {
    const repo = mockRepoCalendario({
      existeCodigoPeriodoEnAnio: jest.fn().mockResolvedValue(true),
    });
    const caso = new CrearPeriodoAcademicoCasoUso(repo);
    await expect(
      caso.ejecutar(
        {
          idAnioAcademico: 'a1',
          codigo: 'B1',
          nombre: 'Primer Bimestre',
          tipo: 'BIMESTRE',
          orden: 1,
          fechaInicio: '2026-03-01',
          fechaFin: '2026-04-30',
        },
        ALCANCE_INST,
      ),
    ).rejects.toBeInstanceOf(PeriodoCodigoDuplicadoError);
  });

  it('CP-EA-008: rechaza si el orden está duplicado', async () => {
    const repo = mockRepoCalendario({
      existeOrdenPeriodoEnAnio: jest.fn().mockResolvedValue(true),
    });
    const caso = new CrearPeriodoAcademicoCasoUso(repo);
    await expect(
      caso.ejecutar(
        {
          idAnioAcademico: 'a1',
          codigo: 'B1',
          nombre: 'Primer Bimestre',
          tipo: 'BIMESTRE',
          orden: 1,
          fechaInicio: '2026-03-01',
          fechaFin: '2026-04-30',
        },
        ALCANCE_INST,
      ),
    ).rejects.toBeInstanceOf(PeriodoCodigoDuplicadoError);
  });

  it('CP-EA-009: rechaza si hay solapamiento de fechas', async () => {
    const repo = mockRepoCalendario({
      existeSolapamientoPeriodo: jest.fn().mockResolvedValue(true),
    });
    const caso = new CrearPeriodoAcademicoCasoUso(repo);
    await expect(
      caso.ejecutar(
        {
          idAnioAcademico: 'a1',
          codigo: 'B1',
          nombre: 'Primer Bimestre',
          tipo: 'BIMESTRE',
          orden: 1,
          fechaInicio: '2026-03-01',
          fechaFin: '2026-04-30',
        },
        ALCANCE_INST,
      ),
    ).rejects.toBeInstanceOf(PeriodoSolapamientoError);
  });
});

describe('CambiarEstadoAnioAcademicoCasoUso', () => {
  it('CP-EA-010: cambia estado del año correctamente', async () => {
    const repo = mockRepoCalendario();
    const caso = new CambiarEstadoAnioAcademicoCasoUso(repo);
    await expect(
      caso.ejecutar('a1', 'ACTIVO', ALCANCE_INST),
    ).resolves.toBeUndefined();
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(repo.cambiarEstadoAnio).toHaveBeenCalledWith('a1', 'i1', 'ACTIVO');
  });

  it('CP-EA-011: rechaza transición de estado inválida', async () => {
    const repo = mockRepoCalendario({
      obtenerAnioBase: jest
        .fn()
        .mockResolvedValue({ id: 'a1', estado: 'CERRADO', anio: 2026 }),
    });
    const caso = new CambiarEstadoAnioAcademicoCasoUso(repo);
    await expect(
      caso.ejecutar('a1', 'ACTIVO', ALCANCE_INST),
    ).rejects.toBeInstanceOf(TransicionAnioInvalidaError);
  });

  it('CP-EA-012: rechaza activación si ya existe un año activo', async () => {
    const repo = mockRepoCalendario({
      existeAnioActivo: jest.fn().mockResolvedValue(true),
    });
    const caso = new CambiarEstadoAnioAcademicoCasoUso(repo);
    await expect(
      caso.ejecutar('a1', 'ACTIVO', ALCANCE_INST),
    ).rejects.toBeInstanceOf(AnioEnCursoYaExisteError);
  });
});

describe('CrearSeccionAcademicaCasoUso', () => {
  it('CP-EA-013: crea sección válida', async () => {
    const repo = mockRepoOferta();
    const caso = new CrearSeccionAcademicaCasoUso(repo);
    await expect(
      caso.ejecutar(
        {
          idOfertaGradoSede: 'o1',
          codigo: 'A',
          nombre: 'A',
          turno: 'MANANA',
        },
        ALCANCE_INST,
      ),
    ).resolves.toEqual({ id: 's1' });
  });

  it('CP-EA-014: rechaza si espacio físico no pertenece a la sede de la oferta', async () => {
    const repo = mockRepoOferta({
      verificarEspacioFisicoEnSede: jest.fn().mockResolvedValue(false),
    });
    const caso = new CrearSeccionAcademicaCasoUso(repo);
    await expect(
      caso.ejecutar(
        {
          idOfertaGradoSede: 'o1',
          codigo: 'A',
          nombre: 'A',
          turno: 'MANANA',
          idEspacioFisico: 'ef-otro',
        },
        ALCANCE_INST,
      ),
    ).rejects.toBeInstanceOf(EspacioFisicoFueraDeSedeError);
  });

  it('CP-EA-015: rechaza si docente tutor no pertenece a la sede de la oferta', async () => {
    const repo = mockRepoOferta({
      verificarDocenteTutorEnSede: jest.fn().mockResolvedValue(false),
    });
    const caso = new CrearSeccionAcademicaCasoUso(repo);
    await expect(
      caso.ejecutar(
        {
          idOfertaGradoSede: 'o1',
          codigo: 'A',
          nombre: 'A',
          turno: 'MANANA',
          idDocenteTutor: 'doc-otro',
        },
        ALCANCE_INST,
      ),
    ).rejects.toBeInstanceOf(TutorFueraDeSedeError);
  });

  it('CP-EA-016: restringe creación por alcance de sede', async () => {
    const repo = mockRepoOferta({
      obtenerOfertaBase: jest.fn().mockResolvedValue({
        id: 'o1',
        estado: 'ACTIVA',
        idSede: 'sede-diferente',
      }),
    });
    const caso = new CrearSeccionAcademicaCasoUso(repo);
    await expect(
      caso.ejecutar(
        {
          idOfertaGradoSede: 'o1',
          codigo: 'A',
          nombre: 'A',
          turno: 'MANANA',
        },
        ALCANCE_SEDE,
      ),
    ).rejects.toBeInstanceOf(OfertaGradoSedeNoEncontradaError);
  });
});
