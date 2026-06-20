import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

function archivosTs(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    return statSync(full).isDirectory()
      ? archivosTs(full)
      : full.endsWith('.ts')
        ? [full]
        : [];
  });
}

describe('Arquitectura', () => {
  it('dominio no importa nest ni typeorm ni express', () => {
    const dominios = [
      join(process.cwd(), 'src/modulos/estructura-institucional/dominio'),
      join(process.cwd(), 'src/modulos/infraestructura-fisica/dominio'),
      join(process.cwd(), 'src/compartido/dominio'),
    ];
    for (const dominio of dominios) {
      for (const archivo of archivosTs(dominio)) {
        const contenido = readFileSync(archivo, 'utf8');
        expect(contenido).not.toMatch(
          /from 'typeorm'|from "@nestjs\/|from 'express'|from "express"/,
        );
      }
    }
  });

  it('no usa BaseEntity ni Prisma', () => {
    const codigo = archivosTs(join(process.cwd(), 'src'))
      .map((archivo) => readFileSync(archivo, 'utf8'))
      .join('\n');
    expect(codigo).not.toMatch(/\bBaseEntity\b/);
    expect(codigo).not.toMatch(/\bprisma\b/i);
  });
});
