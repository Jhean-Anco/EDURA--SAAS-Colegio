import { CrearAreaCurricularCasoUso } from '../../src/modulos/curriculo/aplicacion/areas/crear-area-curricular.caso-uso';
import { ActualizarAreaCurricularCasoUso } from '../../src/modulos/curriculo/aplicacion/areas/actualizar-area-curricular.caso-uso';
import { CambiarEstadoAreaCurricularCasoUso } from '../../src/modulos/curriculo/aplicacion/areas/cambiar-estado-area-curricular.caso-uso';
import { CrearAsignaturaCasoUso } from '../../src/modulos/curriculo/aplicacion/asignaturas/crear-asignatura.caso-uso';
import { CambiarEstadoAsignaturaCasoUso } from '../../src/modulos/curriculo/aplicacion/asignaturas/cambiar-estado-asignatura.caso-uso';
import { CrearPlanEstudioCasoUso } from '../../src/modulos/curriculo/aplicacion/planes-estudio/crear-plan-estudio.caso-uso';
import { CambiarEstadoPlanEstudioCasoUso } from '../../src/modulos/curriculo/aplicacion/planes-estudio/cambiar-estado-plan-estudio.caso-uso';
import { DuplicarPlanEstudioCasoUso } from '../../src/modulos/curriculo/aplicacion/planes-estudio/duplicar-plan-estudio.caso-uso';
import { AprobarPlanEstudioCasoUso } from '../../src/modulos/curriculo/aplicacion/planes-estudio/aprobar-plan-estudio.caso-uso';
import { AgregarDetallePlanEstudioCasoUso } from '../../src/modulos/curriculo/aplicacion/planes-estudio/agregar-detalle-plan-estudio.caso-uso';

import {
  AreaCodigoDuplicadoError,
  AreaConAsignaturasActivasError,
  AsignaturaAreaFueraDeInstitucionError,
  AsignaturaEnUsoError,
  PlanSinDetallesError,
  PlanVigenteYaExisteError,
} from '../../src/modulos/curriculo/dominio/errores-curriculo';

import {
  RepositorioAreasCurriculares,
  RepositorioAsignaturas,
  RepositorioPlanesEstudio,
  AlcanceAcceso,
} from '../../src/modulos/curriculo/dominio/puertos/curriculo.puerto';

const INST_A = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const USER_A = 'user-admin-aaaa';
const alcance: AlcanceAcceso = {
  usuarioId: USER_A,
  institucionId: INST_A,
  ambito: 'INSTITUCION',
  sedeId: null,
};

describe('Curriculo y Planes de Estudio Unit Tests', () => {
  describe('Áreas Curriculares', () => {
    let repo: jest.Mocked<RepositorioAreasCurriculares>;

    beforeEach(() => {
      repo = {
        existeCodigoAreaEnInstitucion: jest.fn(),
        existeNombreAreaEnInstitucion: jest.fn(),
        existeOrdenAreaEnInstitucion: jest.fn(),
        crearArea: jest.fn(),
        obtenerAreaBase: jest.fn(),
        actualizarArea: jest.fn(),
        cambiarEstadoArea: jest.fn(),
        tieneAsignaturasActivas: jest.fn(),
      };
    });

    it('CrearAreaCurricularCasoUso crea área con éxito', async () => {
      repo.existeCodigoAreaEnInstitucion.mockResolvedValue(false);
      repo.existeNombreAreaEnInstitucion.mockResolvedValue(false);
      repo.existeOrdenAreaEnInstitucion.mockResolvedValue(false);
      repo.crearArea.mockResolvedValue({ id: 'area-1' });

      const caso = new CrearAreaCurricularCasoUso(repo);
      const res = await caso.ejecutar(
        {
          codigo: 'MATEMATICA',
          nombre: 'Matemática',
          orden: 1,
        },
        alcance,
      );

      expect(res.id).toBe('area-1');
      expect(repo.crearArea).toHaveBeenCalledWith(
        expect.objectContaining({
          codigoNormalizado: 'MATEMATICA',
          nombreNormalizado: 'MATEMÁTICA',
        }),
      );
    });

    it('CrearAreaCurricularCasoUso lanza AreaCodigoDuplicadoError si código duplicado', async () => {
      repo.existeCodigoAreaEnInstitucion.mockResolvedValue(true);

      const caso = new CrearAreaCurricularCasoUso(repo);
      await expect(
        caso.ejecutar(
          {
            codigo: 'MATEMATICA',
            nombre: 'Matemática',
            orden: 1,
          },
          alcance,
        ),
      ).rejects.toBeInstanceOf(AreaCodigoDuplicadoError);
    });

    it('ActualizarAreaCurricularCasoUso actualiza éxitosamente', async () => {
      repo.obtenerAreaBase.mockResolvedValue({
        id: 'area-1',
        estado: 'ACTIVA',
      });
      repo.existeCodigoAreaEnInstitucion.mockResolvedValue(false);
      repo.existeNombreAreaEnInstitucion.mockResolvedValue(false);
      repo.existeOrdenAreaEnInstitucion.mockResolvedValue(false);
      repo.actualizarArea.mockResolvedValue(true);

      const caso = new ActualizarAreaCurricularCasoUso(repo);
      await caso.ejecutar(
        {
          id: 'area-1',
          nombre: 'Matemáticas Avanzadas',
        },
        alcance,
      );

      expect(repo.actualizarArea).toHaveBeenCalled();
    });

    it('CambiarEstadoAreaCurricularCasoUso cambia a INACTIVA si no tiene asignaturas activas', async () => {
      repo.obtenerAreaBase.mockResolvedValue({
        id: 'area-1',
        estado: 'ACTIVA',
      });
      repo.tieneAsignaturasActivas.mockResolvedValue(false);
      repo.cambiarEstadoArea.mockResolvedValue(true);

      const caso = new CambiarEstadoAreaCurricularCasoUso(repo);
      await caso.ejecutar('area-1', 'INACTIVA', alcance);

      expect(repo.cambiarEstadoArea).toHaveBeenCalledWith(
        'area-1',
        INST_A,
        'INACTIVA',
      );
    });

    it('CambiarEstadoAreaCurricularCasoUso lanza AreaConAsignaturasActivasError al inactivar con asignaturas activas', async () => {
      repo.obtenerAreaBase.mockResolvedValue({
        id: 'area-1',
        estado: 'ACTIVA',
      });
      repo.tieneAsignaturasActivas.mockResolvedValue(true);

      const caso = new CambiarEstadoAreaCurricularCasoUso(repo);
      await expect(
        caso.ejecutar('area-1', 'INACTIVA', alcance),
      ).rejects.toBeInstanceOf(AreaConAsignaturasActivasError);
    });
  });

  describe('Asignaturas', () => {
    let repo: jest.Mocked<RepositorioAsignaturas>;

    beforeEach(() => {
      repo = {
        existeAreaEnInstitucion: jest.fn(),
        existeCodigoAsignaturaEnInstitucion: jest.fn(),
        existeOrdenAsignaturaEnArea: jest.fn(),
        crearAsignatura: jest.fn(),
        obtenerAsignaturaBase: jest.fn(),
        actualizarAsignatura: jest.fn(),
        cambiarEstadoAsignatura: jest.fn(),
        estaAsignaturaEnPlanActivo: jest.fn(),
        esAreaDeOtraInstitucion: jest.fn(),
      };
    });

    it('CrearAsignaturaCasoUso crea asignatura con éxito', async () => {
      repo.existeAreaEnInstitucion.mockResolvedValue(true);
      repo.existeCodigoAsignaturaEnInstitucion.mockResolvedValue(false);
      repo.existeOrdenAsignaturaEnArea.mockResolvedValue(false);
      repo.crearAsignatura.mockResolvedValue({ id: 'asig-1' });

      const caso = new CrearAsignaturaCasoUso(repo);
      const res = await caso.ejecutar(
        {
          idAreaCurricular: 'area-1',
          codigo: 'ALGEBRA',
          nombre: 'Álgebra',
          orden: 1,
        },
        alcance,
      );

      expect(res.id).toBe('asig-1');
    });

    it('CrearAsignaturaCasoUso lanza AsignaturaAreaFueraDeInstitucionError si área no existe', async () => {
      repo.existeAreaEnInstitucion.mockResolvedValue(false);

      const caso = new CrearAsignaturaCasoUso(repo);
      await expect(
        caso.ejecutar(
          {
            idAreaCurricular: 'area-1',
            codigo: 'ALGEBRA',
            nombre: 'Álgebra',
            orden: 1,
          },
          alcance,
        ),
      ).rejects.toBeInstanceOf(AsignaturaAreaFueraDeInstitucionError);
    });

    it('CambiarEstadoAsignaturaCasoUso a INACTIVA lanza AsignaturaEnUsoError si está en plan activo', async () => {
      repo.obtenerAsignaturaBase.mockResolvedValue({
        id: 'asig-1',
        estado: 'ACTIVA',
        idAreaCurricular: 'area-1',
      });
      repo.estaAsignaturaEnPlanActivo.mockResolvedValue(true);

      const caso = new CambiarEstadoAsignaturaCasoUso(repo);
      await expect(
        caso.ejecutar('asig-1', 'INACTIVA', alcance),
      ).rejects.toBeInstanceOf(AsignaturaEnUsoError);
    });
  });

  describe('Planes de Estudio', () => {
    let repo: jest.Mocked<RepositorioPlanesEstudio>;

    beforeEach(() => {
      repo = {
        existeAnioEnInstitucion: jest.fn(),
        existeGradoEnInstitucion: jest.fn(),
        obtenerEstadoAnio: jest.fn(),
        existeCodigoPlanEnInstitucion: jest.fn(),
        existeVersionPlanEnAnioGrado: jest.fn(),
        obtenerSiguienteVersionPlan: jest.fn(),
        crearPlan: jest.fn(),
        obtenerPlanBase: jest.fn(),
        actualizarPlan: jest.fn(),
        cambiarEstadoPlan: jest.fn(),
        existePlanVigenteParaAnioGrado: jest.fn(),
        contarDetallesActivos: jest.fn(),
        tieneAsignaturasInactivasEnDetalle: jest.fn(),
        existeAsignaturaEnPlan: jest.fn(),
        existeOrdenDetalleEnPlan: jest.fn(),
        agregarDetalle: jest.fn(),
        obtenerDetalleBase: jest.fn(),
        actualizarDetalle: jest.fn(),
        cambiarEstadoDetalle: jest.fn(),
        duplicarPlan: jest.fn(),
      };
    });

    it('CrearPlanEstudioCasoUso crea con éxito', async () => {
      repo.existeAnioEnInstitucion.mockResolvedValue(true);
      repo.existeGradoEnInstitucion.mockResolvedValue(true);
      repo.obtenerEstadoAnio.mockResolvedValue('ACTIVO');
      repo.existeCodigoPlanEnInstitucion.mockResolvedValue(false);
      repo.obtenerSiguienteVersionPlan.mockResolvedValue(1);
      repo.crearPlan.mockResolvedValue({ id: 'plan-1' });

      const caso = new CrearPlanEstudioCasoUso(repo);
      const res = await caso.ejecutar(
        {
          idAnioAcademico: 'anio-1',
          idGradoEducativo: 'grado-1',
          codigo: 'PLAN-1ERO-MAT',
          nombre: 'Plan 1ero Matemática',
        },
        alcance,
      );

      expect(res.id).toBe('plan-1');
    });

    it('AprobarPlanEstudioCasoUso de BORRADOR a APROBADO requiere detalles activos', async () => {
      repo.obtenerPlanBase.mockResolvedValue({
        id: 'plan-1',
        estado: 'BORRADOR',
        idAnioAcademico: 'anio-1',
        idGradoEducativo: 'grado-1',
      });
      repo.contarDetallesActivos.mockResolvedValue(0);

      const caso = new AprobarPlanEstudioCasoUso(repo);
      await expect(caso.ejecutar('plan-1', alcance)).rejects.toBeInstanceOf(
        PlanSinDetallesError,
      );
    });

    it('CambiarEstadoPlanEstudioCasoUso de APROBADO a VIGENTE valida que no exista otro plan vigente', async () => {
      repo.obtenerPlanBase.mockResolvedValue({
        id: 'plan-1',
        estado: 'APROBADO',
        idAnioAcademico: 'anio-1',
        idGradoEducativo: 'grado-1',
      });
      repo.obtenerEstadoAnio.mockResolvedValue('ACTIVO');
      repo.existePlanVigenteParaAnioGrado.mockResolvedValue(true);

      const caso = new CambiarEstadoPlanEstudioCasoUso(repo);
      await expect(
        caso.ejecutar('plan-1', 'VIGENTE', alcance),
      ).rejects.toBeInstanceOf(PlanVigenteYaExisteError);
    });

    it('AgregarDetallePlanEstudioCasoUso agrega detalle con éxito', async () => {
      repo.obtenerPlanBase.mockResolvedValue({
        id: 'plan-1',
        estado: 'BORRADOR',
        idAnioAcademico: 'anio-1',
        idGradoEducativo: 'grado-1',
      });
      repo.existeAsignaturaEnPlan.mockResolvedValue(false);
      repo.existeOrdenDetalleEnPlan.mockResolvedValue(false);
      repo.agregarDetalle.mockResolvedValue({ id: 'det-1' });

      const caso = new AgregarDetallePlanEstudioCasoUso(repo);
      const res = await caso.ejecutar(
        {
          idPlanEstudio: 'plan-1',
          idAsignatura: 'asig-1',
          tipo: 'OBLIGATORIA',
          horasSemanales: 4,
          horasAnuales: 160,
          orden: 1,
        },
        alcance,
      );

      expect(res.id).toBe('det-1');
    });

    it('DuplicarPlanEstudioCasoUso duplica con éxito', async () => {
      repo.obtenerPlanBase.mockResolvedValue({
        id: 'plan-1',
        estado: 'VIGENTE',
        idAnioAcademico: 'anio-1',
        idGradoEducativo: 'grado-1',
      });
      repo.existeAnioEnInstitucion.mockResolvedValue(true);
      repo.obtenerEstadoAnio.mockResolvedValue('ACTIVO');
      repo.existeCodigoPlanEnInstitucion.mockResolvedValue(false);
      repo.obtenerSiguienteVersionPlan.mockResolvedValue(1);
      repo.duplicarPlan.mockResolvedValue({ id: 'plan-2' });

      const caso = new DuplicarPlanEstudioCasoUso(repo);
      const res = await caso.ejecutar(
        {
          idPlanOrigen: 'plan-1',
          idAnioAcademico: 'anio-2',
          codigo: 'PLAN-2-DUP',
          nombre: 'Plan Duplicado',
        },
        alcance,
      );

      expect(res.id).toBe('plan-2');
    });
  });
});
