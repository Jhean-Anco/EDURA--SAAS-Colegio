import { ConflictException, NotFoundException } from '@nestjs/common';
import { CrearAnioAcademicoCasoUso } from '../../src/modulos/periodos-academicos/aplicacion/anios/crear-anio-academico.caso-uso';
import { CambiarEstadoAnioCasoUso } from '../../src/modulos/periodos-academicos/aplicacion/anios/cambiar-estado-anio.caso-uso';
import { ListarAniosConsulta } from '../../src/modulos/periodos-academicos/aplicacion/anios/listar-anios.consulta';
import { ObtenerAnioConsulta } from '../../src/modulos/periodos-academicos/aplicacion/anios/obtener-anio.consulta';
import { CrearPeriodoAcademicoCasoUso } from '../../src/modulos/periodos-academicos/aplicacion/periodos/crear-periodo-academico.caso-uso';
import { CambiarEstadoPeriodoCasoUso } from '../../src/modulos/periodos-academicos/aplicacion/periodos/cambiar-estado-periodo.caso-uso';
import { ListarPeriodosConsulta } from '../../src/modulos/periodos-academicos/aplicacion/periodos/listar-periodos.consulta';
import { AnioAcademico } from '../../src/modulos/periodos-academicos/dominio/entidades/anio-academico';
import { PeriodoAcademico } from '../../src/modulos/periodos-academicos/dominio/entidades/periodo-academico';
import {
  RepositorioAniosAcademicos,
  RepositorioPeriodosAcademicos,
} from '../../src/modulos/periodos-academicos/dominio/puertos/repositorios';

const INST_A = 'inst-a-uuid';
const INST_B = 'inst-b-uuid';

function anioBase(overrides: Partial<AnioAcademico> = {}): AnioAcademico {
  return {
    id: 'anio-uuid',
    institucionId: INST_A,
    nombre: 'Año 2025',
    anio: 2025,
    fechaInicio: new Date('2025-03-01'),
    fechaFin: new Date('2025-12-31'),
    estado: 'PLANIFICADO',
    fechaCreacion: new Date(),
    fechaActualizacion: new Date(),
    ...overrides,
  };
}

function periodoBase(
  overrides: Partial<PeriodoAcademico> = {},
): PeriodoAcademico {
  return {
    id: 'periodo-uuid',
    anioAcademicoId: 'anio-uuid',
    institucionId: INST_A,
    nombre: 'Semestre I',
    tipo: 'SEMESTRE',
    orden: 1,
    fechaInicio: new Date('2025-03-01'),
    fechaFin: new Date('2025-07-31'),
    estado: 'PLANIFICADO',
    fechaCreacion: new Date(),
    fechaActualizacion: new Date(),
    ...overrides,
  };
}

function mockRepoAnios(
  overrides: Partial<RepositorioAniosAcademicos> = {},
): jest.Mocked<RepositorioAniosAcademicos> {
  return {
    guardar: jest.fn().mockResolvedValue(undefined),
    buscarPorId: jest.fn().mockResolvedValue(null),
    buscarPorAnio: jest.fn().mockResolvedValue(null),
    listar: jest.fn().mockResolvedValue([]),
    actualizarEstado: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  } as jest.Mocked<RepositorioAniosAcademicos>;
}

function mockRepoPeriodos(
  overrides: Partial<RepositorioPeriodosAcademicos> = {},
): jest.Mocked<RepositorioPeriodosAcademicos> {
  return {
    guardar: jest.fn().mockResolvedValue(undefined),
    buscarPorId: jest.fn().mockResolvedValue(null),
    listarPorAnio: jest.fn().mockResolvedValue([]),
    actualizarEstado: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  } as jest.Mocked<RepositorioPeriodosAcademicos>;
}

// ---------------------------------------------------------------------------
// CrearAnioAcademicoCasoUso
// ---------------------------------------------------------------------------
describe('CrearAnioAcademicoCasoUso', () => {
  it('rechaza cuando fecha fin <= fecha inicio', async () => {
    const repo = mockRepoAnios();
    const caso = new CrearAnioAcademicoCasoUso(repo);

    await expect(
      caso.ejecutar({
        id: 'id',
        institucionId: INST_A,
        nombre: 'Test',
        anio: 2025,
        fechaInicio: new Date('2025-06-01'),
        fechaFin: new Date('2025-01-01'),
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('rechaza cuando la fecha fin es igual a la fecha inicio', async () => {
    const repo = mockRepoAnios();
    const caso = new CrearAnioAcademicoCasoUso(repo);
    const mismaFecha = new Date('2025-03-01');

    await expect(
      caso.ejecutar({
        id: 'id',
        institucionId: INST_A,
        nombre: 'Test',
        anio: 2025,
        fechaInicio: mismaFecha,
        fechaFin: mismaFecha,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('rechaza cuando ya existe un año con el mismo número para la institución', async () => {
    const repo = mockRepoAnios({
      buscarPorAnio: jest.fn().mockResolvedValue(anioBase()),
    });
    const caso = new CrearAnioAcademicoCasoUso(repo);

    await expect(
      caso.ejecutar({
        id: 'nuevo-id',
        institucionId: INST_A,
        nombre: '2025 bis',
        anio: 2025,
        fechaInicio: new Date('2025-01-01'),
        fechaFin: new Date('2025-12-31'),
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('permite el mismo año en una institución diferente', async () => {
    const repo = mockRepoAnios({
      buscarPorAnio: jest.fn().mockResolvedValue(null),
    });
    const caso = new CrearAnioAcademicoCasoUso(repo);

    const resultado = await caso.ejecutar({
      id: 'nuevo-id',
      institucionId: INST_B,
      nombre: '2025',
      anio: 2025,
      fechaInicio: new Date('2025-01-01'),
      fechaFin: new Date('2025-12-31'),
    });

    expect(resultado.estado).toBe('PLANIFICADO');
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(repo.guardar).toHaveBeenCalledTimes(1);
  });

  it('crea el año en estado PLANIFICADO y lo persiste', async () => {
    const repo = mockRepoAnios();
    const caso = new CrearAnioAcademicoCasoUso(repo);

    const resultado = await caso.ejecutar({
      id: 'anio-1',
      institucionId: INST_A,
      nombre: 'Año 2026',
      anio: 2026,
      fechaInicio: new Date('2026-03-01'),
      fechaFin: new Date('2026-12-15'),
    });

    expect(resultado.estado).toBe('PLANIFICADO');
    expect(resultado.anio).toBe(2026);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(repo.guardar).toHaveBeenCalledWith(
      expect.objectContaining({ estado: 'PLANIFICADO' }),
    );
  });
});

// ---------------------------------------------------------------------------
// CambiarEstadoAnioCasoUso
// ---------------------------------------------------------------------------
describe('CambiarEstadoAnioCasoUso', () => {
  it('lanza NotFoundException cuando el año no existe', async () => {
    const repo = mockRepoAnios({
      buscarPorId: jest.fn().mockResolvedValue(null),
    });
    const caso = new CambiarEstadoAnioCasoUso(repo);

    await expect(
      caso.ejecutar('no-existe', INST_A, 'EN_CURSO'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('lanza ConflictException para transición inválida PLANIFICADO→CERRADO', async () => {
    const repo = mockRepoAnios({
      buscarPorId: jest
        .fn()
        .mockResolvedValue(anioBase({ estado: 'PLANIFICADO' })),
    });
    const caso = new CambiarEstadoAnioCasoUso(repo);

    await expect(
      caso.ejecutar('anio-uuid', INST_A, 'CERRADO'),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('permite PLANIFICADO→EN_CURSO', async () => {
    const repo = mockRepoAnios({
      buscarPorId: jest
        .fn()
        .mockResolvedValue(anioBase({ estado: 'PLANIFICADO' })),
    });
    const caso = new CambiarEstadoAnioCasoUso(repo);

    await caso.ejecutar('anio-uuid', INST_A, 'EN_CURSO');
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(repo.actualizarEstado).toHaveBeenCalledWith(
      'anio-uuid',
      INST_A,
      'EN_CURSO',
    );
  });

  it('permite EN_CURSO→CERRADO', async () => {
    const repo = mockRepoAnios({
      buscarPorId: jest
        .fn()
        .mockResolvedValue(anioBase({ estado: 'EN_CURSO' })),
    });
    const caso = new CambiarEstadoAnioCasoUso(repo);

    await caso.ejecutar('anio-uuid', INST_A, 'CERRADO');
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(repo.actualizarEstado).toHaveBeenCalledWith(
      'anio-uuid',
      INST_A,
      'CERRADO',
    );
  });

  it('no permite transición desde CERRADO (estado terminal)', async () => {
    const repo = mockRepoAnios({
      buscarPorId: jest.fn().mockResolvedValue(anioBase({ estado: 'CERRADO' })),
    });
    const caso = new CambiarEstadoAnioCasoUso(repo);

    await expect(
      caso.ejecutar('anio-uuid', INST_A, 'PLANIFICADO'),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('no permite transición desde ANULADO (estado terminal)', async () => {
    const repo = mockRepoAnios({
      buscarPorId: jest.fn().mockResolvedValue(anioBase({ estado: 'ANULADO' })),
    });
    const caso = new CambiarEstadoAnioCasoUso(repo);

    await expect(
      caso.ejecutar('anio-uuid', INST_A, 'EN_CURSO'),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('no permite acceder a año de otra institución (devuelve 404)', async () => {
    const repo = mockRepoAnios({
      buscarPorId: jest.fn().mockResolvedValue(null),
    });
    const caso = new CambiarEstadoAnioCasoUso(repo);

    await expect(
      caso.ejecutar('anio-uuid', INST_B, 'EN_CURSO'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});

// ---------------------------------------------------------------------------
// ListarAniosConsulta
// ---------------------------------------------------------------------------
describe('ListarAniosConsulta', () => {
  it('delega en el repositorio con el institucionId correcto', async () => {
    const anios = [anioBase()];
    const repo = mockRepoAnios({ listar: jest.fn().mockResolvedValue(anios) });
    const consulta = new ListarAniosConsulta(repo);

    const resultado = await consulta.ejecutar(INST_A);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(repo.listar).toHaveBeenCalledWith(INST_A);
    expect(resultado).toBe(anios);
  });
});

// ---------------------------------------------------------------------------
// ObtenerAnioConsulta
// ---------------------------------------------------------------------------
describe('ObtenerAnioConsulta', () => {
  it('lanza NotFoundException cuando el año no existe', async () => {
    const repo = mockRepoAnios({
      buscarPorId: jest.fn().mockResolvedValue(null),
    });
    const consulta = new ObtenerAnioConsulta(repo);

    await expect(consulta.ejecutar('no-existe', INST_A)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('retorna el año cuando existe', async () => {
    const anio = anioBase();
    const repo = mockRepoAnios({
      buscarPorId: jest.fn().mockResolvedValue(anio),
    });
    const consulta = new ObtenerAnioConsulta(repo);

    const resultado = await consulta.ejecutar('anio-uuid', INST_A);
    expect(resultado).toBe(anio);
  });
});

// ---------------------------------------------------------------------------
// CrearPeriodoAcademicoCasoUso
// ---------------------------------------------------------------------------
describe('CrearPeriodoAcademicoCasoUso', () => {
  it('rechaza cuando fecha fin <= fecha inicio del período', async () => {
    const repoAnios = mockRepoAnios({
      buscarPorId: jest.fn().mockResolvedValue(anioBase()),
    });
    const repoPeriodos = mockRepoPeriodos();
    const caso = new CrearPeriodoAcademicoCasoUso(repoAnios, repoPeriodos);

    await expect(
      caso.ejecutar({
        id: 'p1',
        anioAcademicoId: 'anio-uuid',
        institucionId: INST_A,
        nombre: 'S1',
        tipo: 'SEMESTRE',
        orden: 1,
        fechaInicio: new Date('2025-07-01'),
        fechaFin: new Date('2025-03-01'),
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('lanza NotFoundException si el año no existe en la institución', async () => {
    const repoAnios = mockRepoAnios({
      buscarPorId: jest.fn().mockResolvedValue(null),
    });
    const repoPeriodos = mockRepoPeriodos();
    const caso = new CrearPeriodoAcademicoCasoUso(repoAnios, repoPeriodos);

    await expect(
      caso.ejecutar({
        id: 'p1',
        anioAcademicoId: 'anio-uuid',
        institucionId: INST_A,
        nombre: 'S1',
        tipo: 'SEMESTRE',
        orden: 1,
        fechaInicio: new Date('2025-03-01'),
        fechaFin: new Date('2025-07-31'),
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rechaza agregar período a año CERRADO', async () => {
    const repoAnios = mockRepoAnios({
      buscarPorId: jest.fn().mockResolvedValue(anioBase({ estado: 'CERRADO' })),
    });
    const repoPeriodos = mockRepoPeriodos();
    const caso = new CrearPeriodoAcademicoCasoUso(repoAnios, repoPeriodos);

    await expect(
      caso.ejecutar({
        id: 'p1',
        anioAcademicoId: 'anio-uuid',
        institucionId: INST_A,
        nombre: 'S1',
        tipo: 'SEMESTRE',
        orden: 1,
        fechaInicio: new Date('2025-03-01'),
        fechaFin: new Date('2025-07-31'),
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('rechaza agregar período a año ANULADO', async () => {
    const repoAnios = mockRepoAnios({
      buscarPorId: jest.fn().mockResolvedValue(anioBase({ estado: 'ANULADO' })),
    });
    const repoPeriodos = mockRepoPeriodos();
    const caso = new CrearPeriodoAcademicoCasoUso(repoAnios, repoPeriodos);

    await expect(
      caso.ejecutar({
        id: 'p1',
        anioAcademicoId: 'anio-uuid',
        institucionId: INST_A,
        nombre: 'S1',
        tipo: 'SEMESTRE',
        orden: 1,
        fechaInicio: new Date('2025-03-01'),
        fechaFin: new Date('2025-07-31'),
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('rechaza fechas del período fuera del rango del año', async () => {
    const repoAnios = mockRepoAnios({
      buscarPorId: jest.fn().mockResolvedValue(
        anioBase({
          fechaInicio: new Date('2025-03-01'),
          fechaFin: new Date('2025-12-31'),
        }),
      ),
    });
    const repoPeriodos = mockRepoPeriodos();
    const caso = new CrearPeriodoAcademicoCasoUso(repoAnios, repoPeriodos);

    await expect(
      caso.ejecutar({
        id: 'p1',
        anioAcademicoId: 'anio-uuid',
        institucionId: INST_A,
        nombre: 'S1',
        tipo: 'SEMESTRE',
        orden: 1,
        fechaInicio: new Date('2025-01-01'),
        fechaFin: new Date('2025-06-30'),
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('crea período en estado PLANIFICADO cuando todo es válido', async () => {
    const repoAnios = mockRepoAnios({
      buscarPorId: jest.fn().mockResolvedValue(anioBase()),
    });
    const repoPeriodos = mockRepoPeriodos();
    const caso = new CrearPeriodoAcademicoCasoUso(repoAnios, repoPeriodos);

    const resultado = await caso.ejecutar({
      id: 'p1',
      anioAcademicoId: 'anio-uuid',
      institucionId: INST_A,
      nombre: 'Semestre I',
      tipo: 'SEMESTRE',
      orden: 1,
      fechaInicio: new Date('2025-03-01'),
      fechaFin: new Date('2025-07-31'),
    });

    expect(resultado.estado).toBe('PLANIFICADO');
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(repoPeriodos.guardar).toHaveBeenCalledTimes(1);
  });
});

// ---------------------------------------------------------------------------
// CambiarEstadoPeriodoCasoUso
// ---------------------------------------------------------------------------
describe('CambiarEstadoPeriodoCasoUso', () => {
  it('lanza NotFoundException cuando el período no existe', async () => {
    const repo = mockRepoPeriodos({
      buscarPorId: jest.fn().mockResolvedValue(null),
    });
    const caso = new CambiarEstadoPeriodoCasoUso(repo);

    await expect(
      caso.ejecutar('no-existe', INST_A, 'EN_CURSO'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('permite PLANIFICADO→EN_CURSO', async () => {
    const repo = mockRepoPeriodos({
      buscarPorId: jest
        .fn()
        .mockResolvedValue(periodoBase({ estado: 'PLANIFICADO' })),
    });
    const caso = new CambiarEstadoPeriodoCasoUso(repo);

    await caso.ejecutar('periodo-uuid', INST_A, 'EN_CURSO');
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(repo.actualizarEstado).toHaveBeenCalledWith(
      'periodo-uuid',
      INST_A,
      'EN_CURSO',
    );
  });

  it('lanza ConflictException para transición inválida PLANIFICADO→CERRADO', async () => {
    const repo = mockRepoPeriodos({
      buscarPorId: jest
        .fn()
        .mockResolvedValue(periodoBase({ estado: 'PLANIFICADO' })),
    });
    const caso = new CambiarEstadoPeriodoCasoUso(repo);

    await expect(
      caso.ejecutar('periodo-uuid', INST_A, 'CERRADO'),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('no permite transición desde CERRADO (estado terminal)', async () => {
    const repo = mockRepoPeriodos({
      buscarPorId: jest
        .fn()
        .mockResolvedValue(periodoBase({ estado: 'CERRADO' })),
    });
    const caso = new CambiarEstadoPeriodoCasoUso(repo);

    await expect(
      caso.ejecutar('periodo-uuid', INST_A, 'EN_CURSO'),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('no puede acceder a período de otra institución (devuelve 404)', async () => {
    const repo = mockRepoPeriodos({
      buscarPorId: jest.fn().mockResolvedValue(null),
    });
    const caso = new CambiarEstadoPeriodoCasoUso(repo);

    await expect(
      caso.ejecutar('periodo-uuid', INST_B, 'EN_CURSO'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});

// ---------------------------------------------------------------------------
// ListarPeriodosConsulta
// ---------------------------------------------------------------------------
describe('ListarPeriodosConsulta', () => {
  it('delega en el repositorio con anioAcademicoId e institucionId correctos', async () => {
    const periodos = [periodoBase()];
    const repo = mockRepoPeriodos({
      listarPorAnio: jest.fn().mockResolvedValue(periodos),
    });
    const consulta = new ListarPeriodosConsulta(repo);

    const resultado = await consulta.ejecutar('anio-uuid', INST_A);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(repo.listarPorAnio).toHaveBeenCalledWith('anio-uuid', INST_A);
    expect(resultado).toBe(periodos);
  });
});
