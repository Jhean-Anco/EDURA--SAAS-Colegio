import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { entidadesTypeOrm } from '../../src/base-datos/typeorm/typeorm.registro';

describe('Registro TypeORM', () => {
  it('contiene exactamente 60 entidades', () => {
    expect(entidadesTypeOrm).toHaveLength(60);
  });

  it('no duplica un segundo id en las especializaciones', () => {
    const especializaciones = [
      'predio.typeorm-entidad.ts',
      'edificacion.typeorm-entidad.ts',
      'nivel.typeorm-entidad.ts',
      'espacio-fisico.typeorm-entidad.ts',
      'espacio-exterior.typeorm-entidad.ts',
      'componente-infraestructura.typeorm-entidad.ts',
    ];

    for (const archivo of especializaciones) {
      const contenido = readFileSync(
        join(
          process.cwd(),
          'src/modulos/infraestructura-fisica/infraestructura/persistencia/typeorm/entidades',
          archivo,
        ),
        'utf8',
      );
      expect(
        contenido.match(/@PrimaryGeneratedColumn\(|@PrimaryColumn\(/g),
      ).toHaveLength(1);
      expect(contenido).not.toMatch(/\bidSede\b/);
      expect(contenido).not.toMatch(/\bnombre\b/);
      expect(contenido).not.toMatch(/\bcodigo\b/);
      expect(contenido).not.toMatch(/\bestado\b/);
      expect(contenido).not.toMatch(/\bfechaCreacion\b/);
      expect(contenido).not.toMatch(/\bfechaModificacion\b/);
    }
  });

  it('incluye las entidades de personas', () => {
    const nombres = entidadesTypeOrm.map((entidad) => entidad.name);
    expect(nombres).toEqual(
      expect.arrayContaining([
        'PersonaTypeormEntidad',
        'TipoDocumentoIdentidadTypeormEntidad',
        'DocumentoIdentidadPersonaTypeormEntidad',
        'MedioContactoPersonaTypeormEntidad',
        'DireccionPersonaTypeormEntidad',
        'AlertaInstitucionalTypeormEntidad',
        'ComunicadoInstitucionalTypeormEntidad',
      ]),
    );
  });
});
