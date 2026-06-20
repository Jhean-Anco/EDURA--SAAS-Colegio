/* eslint-disable @typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-assignment */
import { ForbiddenException } from '@nestjs/common';
import { CrearEstudianteCasoUso } from '../../src/modulos/estudiantes/aplicacion/crear-estudiante.caso-uso';
import { AgregarApoderadoEstudianteCasoUso } from '../../src/modulos/estudiantes/aplicacion/agregar-apoderado-estudiante.caso-uso';
import { ActualizarApoderadoEstudianteCasoUso } from '../../src/modulos/estudiantes/aplicacion/actualizar-apoderado-estudiante.caso-uso';
import { CambiarEstadoEstudianteCasoUso } from '../../src/modulos/estudiantes/aplicacion/cambiar-estado-estudiante.caso-uso';

function crearDs(respuestas: Record<string, any[]>) {
  return {
    query: jest.fn((sql: string) => {
      const key = Object.keys(respuestas).find((k) => sql.includes(k));
      return Promise.resolve(respuestas[key ?? ''] ?? []);
    }),
  } as any;
}

describe('Casos de uso estudiantes', () => {
  it('crea estudiante válido', async () => {
    const ds = crearDs({
      'FROM sedes': [{ id: 's1' }],
      'FROM personas': [{ id: 'p1' }],
      'FROM estudiantes WHERE id_institucion_educativa = $1 AND codigo = $2':
        [],
      'FROM estudiantes WHERE id_institucion_educativa = $1 AND id_persona = $2':
        [],
      'INSERT INTO estudiantes': [{ id: 'e1' }],
    });
    const caso = new CrearEstudianteCasoUso(ds as never);
    await expect(
      caso.ejecutar({
        institucionId: 'i1',
        idPersona: 'p1',
        idSede: 's1',
        codigo: 'EST-001',
      }),
    ).resolves.toEqual({ id: 'e1' });
  });

  it('rechaza apoderado principal duplicado', async () => {
    const ds = crearDs({
      'FROM estudiantes WHERE id = $1 AND id_institucion_educativa = $2': [
        { id: 'e1' },
      ],
      'FROM personas WHERE id = $1 AND id_institucion_educativa = $2': [
        { id: 'p1' },
      ],
      'es_principal = true': [{ id: 'a1' }],
    });
    const caso = new AgregarApoderadoEstudianteCasoUso(ds as never);
    await expect(
      caso.ejecutar({
        institucionId: 'i1',
        estudianteId: 'e1',
        idPersona: 'p1',
        parentesco: 'MADRE',
        esPrincipal: true,
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('cambia estado sin borrar', async () => {
    const ds = crearDs({
      'FROM estudiantes WHERE id = $1 AND id_institucion_educativa = $2': [
        { id: 'e1' },
      ],
      'UPDATE estudiantes SET estado': [{ rowCount: 1 }],
    });
    const caso = new CambiarEstadoEstudianteCasoUso(ds as never);
    await expect(
      caso.ejecutar({ institucionId: 'i1', id: 'e1', estado: 'INACTIVO' }),
    ).resolves.toBeUndefined();
  });

  it('rechaza principal duplicado al actualizar', async () => {
    const ds = crearDs({
      'SELECT id, es_principal FROM apoderados_estudiante': [
        { id: 'a1', es_principal: false },
      ],
      "estado = 'ACTIVO' AND es_principal = true": [{ id: 'a2' }],
    });
    const caso = new ActualizarApoderadoEstudianteCasoUso(ds as never);
    await expect(
      caso.ejecutar({
        institucionId: 'i1',
        estudianteId: 'e1',
        idApoderado: 'a1',
        esPrincipal: true,
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
