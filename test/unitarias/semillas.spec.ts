import { catalogos } from '../../src/base-datos/typeorm/semillas/catalogos';
import { tiposDocumentoIdentidad } from '../../src/base-datos/typeorm/semillas/tipos-documento';
import {
  permisosSistema,
  rolesSistema,
  permisosAdministradorInstitucion,
  permisosDirectorSede,
} from '../../src/base-datos/typeorm/semillas/permisos-roles';

describe('Catálogos de infraestructura', () => {
  it('define catálogos tipados y legibles', () => {
    expect(catalogos.estadosConservacion[0]).toMatchObject({
      codigo: 'NUEVO',
      nombre: 'Nuevo',
      orden: 1,
    });
    expect(catalogos.unidadesMedida).toContainEqual(
      expect.objectContaining({
        codigo: 'METRO',
        magnitud: 'LONGITUD',
        activo: true,
      }),
    );
    expect(catalogos.tiposEspacioFisico).toContainEqual(
      expect.objectContaining({ codigo: 'AULA', requiere_aforo: true }),
    );
  });

  it('todos los registros tienen campo codigo', () => {
    const todos = [
      ...catalogos.estadosConservacion,
      ...catalogos.unidadesMedida,
      ...catalogos.tiposEspacioFisico,
      ...catalogos.tiposComponenteInfraestructura,
    ];
    for (const r of todos) {
      expect(typeof r.codigo).toBe('string');
      expect(r.codigo.length).toBeGreaterThan(0);
    }
  });

  it('no hay codigos duplicados en ningún catálogo', () => {
    const verificarUnicos = (lista: readonly { codigo: string }[]) => {
      const codigos = lista.map((r) => r.codigo);
      const unicos = new Set(codigos);
      expect(unicos.size).toBe(codigos.length);
    };
    verificarUnicos(catalogos.estadosConservacion);
    verificarUnicos(catalogos.unidadesMedida);
    verificarUnicos(catalogos.tiposEspacioFisico);
    verificarUnicos(catalogos.tiposComponenteInfraestructura);
  });
});

describe('Tipos de documento de identidad', () => {
  it('incluye DNI con patrón de 8 dígitos', () => {
    const dni = tiposDocumentoIdentidad.find((t) => t.codigo === 'DNI');
    expect(dni).toBeDefined();
    expect(dni?.longitud_minima).toBe(8);
    expect(dni?.longitud_maxima).toBe(8);
    expect(dni?.patron).toBe('^[0-9]{8}$');
  });

  it('incluye los 6 tipos requeridos', () => {
    const codigos = tiposDocumentoIdentidad.map((t) => t.codigo);
    expect(codigos).toContain('DNI');
    expect(codigos).toContain('CARNET_EXTRANJERIA');
    expect(codigos).toContain('PASAPORTE');
    expect(codigos).toContain('CPP');
    expect(codigos).toContain('PARTIDA_NACIMIENTO');
    expect(codigos).toContain('OTRO');
  });

  it('no hay codigos duplicados', () => {
    const codigos = tiposDocumentoIdentidad.map((t) => t.codigo);
    expect(new Set(codigos).size).toBe(codigos.length);
  });

  it('longitudes son consistentes (minima <= maxima)', () => {
    for (const tipo of tiposDocumentoIdentidad) {
      if (tipo.longitud_minima !== null && tipo.longitud_maxima !== null) {
        expect(tipo.longitud_minima).toBeLessThanOrEqual(tipo.longitud_maxima);
      }
    }
  });
});

describe('Permisos del sistema', () => {
  it('todos tienen codigo, recurso y accion', () => {
    for (const permiso of permisosSistema) {
      expect(permiso.codigo).toBe(`${permiso.recurso}.${permiso.accion}`);
      expect(permiso.descripcion.length).toBeGreaterThan(0);
    }
  });

  it('no hay codigos duplicados', () => {
    const codigos = permisosSistema.map((p) => p.codigo);
    expect(new Set(codigos).size).toBe(codigos.length);
  });

  it('incluye los permisos mínimos de personas', () => {
    const codigos = permisosSistema.map((p) => p.codigo);
    expect(codigos).toContain('PERSONAS.LEER');
    expect(codigos).toContain('PERSONAS.CREAR');
    expect(codigos).toContain('PERSONAS.GESTIONAR_DOCUMENTOS');
    expect(codigos).toContain('PERSONAS.CONSULTAR_DNI');
  });
});

describe('Roles del sistema', () => {
  it('incluye los 3 roles base', () => {
    const codigos = rolesSistema.map((r) => r.codigo);
    expect(codigos).toContain('PROPIETARIO_PLATAFORMA');
    expect(codigos).toContain('ADMINISTRADOR_INSTITUCION');
    expect(codigos).toContain('DIRECTOR_SEDE');
  });

  it('cada rol tiene ambito válido', () => {
    const ambitosValidos = ['PLATAFORMA', 'INSTITUCION', 'SEDE'];
    for (const rol of rolesSistema) {
      expect(ambitosValidos).toContain(rol.ambito);
    }
  });
});

describe('Asignaciones de permisos por rol', () => {
  const codigosPermiso = new Set(permisosSistema.map((p) => p.codigo));

  it('todos los permisos de ADMINISTRADOR_INSTITUCION existen en permisosSistema', () => {
    for (const codigo of permisosAdministradorInstitucion) {
      expect(codigosPermiso).toContain(codigo);
    }
  });

  it('todos los permisos de DIRECTOR_SEDE existen en permisosSistema', () => {
    for (const codigo of permisosDirectorSede) {
      expect(codigosPermiso).toContain(codigo);
    }
  });

  it('DIRECTOR_SEDE tiene subconjunto de permisos del ADMINISTRADOR_INSTITUCION', () => {
    const adminSet = new Set(permisosAdministradorInstitucion);
    for (const codigo of permisosDirectorSede) {
      expect(adminSet).toContain(codigo);
    }
  });

  it('ADMINISTRADOR_INSTITUCION no puede crear instituciones (es cliente de plataforma)', () => {
    expect(permisosAdministradorInstitucion).not.toContain(
      'INSTITUCIONES.CREAR',
    );
  });
});
