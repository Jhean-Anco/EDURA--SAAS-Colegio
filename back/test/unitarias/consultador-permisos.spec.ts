import { ConsultadorPermisosEfectivosTypeorm } from '../../src/compartido/infraestructura/persistencia/consultador-permisos.typeorm';

describe('ConsultadorPermisosEfectivosTypeorm', () => {
  it('filtra permisos por ámbito institucional y de sede', async () => {
    const query = jest
      .fn()
      .mockResolvedValueOnce([
        { codigo: 'PERSONAS.LEER' },
        { codigo: 'SEDES.LEER' },
      ]);
    const consultador = new ConsultadorPermisosEfectivosTypeorm({
      manager: { query },
    } as never);

    const permisos = await consultador.listar({
      usuarioId: 'usuario-1',
      rolId: 'rol-1',
      institucionId: 'inst-1',
      sedeId: 'sede-1',
    });

    expect(permisos).toEqual(['PERSONAS.LEER', 'SEDES.LEER']);
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining("r.ambito = 'INSTITUCION'"),
      ['usuario-1', 'rol-1', 'inst-1', 'sede-1'],
    );
  });

  it('retorna vacío cuando no hay rol de contexto', async () => {
    const query = jest.fn();
    const consultador = new ConsultadorPermisosEfectivosTypeorm({
      manager: { query },
    } as never);

    await expect(
      consultador.listar({
        usuarioId: 'usuario-1',
        rolId: null,
        institucionId: 'inst-1',
        sedeId: null,
      }),
    ).resolves.toEqual([]);
    expect(query).not.toHaveBeenCalled();
  });
});
