import { ConflictException, NotFoundException } from '@nestjs/common';
import { Persona } from '../../src/modulos/personas/dominio/personas/persona';
import { CrearPersonaCasoUso } from '../../src/modulos/personas/aplicacion/personas/crear-persona.caso-uso';
import { RegistrarDocumentoPersonaCasoUso } from '../../src/modulos/personas/aplicacion/documentos-identidad/registrar-documento-persona.caso-uso';
import { RegistrarMedioContactoPersonaCasoUso } from '../../src/modulos/personas/aplicacion/medios-contacto/registrar-medio-contacto-persona.caso-uso';
import { RegistrarDireccionPersonaCasoUso } from '../../src/modulos/personas/aplicacion/direcciones/registrar-direccion-persona.caso-uso';
import { VincularPersonaMembresiaCasoUso } from '../../src/modulos/personas/aplicacion/vinculaciones/vincular-persona-membresia.caso-uso';
import {
  RepositorioPersonas,
  RepositorioDocumentosIdentidadPersona,
  RepositorioMediosContactoPersona,
  RepositorioDireccionesPersona,
  RepositorioVinculosPersonaMembresia,
} from '../../src/modulos/personas/dominio/puertos/repositorios';

const INST_A = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const INST_B = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

function personaActiva(): Persona {
  return new Persona(
    'p1',
    INST_A,
    'Juan',
    'Perez',
    null,
    null,
    null,
    null,
    'ACTIVA',
    new Date(),
    new Date(),
  );
}

function repoPersonasMock(persona: Persona | null): RepositorioPersonas {
  return {
    crear: jest.fn((p: Persona) => Promise.resolve(p)),
    buscarPorId: jest.fn(() => Promise.resolve(persona)),
    buscarPorIdEnInstitucion: jest.fn(() => Promise.resolve(persona)),
    listarPorInstitucion: jest.fn(() =>
      Promise.resolve({ datos: [], total: 0 }),
    ),
  };
}

const voidFn = () => Promise.resolve<void>(undefined);

describe('CrearPersonaCasoUso', () => {
  it('crea persona con datos válidos', async () => {
    const caso = new CrearPersonaCasoUso(repoPersonasMock(null));
    const res = await caso.ejecutar({
      institucionEducativaId: INST_A,
      nombres: 'Ana',
      apellidoPaterno: 'García',
    });
    expect(res.nombres).toBe('Ana');
    expect(res.estado).toBe('ACTIVA');
    expect(res.institucionEducativaId).toBe(INST_A);
  });

  it('normaliza espacios en nombres', async () => {
    const caso = new CrearPersonaCasoUso(repoPersonasMock(null));
    const res = await caso.ejecutar({
      institucionEducativaId: INST_A,
      nombres: '  María  ',
    });
    expect(res.nombres).toBe('María');
  });
});

describe('RegistrarDocumentoPersonaCasoUso', () => {
  const docRepo: RepositorioDocumentosIdentidadPersona = {
    registrar: jest.fn(voidFn),
  };

  it('lanza NotFoundException si persona no existe en institución', async () => {
    const caso = new RegistrarDocumentoPersonaCasoUso(
      repoPersonasMock(null),
      docRepo,
    );
    await expect(
      caso.ejecutar({
        personaId: 'p1',
        institucionEducativaId: INST_B,
        tipoDocumentoId: 't1',
        numero: '12345678',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('lanza ConflictException si persona está dada de baja', async () => {
    const baja = new Persona(
      'p1',
      INST_A,
      'Juan',
      null,
      null,
      null,
      null,
      null,
      'BAJA',
      new Date(),
      new Date(),
    );
    const caso = new RegistrarDocumentoPersonaCasoUso(
      repoPersonasMock(baja),
      docRepo,
    );
    await expect(
      caso.ejecutar({
        personaId: 'p1',
        institucionEducativaId: INST_A,
        tipoDocumentoId: 't1',
        numero: '12345678',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('normaliza número a mayúsculas', async () => {
    const registrar = jest.fn(voidFn);
    const caso = new RegistrarDocumentoPersonaCasoUso(
      repoPersonasMock(personaActiva()),
      { registrar },
    );
    await caso.ejecutar({
      personaId: 'p1',
      institucionEducativaId: INST_A,
      tipoDocumentoId: 't1',
      numero: ' abc123 ',
    });
    expect(registrar).toHaveBeenCalledWith(
      expect.objectContaining({ numeroNormalizado: 'ABC123' }),
    );
  });
});

describe('RegistrarMedioContactoPersonaCasoUso', () => {
  const contactoRepo: RepositorioMediosContactoPersona = {
    registrar: jest.fn(voidFn),
  };

  it('normaliza correo a minúsculas', async () => {
    const registrar = jest.fn(voidFn);
    const caso = new RegistrarMedioContactoPersonaCasoUso(
      repoPersonasMock(personaActiva()),
      { registrar },
    );
    await caso.ejecutar({
      personaId: 'p1',
      institucionEducativaId: INST_A,
      tipo: 'CORREO',
      valor: 'TEST@CORREO.COM',
    });
    expect(registrar).toHaveBeenCalledWith(
      expect.objectContaining({ valorNormalizado: 'test@correo.com' }),
    );
  });

  it('lanza NotFoundException si persona no existe', async () => {
    const caso = new RegistrarMedioContactoPersonaCasoUso(
      repoPersonasMock(null),
      contactoRepo,
    );
    await expect(
      caso.ejecutar({
        personaId: 'p1',
        institucionEducativaId: INST_A,
        tipo: 'CELULAR',
        valor: '999000000',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});

describe('RegistrarDireccionPersonaCasoUso', () => {
  const dirRepo: RepositorioDireccionesPersona = {
    registrar: jest.fn(voidFn),
  };

  it('lanza ConflictException si latitud fuera de rango', async () => {
    const caso = new RegistrarDireccionPersonaCasoUso(
      repoPersonasMock(personaActiva()),
      dirRepo,
    );
    await expect(
      caso.ejecutar({
        personaId: 'p1',
        institucionEducativaId: INST_A,
        direccionLinea: 'Av. Principal 123',
        referencia: null,
        latitud: 95,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('lanza ConflictException si longitud fuera de rango', async () => {
    const caso = new RegistrarDireccionPersonaCasoUso(
      repoPersonasMock(personaActiva()),
      dirRepo,
    );
    await expect(
      caso.ejecutar({
        personaId: 'p1',
        institucionEducativaId: INST_A,
        direccionLinea: 'Av. Principal 123',
        referencia: null,
        longitud: -200,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('registra con datos válidos y normaliza espacios', async () => {
    const registrar = jest.fn(voidFn);
    const caso = new RegistrarDireccionPersonaCasoUso(
      repoPersonasMock(personaActiva()),
      { registrar },
    );
    await caso.ejecutar({
      personaId: 'p1',
      institucionEducativaId: INST_A,
      direccionLinea: '  Av. Lima 100  ',
      referencia: 'Ref',
      latitud: -12.046374,
      longitud: -77.042793,
    });
    expect(registrar).toHaveBeenCalledWith(
      expect.objectContaining({ direccionLinea: 'Av. Lima 100' }),
    );
  });
});

describe('VincularPersonaMembresiaCasoUso', () => {
  const vinculoRepo: RepositorioVinculosPersonaMembresia = {
    vincular: jest.fn(voidFn),
    desvincular: jest.fn(voidFn),
  };

  it('lanza NotFoundException al vincular si persona no existe en institución', async () => {
    const caso = new VincularPersonaMembresiaCasoUso(
      repoPersonasMock(null),
      vinculoRepo,
    );
    await expect(
      caso.vincular({
        personaId: 'p1',
        membresiaId: 'm1',
        institucionEducativaId: INST_B,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('vincula correctamente persona de misma institución', async () => {
    const vincular = jest.fn(voidFn);
    const caso = new VincularPersonaMembresiaCasoUso(
      repoPersonasMock(personaActiva()),
      { vincular, desvincular: jest.fn(voidFn) },
    );
    await caso.vincular({
      personaId: 'p1',
      membresiaId: 'm1',
      institucionEducativaId: INST_A,
    });
    expect(vincular).toHaveBeenCalledWith({
      personaId: 'p1',
      membresiaId: 'm1',
    });
  });
});
