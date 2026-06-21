import { CrearDocenteCasoUso } from '../../src/modulos/docentes/aplicacion/crear-docente.caso-uso';
import { ActualizarDocenteCasoUso } from '../../src/modulos/docentes/aplicacion/actualizar-docente.caso-uso';
import { CambiarEstadoDocenteCasoUso } from '../../src/modulos/docentes/aplicacion/cambiar-estado-docente.caso-uso';
import { AsignarDocenteSedeCasoUso } from '../../src/modulos/docentes/aplicacion/asignar-docente-sede.caso-uso';
import { ActualizarAsignacionDocenteSedeCasoUso } from '../../src/modulos/docentes/aplicacion/actualizar-asignacion-docente-sede.caso-uso';
import { EstablecerSedePrincipalDocenteCasoUso } from '../../src/modulos/docentes/aplicacion/establecer-sede-principal-docente.caso-uso';
import { AsignarEspecialidadDocenteCasoUso } from '../../src/modulos/docentes/aplicacion/asignar-especialidad-docente.caso-uso';
import { CrearEspecialidadProfesionalCasoUso } from '../../src/modulos/docentes/aplicacion/crear-especialidad-profesional.caso-uso';
import {
  AlcanceAcceso,
  RepositorioDocentes,
  RepositorioEspecialidadesProfesionales,
} from '../../src/modulos/docentes/dominio/puertos/docentes.puerto';
import {
  AsignacionDocenteSedNoEncontradaError,
  AsignacionSedeDuplicadaError,
  CodigoDocenteDuplicadoError,
  DocenteNoEncontradoError,
  EspecialidadDocenteDuplicadaError,
  EspecialidadDuplicadaError,
  EspecialidadNoEncontradaError,
  EspecialidadPrincipalExistenteError,
  PersonaFueraDeInstitucionDocenteError,
  PersonaYaEsDocenteError,
  SedeFueraDeInstitucionDocenteError,
  SedePrincipalExistenteError,
  TransicionEstadoDocenteInvalidaError,
  UltimaSedeActivaError,
} from '../../src/modulos/docentes/dominio/errores-docentes';

const ALCANCE_INST: AlcanceAcceso = {
  usuarioId: 'u1',
  institucionId: 'i1',
  ambito: 'INSTITUCION',
  sedeId: null,
};

function mockRepo(
  overrides: Partial<RepositorioDocentes> = {},
): jest.Mocked<RepositorioDocentes> {
  return {
    verificarPersonaEnInstitucion: jest.fn().mockResolvedValue(true),
    verificarSedeEnInstitucion: jest.fn().mockResolvedValue(true),
    existeCodigoNormalizado: jest.fn().mockResolvedValue(false),
    personaYaEsDocente: jest.fn().mockResolvedValue(false),
    crearDocente: jest.fn().mockResolvedValue({ id: 'd1' }),
    obtenerDocenteBase: jest
      .fn()
      .mockResolvedValue({ id: 'd1', estado: 'ACTIVO', idPersona: 'p1' }),
    actualizarDocente: jest.fn().mockResolvedValue(true),
    cambiarEstadoDocente: jest.fn().mockResolvedValue(true),
    inactivarAsignacionesDocente: jest.fn().mockResolvedValue(undefined),
    contarSedesActivas: jest.fn().mockResolvedValue(2),
    crearAsignacionSede: jest.fn().mockResolvedValue({ id: 'as1' }),
    obtenerAsignacionSedeBase: jest
      .fn()
      .mockResolvedValue({ id: 'as1', esPrincipal: false, estado: 'ACTIVA' }),
    actualizarAsignacionSede: jest.fn().mockResolvedValue(true),
    existeAsignacionActivaEnSede: jest.fn().mockResolvedValue(false),
    existeSedePrincipalActiva: jest.fn().mockResolvedValue(false),
    establecerAsignacionSedePrincipal: jest.fn().mockResolvedValue(undefined),
    docenteTieneAsignacionEnSede: jest.fn().mockResolvedValue(false),
    ...overrides,
  } as jest.Mocked<RepositorioDocentes>;
}

function mockRepoEsp(
  overrides: Partial<RepositorioEspecialidadesProfesionales> = {},
): jest.Mocked<RepositorioEspecialidadesProfesionales> {
  return {
    existeCodigoNormalizadoEsp: jest.fn().mockResolvedValue(false),
    existeNombreNormalizadoEsp: jest.fn().mockResolvedValue(false),
    crearEspecialidad: jest.fn().mockResolvedValue({ id: 'esp1' }),
    obtenerEspecialidadBase: jest
      .fn()
      .mockResolvedValue({ id: 'esp1', estado: 'ACTIVA' }),
    actualizarEspecialidad: jest.fn().mockResolvedValue(true),
    docenteTieneEspecialidadActiva: jest.fn().mockResolvedValue(false),
    existeEspecialidadPrincipalActiva: jest.fn().mockResolvedValue(false),
    crearAsignacionEspecialidad: jest.fn().mockResolvedValue({ id: 'de1' }),
    obtenerAsignacionEspecialidadBase: jest
      .fn()
      .mockResolvedValue({ id: 'de1', esPrincipal: false, estado: 'ACTIVA' }),
    actualizarAsignacionEspecialidad: jest.fn().mockResolvedValue(true),
    quitarPrincipalAsignacionesEspecialidad: jest
      .fn()
      .mockResolvedValue(undefined),
    ...overrides,
  } as jest.Mocked<RepositorioEspecialidadesProfesionales>;
}

// ── CP-DOC-001 a CP-DOC-005: CrearDocente ───────────────────────────────────

describe('CrearDocenteCasoUso', () => {
  it('CP-DOC-001: crea docente válido', async () => {
    const repo = mockRepo();
    const caso = new CrearDocenteCasoUso(repo);
    await expect(
      caso.ejecutar({
        alcance: ALCANCE_INST,
        idPersona: 'p1',
        idSede: 's1',
        codigo: 'DOC-001',
      }),
    ).resolves.toEqual({ id: 'd1' });
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(repo.crearDocente).toHaveBeenCalledTimes(1);
  });

  it('CP-DOC-002: rechaza persona fuera de la institución', async () => {
    const repo = mockRepo({
      verificarPersonaEnInstitucion: jest.fn().mockResolvedValue(false),
    });
    const caso = new CrearDocenteCasoUso(repo);
    await expect(
      caso.ejecutar({
        alcance: ALCANCE_INST,
        idPersona: 'p-otra',
        idSede: 's1',
        codigo: 'DOC-001',
      }),
    ).rejects.toBeInstanceOf(PersonaFueraDeInstitucionDocenteError);
  });

  it('CP-DOC-003: rechaza sede fuera de la institución', async () => {
    const repo = mockRepo({
      verificarSedeEnInstitucion: jest.fn().mockResolvedValue(false),
    });
    const caso = new CrearDocenteCasoUso(repo);
    await expect(
      caso.ejecutar({
        alcance: ALCANCE_INST,
        idPersona: 'p1',
        idSede: 's-otra',
        codigo: 'DOC-001',
      }),
    ).rejects.toBeInstanceOf(SedeFueraDeInstitucionDocenteError);
  });

  it('CP-DOC-004: rechaza código duplicado', async () => {
    const repo = mockRepo({
      existeCodigoNormalizado: jest.fn().mockResolvedValue(true),
    });
    const caso = new CrearDocenteCasoUso(repo);
    await expect(
      caso.ejecutar({
        alcance: ALCANCE_INST,
        idPersona: 'p1',
        idSede: 's1',
        codigo: 'DOC-001',
      }),
    ).rejects.toBeInstanceOf(CodigoDocenteDuplicadoError);
  });

  it('CP-DOC-005: rechaza persona ya registrada como docente', async () => {
    const repo = mockRepo({
      personaYaEsDocente: jest.fn().mockResolvedValue(true),
    });
    const caso = new CrearDocenteCasoUso(repo);
    await expect(
      caso.ejecutar({
        alcance: ALCANCE_INST,
        idPersona: 'p1',
        idSede: 's1',
        codigo: 'DOC-002',
      }),
    ).rejects.toBeInstanceOf(PersonaYaEsDocenteError);
  });
});

// ── CP-DOC-006 a CP-DOC-007: ActualizarDocente ──────────────────────────────

describe('ActualizarDocenteCasoUso', () => {
  it('CP-DOC-006: actualiza docente existente', async () => {
    const repo = mockRepo();
    const caso = new ActualizarDocenteCasoUso(repo);
    await expect(
      caso.ejecutar({ alcance: ALCANCE_INST, id: 'd1', codigo: 'DOC-NEW' }),
    ).resolves.toBeUndefined();
  });

  it('CP-DOC-007: lanza error si docente no existe', async () => {
    const repo = mockRepo({
      obtenerDocenteBase: jest.fn().mockResolvedValue(null),
    });
    const caso = new ActualizarDocenteCasoUso(repo);
    await expect(
      caso.ejecutar({ alcance: ALCANCE_INST, id: 'no-existe' }),
    ).rejects.toBeInstanceOf(DocenteNoEncontradoError);
  });
});

// ── CP-DOC-008 a CP-DOC-010: CambiarEstadoDocente ───────────────────────────

describe('CambiarEstadoDocenteCasoUso', () => {
  it('CP-DOC-008: cambia de ACTIVO a INACTIVO', async () => {
    const repo = mockRepo();
    const caso = new CambiarEstadoDocenteCasoUso(repo);
    await expect(
      caso.ejecutar({ alcance: ALCANCE_INST, id: 'd1', estado: 'INACTIVO' }),
    ).resolves.toBeUndefined();
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(repo.cambiarEstadoDocente).toHaveBeenCalledWith(
      'd1',
      'i1',
      'INACTIVO',
      null,
    );
  });

  it('CP-DOC-009: CESADO inactiva asignaciones de sede', async () => {
    const repo = mockRepo();
    const caso = new CambiarEstadoDocenteCasoUso(repo);
    await caso.ejecutar({
      alcance: ALCANCE_INST,
      id: 'd1',
      estado: 'CESADO',
      fechaCese: '2025-12-31',
    });
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(repo.inactivarAsignacionesDocente).toHaveBeenCalledWith('d1', 'i1');
  });

  it('CP-DOC-010: rechaza transición inválida CESADO → ACTIVO', async () => {
    const repo = mockRepo({
      obtenerDocenteBase: jest
        .fn()
        .mockResolvedValue({ id: 'd1', estado: 'CESADO', idPersona: 'p1' }),
    });
    const caso = new CambiarEstadoDocenteCasoUso(repo);
    await expect(
      caso.ejecutar({ alcance: ALCANCE_INST, id: 'd1', estado: 'ACTIVO' }),
    ).rejects.toBeInstanceOf(TransicionEstadoDocenteInvalidaError);
  });
});

// ── CP-DOC-011 a CP-DOC-013: AsignarDocenteSede ─────────────────────────────

describe('AsignarDocenteSedeCasoUso', () => {
  it('CP-DOC-011: asigna sede válida', async () => {
    const repo = mockRepo();
    const caso = new AsignarDocenteSedeCasoUso(repo);
    await expect(
      caso.ejecutar({
        alcance: ALCANCE_INST,
        idDocente: 'd1',
        idSede: 's2',
        esPrincipal: false,
        fechaInicio: '2025-01-01',
      }),
    ).resolves.toEqual({ id: 'as1' });
  });

  it('CP-DOC-012: rechaza asignación duplicada activa en la misma sede', async () => {
    const repo = mockRepo({
      existeAsignacionActivaEnSede: jest.fn().mockResolvedValue(true),
    });
    const caso = new AsignarDocenteSedeCasoUso(repo);
    await expect(
      caso.ejecutar({
        alcance: ALCANCE_INST,
        idDocente: 'd1',
        idSede: 's1',
        esPrincipal: false,
        fechaInicio: '2025-01-01',
      }),
    ).rejects.toBeInstanceOf(AsignacionSedeDuplicadaError);
  });

  it('CP-DOC-013: rechaza segunda sede principal activa', async () => {
    const repo = mockRepo({
      existeSedePrincipalActiva: jest.fn().mockResolvedValue(true),
    });
    const caso = new AsignarDocenteSedeCasoUso(repo);
    await expect(
      caso.ejecutar({
        alcance: ALCANCE_INST,
        idDocente: 'd1',
        idSede: 's2',
        esPrincipal: true,
        fechaInicio: '2025-01-01',
      }),
    ).rejects.toBeInstanceOf(SedePrincipalExistenteError);
  });
});

// ── CP-DOC-014: ActualizarAsignacionSede ────────────────────────────────────

describe('ActualizarAsignacionDocenteSedeCasoUso', () => {
  it('CP-DOC-014: no permite inactivar la última sede activa de docente ACTIVO', async () => {
    const repo = mockRepo({
      contarSedesActivas: jest.fn().mockResolvedValue(1),
    });
    const caso = new ActualizarAsignacionDocenteSedeCasoUso(repo);
    await expect(
      caso.ejecutar({
        alcance: ALCANCE_INST,
        idDocente: 'd1',
        idAsignacion: 'as1',
        estado: 'INACTIVA',
      }),
    ).rejects.toBeInstanceOf(UltimaSedeActivaError);
  });
});

// ── CP-DOC-015: EstablecerSedePrincipal ─────────────────────────────────────

describe('EstablecerSedePrincipalDocenteCasoUso', () => {
  it('CP-DOC-015: establece sede principal correctamente', async () => {
    const repo = mockRepo();
    const caso = new EstablecerSedePrincipalDocenteCasoUso(repo);
    await expect(
      caso.ejecutar({
        alcance: ALCANCE_INST,
        idDocente: 'd1',
        idAsignacion: 'as1',
      }),
    ).resolves.toBeUndefined();
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(repo.establecerAsignacionSedePrincipal).toHaveBeenCalledWith(
      'd1',
      'as1',
      'i1',
    );
  });

  it('CP-DOC-015b: lanza error si asignación no existe o está inactiva', async () => {
    const repo = mockRepo({
      obtenerAsignacionSedeBase: jest.fn().mockResolvedValue(null),
    });
    const caso = new EstablecerSedePrincipalDocenteCasoUso(repo);
    await expect(
      caso.ejecutar({
        alcance: ALCANCE_INST,
        idDocente: 'd1',
        idAsignacion: 'no-existe',
      }),
    ).rejects.toBeInstanceOf(AsignacionDocenteSedNoEncontradaError);
  });
});

// ── CP-DOC-016 a CP-DOC-018: CrearEspecialidadProfesional ───────────────────

describe('CrearEspecialidadProfesionalCasoUso', () => {
  it('CP-DOC-016: crea especialidad válida', async () => {
    const repo = mockRepoEsp();
    const caso = new CrearEspecialidadProfesionalCasoUso(repo);
    await expect(
      caso.ejecutar({
        alcance: ALCANCE_INST,
        codigo: 'MAT',
        nombre: 'Matemáticas',
      }),
    ).resolves.toEqual({ id: 'esp1' });
  });

  it('CP-DOC-017: rechaza código duplicado en especialidad', async () => {
    const repo = mockRepoEsp({
      existeCodigoNormalizadoEsp: jest.fn().mockResolvedValue(true),
    });
    const caso = new CrearEspecialidadProfesionalCasoUso(repo);
    await expect(
      caso.ejecutar({ alcance: ALCANCE_INST, codigo: 'MAT', nombre: 'Otro' }),
    ).rejects.toBeInstanceOf(EspecialidadDuplicadaError);
  });

  it('CP-DOC-018: rechaza nombre duplicado en especialidad', async () => {
    const repo = mockRepoEsp({
      existeNombreNormalizadoEsp: jest.fn().mockResolvedValue(true),
    });
    const caso = new CrearEspecialidadProfesionalCasoUso(repo);
    await expect(
      caso.ejecutar({
        alcance: ALCANCE_INST,
        codigo: 'NEW',
        nombre: 'Matemáticas',
      }),
    ).rejects.toBeInstanceOf(EspecialidadDuplicadaError);
  });
});

// ── CP-DOC-019 a CP-DOC-021: AsignarEspecialidadDocente ─────────────────────

describe('AsignarEspecialidadDocenteCasoUso', () => {
  it('CP-DOC-019: asigna especialidad válida', async () => {
    const repoDoc = mockRepo();
    const repoEsp = mockRepoEsp();
    const caso = new AsignarEspecialidadDocenteCasoUso(repoDoc, repoEsp);
    await expect(
      caso.ejecutar({
        alcance: ALCANCE_INST,
        idDocente: 'd1',
        idEspecialidad: 'esp1',
        esPrincipal: false,
      }),
    ).resolves.toEqual({ id: 'de1' });
  });

  it('CP-DOC-020: rechaza especialidad no encontrada o inactiva', async () => {
    const repoDoc = mockRepo();
    const repoEsp = mockRepoEsp({
      obtenerEspecialidadBase: jest.fn().mockResolvedValue(null),
    });
    const caso = new AsignarEspecialidadDocenteCasoUso(repoDoc, repoEsp);
    await expect(
      caso.ejecutar({
        alcance: ALCANCE_INST,
        idDocente: 'd1',
        idEspecialidad: 'no-existe',
        esPrincipal: false,
      }),
    ).rejects.toBeInstanceOf(EspecialidadNoEncontradaError);
  });

  it('CP-DOC-021: rechaza especialidad activa duplicada para el mismo docente', async () => {
    const repoDoc = mockRepo();
    const repoEsp = mockRepoEsp({
      docenteTieneEspecialidadActiva: jest.fn().mockResolvedValue(true),
    });
    const caso = new AsignarEspecialidadDocenteCasoUso(repoDoc, repoEsp);
    await expect(
      caso.ejecutar({
        alcance: ALCANCE_INST,
        idDocente: 'd1',
        idEspecialidad: 'esp1',
        esPrincipal: false,
      }),
    ).rejects.toBeInstanceOf(EspecialidadDocenteDuplicadaError);
  });

  it('CP-DOC-021b: rechaza segunda especialidad principal', async () => {
    const repoDoc = mockRepo();
    const repoEsp = mockRepoEsp({
      existeEspecialidadPrincipalActiva: jest.fn().mockResolvedValue(true),
    });
    const caso = new AsignarEspecialidadDocenteCasoUso(repoDoc, repoEsp);
    await expect(
      caso.ejecutar({
        alcance: ALCANCE_INST,
        idDocente: 'd1',
        idEspecialidad: 'esp1',
        esPrincipal: true,
      }),
    ).rejects.toBeInstanceOf(EspecialidadPrincipalExistenteError);
  });
});
