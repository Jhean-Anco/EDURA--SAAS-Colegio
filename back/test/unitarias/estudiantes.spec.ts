import { CrearEstudianteCasoUso } from '../../src/modulos/estudiantes/aplicacion/crear-estudiante.caso-uso';
import { ActualizarEstudianteCasoUso } from '../../src/modulos/estudiantes/aplicacion/actualizar-estudiante.caso-uso';
import { CambiarEstadoEstudianteCasoUso } from '../../src/modulos/estudiantes/aplicacion/cambiar-estado-estudiante.caso-uso';
import { AgregarApoderadoEstudianteCasoUso } from '../../src/modulos/estudiantes/aplicacion/agregar-apoderado-estudiante.caso-uso';
import { ActualizarApoderadoEstudianteCasoUso } from '../../src/modulos/estudiantes/aplicacion/actualizar-apoderado-estudiante.caso-uso';
import { RegistrarDocumentoEstudianteCasoUso } from '../../src/modulos/estudiantes/aplicacion/registrar-documento-estudiante.caso-uso';
import { RepositorioEstudiantes } from '../../src/modulos/estudiantes/dominio/puertos/estudiantes.puerto';
import {
  ApoderadoPrincipalExistenteError,
  EstudianteCodigoDuplicadoError,
  EstudianteNoEncontradoError,
  PersonaFueraDeInstitucionError,
  PersonaYaEsEstudianteError,
  SedeFueraDeInstitucionError,
} from '../../src/modulos/estudiantes/dominio/errores-estudiantes';

function mockRepo(
  overrides: Partial<RepositorioEstudiantes> = {},
): jest.Mocked<RepositorioEstudiantes> {
  return {
    verificarSedeDeInstitucion: jest.fn().mockResolvedValue(true),
    verificarPersonaDeInstitucion: jest.fn().mockResolvedValue(true),
    existeCodigo: jest.fn().mockResolvedValue(false),
    personaYaEsEstudiante: jest.fn().mockResolvedValue(false),
    crearEstudiante: jest.fn().mockResolvedValue({ id: 'e1' }),
    obtenerEstudianteBase: jest
      .fn()
      .mockResolvedValue({ id: 'e1', idSede: 's1', idPersona: 'p1' }),
    actualizarEstudiante: jest.fn().mockResolvedValue(true),
    cambiarEstadoEstudiante: jest.fn().mockResolvedValue(true),
    estudianteTienePrincipalActivo: jest.fn().mockResolvedValue(false),
    apoderadoPrincipalActivo: jest.fn().mockResolvedValue(false),
    crearApoderado: jest.fn().mockResolvedValue({ id: 'a1' }),
    obtenerApoderadoBase: jest
      .fn()
      .mockResolvedValue({ id: 'a1', esPrincipal: false }),
    actualizarApoderado: jest.fn().mockResolvedValue(true),
    estudianteExiste: jest.fn().mockResolvedValue(true),
    registrarDocumento: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  } as jest.Mocked<RepositorioEstudiantes>;
}

// ---------------------------------------------------------------------------
// CrearEstudianteCasoUso
// ---------------------------------------------------------------------------
describe('CrearEstudianteCasoUso', () => {
  it('crea estudiante válido', async () => {
    const repo = mockRepo();
    const caso = new CrearEstudianteCasoUso(repo);
    await expect(
      caso.ejecutar({
        institucionId: 'i1',
        idPersona: 'p1',
        idSede: 's1',
        codigo: 'EST-001',
      }),
    ).resolves.toEqual({ id: 'e1' });
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(repo.crearEstudiante).toHaveBeenCalledTimes(1);
  });

  it('rechaza sede fuera de la institución', async () => {
    const repo = mockRepo({
      verificarSedeDeInstitucion: jest.fn().mockResolvedValue(false),
    });
    const caso = new CrearEstudianteCasoUso(repo);
    await expect(
      caso.ejecutar({
        institucionId: 'i1',
        idPersona: 'p1',
        idSede: 's-otra',
        codigo: 'X',
      }),
    ).rejects.toBeInstanceOf(SedeFueraDeInstitucionError);
  });

  it('rechaza persona fuera de la institución', async () => {
    const repo = mockRepo({
      verificarPersonaDeInstitucion: jest.fn().mockResolvedValue(false),
    });
    const caso = new CrearEstudianteCasoUso(repo);
    await expect(
      caso.ejecutar({
        institucionId: 'i1',
        idPersona: 'p-otra',
        idSede: 's1',
        codigo: 'X',
      }),
    ).rejects.toBeInstanceOf(PersonaFueraDeInstitucionError);
  });

  it('rechaza código duplicado', async () => {
    const repo = mockRepo({ existeCodigo: jest.fn().mockResolvedValue(true) });
    const caso = new CrearEstudianteCasoUso(repo);
    await expect(
      caso.ejecutar({
        institucionId: 'i1',
        idPersona: 'p1',
        idSede: 's1',
        codigo: 'EST-001',
      }),
    ).rejects.toBeInstanceOf(EstudianteCodigoDuplicadoError);
  });

  it('rechaza persona ya asociada como estudiante', async () => {
    const repo = mockRepo({
      personaYaEsEstudiante: jest.fn().mockResolvedValue(true),
    });
    const caso = new CrearEstudianteCasoUso(repo);
    await expect(
      caso.ejecutar({
        institucionId: 'i1',
        idPersona: 'p1',
        idSede: 's1',
        codigo: 'EST-002',
      }),
    ).rejects.toBeInstanceOf(PersonaYaEsEstudianteError);
  });
});

// ---------------------------------------------------------------------------
// ActualizarEstudianteCasoUso
// ---------------------------------------------------------------------------
describe('ActualizarEstudianteCasoUso', () => {
  it('actualiza estudiante existente', async () => {
    const repo = mockRepo();
    const caso = new ActualizarEstudianteCasoUso(repo);
    await expect(
      caso.ejecutar({ institucionId: 'i1', id: 'e1', codigo: 'EST-002' }),
    ).resolves.toBeUndefined();
  });

  it('lanza error si el estudiante no existe', async () => {
    const repo = mockRepo({
      obtenerEstudianteBase: jest.fn().mockResolvedValue(null),
    });
    const caso = new ActualizarEstudianteCasoUso(repo);
    await expect(
      caso.ejecutar({ institucionId: 'i1', id: 'no-existe' }),
    ).rejects.toBeInstanceOf(EstudianteNoEncontradoError);
  });

  it('rechaza sede fuera de la institución al actualizar', async () => {
    const repo = mockRepo({
      verificarSedeDeInstitucion: jest.fn().mockResolvedValue(false),
    });
    const caso = new ActualizarEstudianteCasoUso(repo);
    await expect(
      caso.ejecutar({ institucionId: 'i1', id: 'e1', idSede: 's-otra' }),
    ).rejects.toBeInstanceOf(SedeFueraDeInstitucionError);
  });

  it('rechaza código duplicado en otra fila', async () => {
    const repo = mockRepo({ existeCodigo: jest.fn().mockResolvedValue(true) });
    const caso = new ActualizarEstudianteCasoUso(repo);
    await expect(
      caso.ejecutar({ institucionId: 'i1', id: 'e1', codigo: 'EST-DUP' }),
    ).rejects.toBeInstanceOf(EstudianteCodigoDuplicadoError);
  });
});

// ---------------------------------------------------------------------------
// CambiarEstadoEstudianteCasoUso
// ---------------------------------------------------------------------------
describe('CambiarEstadoEstudianteCasoUso', () => {
  it('cambia estado correctamente', async () => {
    const repo = mockRepo();
    const caso = new CambiarEstadoEstudianteCasoUso(repo);
    await expect(
      caso.ejecutar({ institucionId: 'i1', id: 'e1', estado: 'INACTIVO' }),
    ).resolves.toBeUndefined();
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(repo.cambiarEstadoEstudiante).toHaveBeenCalledWith(
      'e1',
      'i1',
      'INACTIVO',
    );
  });

  it('lanza error si el estudiante no existe al buscar base', async () => {
    const repo = mockRepo({
      obtenerEstudianteBase: jest.fn().mockResolvedValue(null),
    });
    const caso = new CambiarEstadoEstudianteCasoUso(repo);
    await expect(
      caso.ejecutar({
        institucionId: 'i1',
        id: 'no-existe',
        estado: 'INACTIVO',
      }),
    ).rejects.toBeInstanceOf(EstudianteNoEncontradoError);
  });

  it('lanza error si la actualización no afecta filas', async () => {
    const repo = mockRepo({
      cambiarEstadoEstudiante: jest.fn().mockResolvedValue(false),
    });
    const caso = new CambiarEstadoEstudianteCasoUso(repo);
    await expect(
      caso.ejecutar({ institucionId: 'i1', id: 'e1', estado: 'RETIRADO' }),
    ).rejects.toBeInstanceOf(EstudianteNoEncontradoError);
  });
});

// ---------------------------------------------------------------------------
// AgregarApoderadoEstudianteCasoUso
// ---------------------------------------------------------------------------
describe('AgregarApoderadoEstudianteCasoUso', () => {
  it('agrega apoderado válido', async () => {
    const repo = mockRepo();
    const caso = new AgregarApoderadoEstudianteCasoUso(repo);
    await expect(
      caso.ejecutar({
        institucionId: 'i1',
        estudianteId: 'e1',
        idPersona: 'p2',
        parentesco: 'MADRE',
      }),
    ).resolves.toEqual({ id: 'a1' });
  });

  it('lanza error si el estudiante no existe', async () => {
    const repo = mockRepo({
      estudianteExiste: jest.fn().mockResolvedValue(false),
    });
    const caso = new AgregarApoderadoEstudianteCasoUso(repo);
    await expect(
      caso.ejecutar({
        institucionId: 'i1',
        estudianteId: 'no-existe',
        idPersona: 'p2',
        parentesco: 'PADRE',
      }),
    ).rejects.toBeInstanceOf(EstudianteNoEncontradoError);
  });

  it('lanza error si la persona no pertenece a la institución', async () => {
    const repo = mockRepo({
      verificarPersonaDeInstitucion: jest.fn().mockResolvedValue(false),
    });
    const caso = new AgregarApoderadoEstudianteCasoUso(repo);
    await expect(
      caso.ejecutar({
        institucionId: 'i1',
        estudianteId: 'e1',
        idPersona: 'p-otra',
        parentesco: 'MADRE',
      }),
    ).rejects.toBeInstanceOf(PersonaFueraDeInstitucionError);
  });

  it('rechaza apoderado principal duplicado', async () => {
    const repo = mockRepo({
      apoderadoPrincipalActivo: jest.fn().mockResolvedValue(true),
    });
    const caso = new AgregarApoderadoEstudianteCasoUso(repo);
    await expect(
      caso.ejecutar({
        institucionId: 'i1',
        estudianteId: 'e1',
        idPersona: 'p2',
        parentesco: 'MADRE',
        esPrincipal: true,
      }),
    ).rejects.toBeInstanceOf(ApoderadoPrincipalExistenteError);
  });

  it('permite agregar apoderado no principal aunque exista uno principal', async () => {
    const repo = mockRepo({
      apoderadoPrincipalActivo: jest.fn().mockResolvedValue(true),
    });
    const caso = new AgregarApoderadoEstudianteCasoUso(repo);
    await expect(
      caso.ejecutar({
        institucionId: 'i1',
        estudianteId: 'e1',
        idPersona: 'p2',
        parentesco: 'TIO',
        esPrincipal: false,
      }),
    ).resolves.toEqual({ id: 'a1' });
  });
});

// ---------------------------------------------------------------------------
// ActualizarApoderadoEstudianteCasoUso
// ---------------------------------------------------------------------------
describe('ActualizarApoderadoEstudianteCasoUso', () => {
  it('actualiza apoderado correctamente', async () => {
    const repo = mockRepo();
    const caso = new ActualizarApoderadoEstudianteCasoUso(repo);
    await expect(
      caso.ejecutar({
        institucionId: 'i1',
        estudianteId: 'e1',
        idApoderado: 'a1',
        parentesco: 'PADRE',
      }),
    ).resolves.toBeUndefined();
  });

  it('lanza error si el apoderado no existe', async () => {
    const repo = mockRepo({
      obtenerApoderadoBase: jest.fn().mockResolvedValue(null),
    });
    const caso = new ActualizarApoderadoEstudianteCasoUso(repo);
    await expect(
      caso.ejecutar({
        institucionId: 'i1',
        estudianteId: 'e1',
        idApoderado: 'no-existe',
      }),
    ).rejects.toBeInstanceOf(EstudianteNoEncontradoError);
  });

  it('rechaza principal duplicado al actualizar', async () => {
    const repo = mockRepo({
      obtenerApoderadoBase: jest
        .fn()
        .mockResolvedValue({ id: 'a1', esPrincipal: false }),
      apoderadoPrincipalActivo: jest.fn().mockResolvedValue(true),
    });
    const caso = new ActualizarApoderadoEstudianteCasoUso(repo);
    await expect(
      caso.ejecutar({
        institucionId: 'i1',
        estudianteId: 'e1',
        idApoderado: 'a1',
        esPrincipal: true,
      }),
    ).rejects.toBeInstanceOf(ApoderadoPrincipalExistenteError);
  });

  it('permite marcar como principal si ya es el principal actual', async () => {
    const repo = mockRepo({
      obtenerApoderadoBase: jest
        .fn()
        .mockResolvedValue({ id: 'a1', esPrincipal: true }),
    });
    const caso = new ActualizarApoderadoEstudianteCasoUso(repo);
    await expect(
      caso.ejecutar({
        institucionId: 'i1',
        estudianteId: 'e1',
        idApoderado: 'a1',
        esPrincipal: true,
      }),
    ).resolves.toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// RegistrarDocumentoEstudianteCasoUso
// ---------------------------------------------------------------------------
describe('RegistrarDocumentoEstudianteCasoUso', () => {
  it('registra documento correctamente', async () => {
    const repo = mockRepo();
    const caso = new RegistrarDocumentoEstudianteCasoUso(repo);
    await expect(
      caso.ejecutar({
        institucionId: 'i1',
        estudianteId: 'e1',
        tipoDocumento: 'FICHA_MATRICULA',
        nombre: 'Ficha 2025',
      }),
    ).resolves.toBeUndefined();
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(repo.registrarDocumento).toHaveBeenCalledTimes(1);
  });

  it('lanza error si el estudiante no existe', async () => {
    const repo = mockRepo({
      estudianteExiste: jest.fn().mockResolvedValue(false),
    });
    const caso = new RegistrarDocumentoEstudianteCasoUso(repo);
    await expect(
      caso.ejecutar({
        institucionId: 'i1',
        estudianteId: 'no-existe',
        tipoDocumento: 'FICHA_MATRICULA',
        nombre: 'Ficha 2025',
      }),
    ).rejects.toBeInstanceOf(EstudianteNoEncontradoError);
  });
});
