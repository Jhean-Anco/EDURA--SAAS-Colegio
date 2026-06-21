/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/unbound-method, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return */
import {
  Matricula,
  AlcanceAcceso,
} from '../../src/modulos/matriculas/dominio/matriculas/matricula';
import { MatriculasPuerto } from '../../src/modulos/matriculas/dominio/puertos/matriculas.puerto';
import { CrearMatriculaBorradorCasoUso } from '../../src/modulos/matriculas/aplicacion/matriculas/crear-matricula-borrador.caso-uso';
import { ActualizarMatriculaBorradorCasoUso } from '../../src/modulos/matriculas/aplicacion/matriculas/actualizar-matricula-borrador.caso-uso';
import { ActivarMatriculaCasoUso } from '../../src/modulos/matriculas/aplicacion/matriculas/activar-matricula.caso-uso';
import { AnularMatriculaCasoUso } from '../../src/modulos/matriculas/aplicacion/matriculas/anular-matricula.caso-uso';
import { RetirarMatriculaCasoUso } from '../../src/modulos/matriculas/aplicacion/matriculas/retirar-matricula.caso-uso';
import { CambiarSeccionCasoUso } from '../../src/modulos/matriculas/aplicacion/matriculas/cambiar-seccion.caso-uso';
import {
  EstudianteFueraDeInstitucionError,
  EstudianteEstadoInvalidoError,
  AnioAcademicoNoVigenteError,
  EstructuraAcademicaIncoherenteError,
  OfertaGradoSedeInactivaError,
  SeccionInactivaError,
  SeccionNoCorrespondeAOfertaError,
  EstudianteConMatriculaActivaError,
  SeccionSinCapacidadError,
  TransicionEstadoInvalidaError,
  EdicionBorradorSoloPermitidaError,
  OperacionSobreSedeNoPermitidaError,
} from '../../src/modulos/matriculas/dominio/errores-matriculas';

function mockMatriculasRepo(
  overrides: Partial<MatriculasPuerto> = {},
): jest.Mocked<MatriculasPuerto> {
  const dsMock = {
    query: jest.fn().mockResolvedValue([]),
  };
  return {
    guardar: jest.fn().mockResolvedValue(undefined),
    buscarPorId: jest.fn().mockResolvedValue(null),
    listar: jest.fn().mockResolvedValue({ total: 0, datos: [] }),
    estudianteTieneMatriculaActiva: jest.fn().mockResolvedValue(false),
    obtenerSeccionConBloqueo: jest.fn().mockResolvedValue(null),
    contarMatriculasActivasEnSeccion: jest.fn().mockResolvedValue(0),
    registrarHistorialEstado: jest.fn().mockResolvedValue(undefined),
    registrarHistorialSeccion: jest.fn().mockResolvedValue(undefined),
    obtenerHistorialEstados: jest.fn().mockResolvedValue([]),
    obtenerHistorialSecciones: jest.fn().mockResolvedValue([]),
    ejecutarTransaccion: jest.fn().mockImplementation((op) => op({})),

    // Helpers
    verificarEstudiante: jest
      .fn()
      .mockResolvedValue({ id: 'est1', estado: 'ACTIVO', idSede: 'sede1' }),
    verificarAnioAcademico: jest
      .fn()
      .mockResolvedValue({ id: 'anio1', estado: 'PLANIFICADO' }),
    verificarOfertaGradoSede: jest.fn().mockResolvedValue({
      id: 'oferta1',
      idSede: 'sede1',
      idAnioAcademico: 'anio1',
      idGradoEducativo: 'grado1',
      estado: 'ACTIVA',
    }),
    verificarGrado: jest.fn().mockResolvedValue({
      id: 'grado1',
      idNivelEducativo: 'nivel1',
      estado: 'ACTIVO',
    }),
    verificarSede: jest
      .fn()
      .mockResolvedValue({ id: 'sede1', estado: 'ACTIVO' }),
    verificarSeccion: jest.fn().mockResolvedValue({
      id: 'sec1',
      idOfertaGradoSede: 'oferta1',
      estado: 'ACTIVA',
    }),
    existeCodigoMatricula: jest.fn().mockResolvedValue(false),
    ds: dsMock as any,
    ...overrides,
  } as unknown as jest.Mocked<MatriculasPuerto>;
}

describe('Matriculas - Máquina de Estados y Transiciones (Dominio)', () => {
  let mat: Matricula;

  beforeEach(() => {
    mat = new Matricula(
      'm1',
      'inst1',
      'sede1',
      'est1',
      'anio1',
      'nivel1',
      'grado1',
      'oferta1',
      null,
      'MAT-001',
      new Date(),
      'BORRADOR',
      null,
      'u1',
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      new Date(),
      new Date(),
    );
  });

  it('permite transicionar BORRADOR -> ACTIVA', () => {
    mat.activar('u2', new Date());
    expect(mat.estado).toBe('ACTIVA');
    expect(mat.idUsuarioActivador).toBe('u2');
    expect(mat.fechaActivacion).toBeInstanceOf(Date);
  });

  it('permite transicionar BORRADOR -> ANULADA', () => {
    mat.anular('u2', new Date(), 'Error en datos');
    expect(mat.estado).toBe('ANULADA');
    expect(mat.idUsuarioAnulacion).toBe('u2');
    expect(mat.motivoAnulacion).toBe('Error en datos');
  });

  it('permite transicionar ACTIVA -> RETIRADA', () => {
    mat.activar('u2', new Date());
    mat.retirar('u3', new Date(), 'Mudanza de familia');
    expect(mat.estado).toBe('RETIRADA');
    expect(mat.idUsuarioRetiro).toBe('u3');
    expect(mat.motivoRetiro).toBe('Mudanza de familia');
  });

  it('impide transicionar ACTIVA -> ANULADA directamente', () => {
    mat.activar('u2', new Date());
    expect(() => mat.anular('u3', new Date(), 'Anulacion')).toThrow(
      TransicionEstadoInvalidaError,
    );
  });

  it('impide reactivar una matrícula retirada', () => {
    mat.activar('u2', new Date());
    mat.retirar('u3', new Date(), 'Mudanza');
    expect(() => mat.activar('u4', new Date())).toThrow(
      TransicionEstadoInvalidaError,
    );
  });

  it('impide activar una matrícula anulada', () => {
    mat.anular('u2', new Date(), 'Error');
    expect(() => mat.activar('u3', new Date())).toThrow(
      TransicionEstadoInvalidaError,
    );
  });

  it('impide editar datos estructurales si no es borrador', () => {
    mat.activar('u2', new Date());
    expect(() => mat.actualizarDatosBorrador({ idSede: 'sede2' })).toThrow(
      EdicionBorradorSoloPermitidaError,
    );
  });
});

describe('Matriculas - Casos de Uso (Aplicación)', () => {
  const alcanceInst: AlcanceAcceso = {
    usuarioId: 'u1',
    institucionId: 'inst1',
    ambito: 'INSTITUCION',
    sedeId: null,
  };

  const alcanceSede1: AlcanceAcceso = {
    usuarioId: 'u1',
    institucionId: 'inst1',
    ambito: 'SEDE',
    sedeId: 'sede1',
  };

  // CrearMatriculaBorrador
  describe('CrearMatriculaBorradorCasoUso', () => {
    it('crea borrador exitosamente', async () => {
      const repo = mockMatriculasRepo();
      const caso = new CrearMatriculaBorradorCasoUso(repo);
      const res = await caso.ejecutar(
        {
          idSede: 'sede1',
          idEstudiante: 'est1',
          idAnioAcademico: 'anio1',
          idNivelEducativo: 'nivel1',
          idGradoEducativo: 'grado1',
          idOfertaGradoSede: 'oferta1',
          codigoMatricula: 'MAT-001',
          fechaMatricula: new Date(),
        },
        alcanceInst,
      );
      expect(res.id).toBeDefined();
      expect(repo.guardar).toHaveBeenCalledTimes(1);
    });

    it('rechaza estudiante de otra institucion', async () => {
      const repo = mockMatriculasRepo({
        verificarEstudiante: jest.fn().mockResolvedValue(null),
      });
      const caso = new CrearMatriculaBorradorCasoUso(repo);
      await expect(
        caso.ejecutar(
          {
            idSede: 'sede1',
            idEstudiante: 'est-otro',
            idAnioAcademico: 'anio1',
            idNivelEducativo: 'nivel1',
            idGradoEducativo: 'grado1',
            idOfertaGradoSede: 'oferta1',
            codigoMatricula: 'MAT-001',
            fechaMatricula: new Date(),
          },
          alcanceInst,
        ),
      ).rejects.toBeInstanceOf(EstudianteFueraDeInstitucionError);
    });

    it('rechaza estudiante inactivo', async () => {
      const repo = mockMatriculasRepo({
        verificarEstudiante: jest.fn().mockResolvedValue({
          id: 'est1',
          estado: 'EGRESADO',
          idSede: 'sede1',
        }),
      });
      const caso = new CrearMatriculaBorradorCasoUso(repo);
      await expect(
        caso.ejecutar(
          {
            idSede: 'sede1',
            idEstudiante: 'est1',
            idAnioAcademico: 'anio1',
            idNivelEducativo: 'nivel1',
            idGradoEducativo: 'grado1',
            idOfertaGradoSede: 'oferta1',
            codigoMatricula: 'MAT-001',
            fechaMatricula: new Date(),
          },
          alcanceInst,
        ),
      ).rejects.toBeInstanceOf(EstudianteEstadoInvalidoError);
    });

    it('rechaza año cerrado', async () => {
      const repo = mockMatriculasRepo({
        verificarAnioAcademico: jest
          .fn()
          .mockResolvedValue({ id: 'anio1', estado: 'CERRADO' }),
      });
      const caso = new CrearMatriculaBorradorCasoUso(repo);
      await expect(
        caso.ejecutar(
          {
            idSede: 'sede1',
            idEstudiante: 'est1',
            idAnioAcademico: 'anio1',
            idNivelEducativo: 'nivel1',
            idGradoEducativo: 'grado1',
            idOfertaGradoSede: 'oferta1',
            codigoMatricula: 'MAT-001',
            fechaMatricula: new Date(),
          },
          alcanceInst,
        ),
      ).rejects.toBeInstanceOf(AnioAcademicoNoVigenteError);
    });

    it('rechaza estructura incoherente (sede diferente)', async () => {
      const repo = mockMatriculasRepo({
        verificarOfertaGradoSede: jest.fn().mockResolvedValue({
          id: 'oferta1',
          idSede: 'sede-otra', // different
          idAnioAcademico: 'anio1',
          idGradoEducativo: 'grado1',
          estado: 'ACTIVA',
        }),
      });
      const caso = new CrearMatriculaBorradorCasoUso(repo);
      await expect(
        caso.ejecutar(
          {
            idSede: 'sede1',
            idEstudiante: 'est1',
            idAnioAcademico: 'anio1',
            idNivelEducativo: 'nivel1',
            idGradoEducativo: 'grado1',
            idOfertaGradoSede: 'oferta1',
            codigoMatricula: 'MAT-001',
            fechaMatricula: new Date(),
          },
          alcanceInst,
        ),
      ).rejects.toBeInstanceOf(EstructuraAcademicaIncoherenteError);
    });

    it('rechaza oferta inactiva', async () => {
      const repo = mockMatriculasRepo({
        verificarOfertaGradoSede: jest.fn().mockResolvedValue({
          id: 'oferta1',
          idSede: 'sede1',
          idAnioAcademico: 'anio1',
          idGradoEducativo: 'grado1',
          estado: 'PLANIFICADA', // not active
        }),
      });
      const caso = new CrearMatriculaBorradorCasoUso(repo);
      await expect(
        caso.ejecutar(
          {
            idSede: 'sede1',
            idEstudiante: 'est1',
            idAnioAcademico: 'anio1',
            idNivelEducativo: 'nivel1',
            idGradoEducativo: 'grado1',
            idOfertaGradoSede: 'oferta1',
            codigoMatricula: 'MAT-001',
            fechaMatricula: new Date(),
          },
          alcanceInst,
        ),
      ).rejects.toBeInstanceOf(OfertaGradoSedeInactivaError);
    });

    it('rechaza seccion inactiva', async () => {
      const repo = mockMatriculasRepo({
        verificarSeccion: jest.fn().mockResolvedValue({
          id: 'sec1',
          idOfertaGradoSede: 'oferta1',
          estado: 'INACTIVA',
        }),
      });
      const caso = new CrearMatriculaBorradorCasoUso(repo);
      await expect(
        caso.ejecutar(
          {
            idSede: 'sede1',
            idEstudiante: 'est1',
            idAnioAcademico: 'anio1',
            idNivelEducativo: 'nivel1',
            idGradoEducativo: 'grado1',
            idOfertaGradoSede: 'oferta1',
            idSeccionAcademica: 'sec1',
            codigoMatricula: 'MAT-001',
            fechaMatricula: new Date(),
          },
          alcanceInst,
        ),
      ).rejects.toBeInstanceOf(SeccionInactivaError);
    });

    it('rechaza seccion de otra oferta', async () => {
      const repo = mockMatriculasRepo({
        verificarSeccion: jest.fn().mockResolvedValue({
          id: 'sec1',
          idOfertaGradoSede: 'oferta-otra',
          estado: 'ACTIVA',
        }),
      });
      const caso = new CrearMatriculaBorradorCasoUso(repo);
      await expect(
        caso.ejecutar(
          {
            idSede: 'sede1',
            idEstudiante: 'est1',
            idAnioAcademico: 'anio1',
            idNivelEducativo: 'nivel1',
            idGradoEducativo: 'grado1',
            idOfertaGradoSede: 'oferta1',
            idSeccionAcademica: 'sec1',
            codigoMatricula: 'MAT-001',
            fechaMatricula: new Date(),
          },
          alcanceInst,
        ),
      ).rejects.toBeInstanceOf(SeccionNoCorrespondeAOfertaError);
    });

    it('rechaza operacion sobre otra sede si ambito es SEDE', async () => {
      const repo = mockMatriculasRepo();
      const caso = new CrearMatriculaBorradorCasoUso(repo);
      await expect(
        caso.ejecutar(
          {
            idSede: 'sede-otra', // different from alcanceSede1.sedeId
            idEstudiante: 'est1',
            idAnioAcademico: 'anio1',
            idNivelEducativo: 'nivel1',
            idGradoEducativo: 'grado1',
            idOfertaGradoSede: 'oferta1',
            codigoMatricula: 'MAT-001',
            fechaMatricula: new Date(),
          },
          alcanceSede1,
        ),
      ).rejects.toBeInstanceOf(OperacionSobreSedeNoPermitidaError);
    });
  });

  // ActivarMatricula
  describe('ActivarMatriculaCasoUso', () => {
    let matBorrador: Matricula;

    beforeEach(() => {
      matBorrador = new Matricula(
        'm1',
        'inst1',
        'sede1',
        'est1',
        'anio1',
        'nivel1',
        'grado1',
        'oferta1',
        'sec1',
        'MAT-001',
        new Date(),
        'BORRADOR',
        null,
        'u1',
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        new Date(),
        new Date(),
      );
    });

    it('activa matricula exitosamente', async () => {
      const repo = mockMatriculasRepo({
        buscarPorId: jest.fn().mockResolvedValue(matBorrador),
        obtenerSeccionConBloqueo: jest.fn().mockResolvedValue({
          id: 'sec1',
          capacidadMaxima: 25,
          idSede: 'sede1',
          idAnioAcademico: 'anio1',
          idGradoEducativo: 'grado1',
          idOfertaGradoSede: 'oferta1',
          estado: 'ACTIVA',
        }),
        contarMatriculasActivasEnSeccion: jest.fn().mockResolvedValue(5),
      });
      const caso = new ActivarMatriculaCasoUso(repo);
      const res = await caso.ejecutar('m1', alcanceInst);
      expect(res.id).toBe('m1');
      expect(matBorrador.estado).toBe('ACTIVA');
      expect(repo.guardar).toHaveBeenCalledTimes(1);
    });

    it('rechaza activacion si estudiante ya posee matricula activa en el año', async () => {
      const repo = mockMatriculasRepo({
        buscarPorId: jest.fn().mockResolvedValue(matBorrador),
        obtenerSeccionConBloqueo: jest.fn().mockResolvedValue({
          id: 'sec1',
          capacidadMaxima: 25,
          idSede: 'sede1',
          idAnioAcademico: 'anio1',
          idGradoEducativo: 'grado1',
          idOfertaGradoSede: 'oferta1',
          estado: 'ACTIVA',
        }),
        estudianteTieneMatriculaActiva: jest.fn().mockResolvedValue(true),
      });
      const caso = new ActivarMatriculaCasoUso(repo);
      await expect(caso.ejecutar('m1', alcanceInst)).rejects.toBeInstanceOf(
        EstudianteConMatriculaActivaError,
      );
    });

    it('rechaza activacion si seccion no tiene capacidad', async () => {
      const repo = mockMatriculasRepo({
        buscarPorId: jest.fn().mockResolvedValue(matBorrador),
        obtenerSeccionConBloqueo: jest.fn().mockResolvedValue({
          id: 'sec1',
          capacidadMaxima: 10,
          idSede: 'sede1',
          idAnioAcademico: 'anio1',
          idGradoEducativo: 'grado1',
          idOfertaGradoSede: 'oferta1',
          estado: 'ACTIVA',
        }),
        contarMatriculasActivasEnSeccion: jest.fn().mockResolvedValue(10), // full
      });
      const caso = new ActivarMatriculaCasoUso(repo);
      await expect(caso.ejecutar('m1', alcanceInst)).rejects.toBeInstanceOf(
        SeccionSinCapacidadError,
      );
    });
  });

  // CambiarSeccion
  describe('CambiarSeccionCasoUso', () => {
    let matActiva: Matricula;

    beforeEach(() => {
      matActiva = new Matricula(
        'm1',
        'inst1',
        'sede1',
        'est1',
        'anio1',
        'nivel1',
        'grado1',
        'oferta1',
        'sec1',
        'MAT-001',
        new Date(),
        'ACTIVA',
        null,
        'u1',
        'u2',
        new Date(),
        null,
        null,
        null,
        null,
        null,
        null,
        new Date(),
        new Date(),
      );
    });

    it('cambia seccion exitosamente', async () => {
      const repo = mockMatriculasRepo({
        buscarPorId: jest.fn().mockResolvedValue(matActiva),
        obtenerSeccionConBloqueo: jest.fn().mockResolvedValue({
          id: 'sec-nueva',
          capacidadMaxima: 20,
          idSede: 'sede1',
          idAnioAcademico: 'anio1',
          idGradoEducativo: 'grado1',
          idOfertaGradoSede: 'oferta1',
          estado: 'ACTIVA',
        }),
        contarMatriculasActivasEnSeccion: jest.fn().mockResolvedValue(5),
      });
      const caso = new CambiarSeccionCasoUso(repo);
      const res = await caso.ejecutar(
        'm1',
        { idSeccionNueva: 'sec-nueva', motivo: 'Cambio solicitado' },
        alcanceInst,
      );
      expect(res.id).toBe('m1');
      expect(matActiva.idSeccionAcademica).toBe('sec-nueva');
      expect(repo.registrarHistorialSeccion).toHaveBeenCalledTimes(1);
    });

    it('rechaza cambio si la nueva seccion es de otra sede/grado/año', async () => {
      const repo = mockMatriculasRepo({
        buscarPorId: jest.fn().mockResolvedValue(matActiva),
        obtenerSeccionConBloqueo: jest.fn().mockResolvedValue({
          id: 'sec-nueva',
          capacidadMaxima: 20,
          idSede: 'sede-otra', // different
          idAnioAcademico: 'anio1',
          idGradoEducativo: 'grado1',
          idOfertaGradoSede: 'oferta1',
          estado: 'ACTIVA',
        }),
      });
      const caso = new CambiarSeccionCasoUso(repo);
      await expect(
        caso.ejecutar(
          'm1',
          { idSeccionNueva: 'sec-nueva', motivo: 'Mudar' },
          alcanceInst,
        ),
      ).rejects.toBeInstanceOf(EstructuraAcademicaIncoherenteError);
    });
  });

  // ActualizarMatriculaBorrador
  describe('ActualizarMatriculaBorradorCasoUso', () => {
    it('actualiza borrador exitosamente', async () => {
      const matBorrador = new Matricula(
        'm1',
        'inst1',
        'sede1',
        'est1',
        'anio1',
        'nivel1',
        'grado1',
        'oferta1',
        null,
        'MAT-001',
        new Date(),
        'BORRADOR',
        null,
        'u1',
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        new Date(),
        new Date(),
      );
      const repo = mockMatriculasRepo({
        buscarPorId: jest.fn().mockResolvedValue(matBorrador),
      });
      const caso = new ActualizarMatriculaBorradorCasoUso(repo);
      const res = await caso.ejecutar(
        'm1',
        { observacion: 'Nueva obs' },
        alcanceInst,
      );
      expect(res.id).toBe('m1');
      expect(matBorrador.observacion).toBe('Nueva obs');
    });
  });

  // AnularMatricula
  describe('AnularMatriculaCasoUso', () => {
    it('anula matricula borrador', async () => {
      const matBorrador = new Matricula(
        'm1',
        'inst1',
        'sede1',
        'est1',
        'anio1',
        'nivel1',
        'grado1',
        'oferta1',
        null,
        'MAT-001',
        new Date(),
        'BORRADOR',
        null,
        'u1',
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        new Date(),
        new Date(),
      );
      const repo = mockMatriculasRepo({
        buscarPorId: jest.fn().mockResolvedValue(matBorrador),
      });
      const caso = new AnularMatriculaCasoUso(repo);
      const res = await caso.ejecutar(
        'm1',
        { motivo: 'Error administrativo' },
        alcanceInst,
      );
      expect(res.id).toBe('m1');
      expect(matBorrador.estado).toBe('ANULADA');
    });
  });

  // RetirarMatricula
  describe('RetirarMatriculaCasoUso', () => {
    it('retira matricula activa', async () => {
      const matActiva = new Matricula(
        'm1',
        'inst1',
        'sede1',
        'est1',
        'anio1',
        'nivel1',
        'grado1',
        'oferta1',
        null,
        'MAT-001',
        new Date(),
        'ACTIVA',
        null,
        'u1',
        'u2',
        new Date(),
        null,
        null,
        null,
        null,
        null,
        null,
        new Date(),
        new Date(),
      );
      const repo = mockMatriculasRepo({
        buscarPorId: jest.fn().mockResolvedValue(matActiva),
      });
      const caso = new RetirarMatriculaCasoUso(repo);
      const res = await caso.ejecutar(
        'm1',
        { motivo: 'Retiro voluntario' },
        alcanceInst,
      );
      expect(res.id).toBe('m1');
      expect(matActiva.estado).toBe('RETIRADA');
    });
  });
});
