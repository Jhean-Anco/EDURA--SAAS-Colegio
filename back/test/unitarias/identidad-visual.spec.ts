import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  ObtenerIdentidadVisualConsulta,
  ObtenerBorradorIdentidadConsulta,
  ActualizarBorradorIdentidadCasoUso,
  PublicarIdentidadVisualCasoUso,
  InactivarIdentidadVisualCasoUso,
} from '../../src/modulos/identidad-visual/aplicacion/identidades/identidad.casos-uso';
import {
  IdentidadVisualInstitucionTypeormEntidad,
  VersionIdentidadVisualTypeormEntidad,
} from '../../src/modulos/identidad-visual/infraestructura/persistencia/typeorm/entidades/identidad-visual.typeorm-entidades';
import {
  RepositorioIdentidadVisual,
  RepositorioVersionesIdentidad,
} from '../../src/modulos/identidad-visual/dominio/puertos/repositorios';

describe('Identidad Visual - Casos de Uso', () => {
  let mockIdentidadRepo: jest.Mocked<RepositorioIdentidadVisual>;
  let mockVersionesRepo: jest.Mocked<RepositorioVersionesIdentidad>;
  let mockDataSource: jest.Mocked<DataSource>;

  beforeEach(() => {
    mockIdentidadRepo = {
      buscarPorInstitucion: jest.fn(),
      guardar: jest.fn(),
    };

    mockVersionesRepo = {
      buscarPorId: jest.fn(),
      buscarBorrador: jest.fn(),
      buscarPublicada: jest.fn(),
      guardar: jest.fn(),
      obtenerSiguienteNumeroVersion: jest.fn(),
    };

    const mockEntityManager = {
      query: jest.fn(),
      save: jest.fn(),
    };

    mockDataSource = {
      transaction: jest.fn().mockImplementation((cb) => cb(mockEntityManager)),
    } as unknown as jest.Mocked<DataSource>;
  });

  describe('ObtenerIdentidadVisualConsulta', () => {
    it('debe lanzar NotFoundException si no existe configuración', async () => {
      mockIdentidadRepo.buscarPorInstitucion.mockResolvedValue(null);
      const consulta = new ObtenerIdentidadVisualConsulta(mockIdentidadRepo);

      await expect(consulta.ejecutar('inst-1')).rejects.toThrow(NotFoundException);
    });

    it('debe retornar la identidad si existe', async () => {
      const identidad = new IdentidadVisualInstitucionTypeormEntidad();
      identidad.id = 'id-1';
      identidad.idInstitucionEducativa = 'inst-1';
      mockIdentidadRepo.buscarPorInstitucion.mockResolvedValue(identidad);

      const consulta = new ObtenerIdentidadVisualConsulta(mockIdentidadRepo);
      const result = await consulta.ejecutar('inst-1');
      expect(result).toBe(identidad);
    });
  });

  describe('ObtenerBorradorIdentidadConsulta', () => {
    it('debe retornar borrador existente', async () => {
      const identidad = new IdentidadVisualInstitucionTypeormEntidad();
      identidad.id = 'id-1';
      const borrador = new VersionIdentidadVisualTypeormEntidad();
      borrador.estado = 'BORRADOR';

      mockIdentidadRepo.buscarPorInstitucion.mockResolvedValue(identidad);
      mockVersionesRepo.buscarBorrador.mockResolvedValue(borrador);

      const consulta = new ObtenerBorradorIdentidadConsulta(mockIdentidadRepo, mockVersionesRepo);
      const result = await consulta.ejecutar('inst-1');
      expect(result).toBe(borrador);
    });

    it('debe crear un nuevo borrador si no existe', async () => {
      const identidad = new IdentidadVisualInstitucionTypeormEntidad();
      identidad.id = 'id-1';

      mockIdentidadRepo.buscarPorInstitucion.mockResolvedValue(identidad);
      mockVersionesRepo.buscarBorrador.mockResolvedValue(null);
      mockVersionesRepo.buscarPublicada.mockResolvedValue(null);
      mockVersionesRepo.obtenerSiguienteNumeroVersion.mockResolvedValue(1);

      const consulta = new ObtenerBorradorIdentidadConsulta(mockIdentidadRepo, mockVersionesRepo);
      const result = await consulta.ejecutar('inst-1');

      expect(result.estado).toBe('BORRADOR');
      expect(result.numeroVersion).toBe(1);
      expect(mockVersionesRepo.guardar).toHaveBeenCalled();
    });
  });

  describe('ActualizarBorradorIdentidadCasoUso', () => {
    it('debe validar colores hexadecimales válidos', async () => {
      const identidad = new IdentidadVisualInstitucionTypeormEntidad();
      identidad.id = 'id-1';
      mockIdentidadRepo.buscarPorInstitucion.mockResolvedValue(identidad);
      mockVersionesRepo.buscarBorrador.mockResolvedValue(new VersionIdentidadVisualTypeormEntidad());

      const casoUso = new ActualizarBorradorIdentidadCasoUso(mockIdentidadRepo, mockVersionesRepo);

      const dtoInvalido = {
        nombreMarca: 'Colegio',
        colorPrimario: 'invalido', // Invalido
        colorSobrePrimario: '#FFFFFF',
        colorSecundario: '#FFFFFF',
        colorAcento: '#FFFFFF',
        colorFondo: '#FFFFFF',
        colorSuperficie: '#FFFFFF',
        colorTextoPrincipal: '#FFFFFF',
        colorTextoSecundario: '#FFFFFF',
        varianteLogin: 'CENTRAL',
      };

      await expect(casoUso.ejecutar('inst-1', dtoInvalido, 'usr-1')).rejects.toThrow(BadRequestException);
    });

    it('debe guardar cambios si los colores son válidos', async () => {
      const identidad = new IdentidadVisualInstitucionTypeormEntidad();
      identidad.id = 'id-1';
      mockIdentidadRepo.buscarPorInstitucion.mockResolvedValue(identidad);
      mockVersionesRepo.buscarBorrador.mockResolvedValue(new VersionIdentidadVisualTypeormEntidad());

      const casoUso = new ActualizarBorradorIdentidadCasoUso(mockIdentidadRepo, mockVersionesRepo);

      const dtoValido = {
        nombreMarca: 'Colegio',
        colorPrimario: '#1E3A8A',
        colorSobrePrimario: '#FFFFFF',
        colorSecundario: '#D8A72D',
        colorAcento: '#3B82F6',
        colorFondo: '#F8FAFC',
        colorSuperficie: '#FFFFFF',
        colorTextoPrincipal: '#172033',
        colorTextoSecundario: '#536078',
        varianteLogin: 'CENTRAL',
      };

      const result = await casoUso.ejecutar('inst-1', dtoValido, 'usr-1');
      expect(result.nombreMarca).toBe('Colegio');
      expect(result.colorPrimario).toBe('#1E3A8A');
      expect(mockVersionesRepo.guardar).toHaveBeenCalled();
    });
  });

  describe('PublicarIdentidadVisualCasoUso', () => {
    it('debe lanzar NotFoundException si no existe identidad visual', async () => {
      mockIdentidadRepo.buscarPorInstitucion.mockResolvedValue(null);
      const casoUso = new PublicarIdentidadVisualCasoUso(mockDataSource, mockIdentidadRepo, mockVersionesRepo);

      await expect(casoUso.ejecutar('inst-1', 'usr-1')).rejects.toThrow(NotFoundException);
    });

    it('debe lanzar BadRequestException si no existe borrador', async () => {
      const identidad = new IdentidadVisualInstitucionTypeormEntidad();
      mockIdentidadRepo.buscarPorInstitucion.mockResolvedValue(identidad);
      mockVersionesRepo.buscarBorrador.mockResolvedValue(null);

      const casoUso = new PublicarIdentidadVisualCasoUso(mockDataSource, mockIdentidadRepo, mockVersionesRepo);

      await expect(casoUso.ejecutar('inst-1', 'usr-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('InactivarIdentidadVisualCasoUso', () => {
    it('debe marcar como INACTIVA', async () => {
      const identidad = new IdentidadVisualInstitucionTypeormEntidad();
      identidad.estado = 'ACTIVA';
      mockIdentidadRepo.buscarPorInstitucion.mockResolvedValue(identidad);

      const casoUso = new InactivarIdentidadVisualCasoUso(mockIdentidadRepo);
      const result = await casoUso.ejecutar('inst-1');

      expect(result.ok).toBe(true);
      expect(identidad.estado).toBe('INACTIVA');
      expect(mockIdentidadRepo.guardar).toHaveBeenCalledWith(identidad);
    });
  });
});
