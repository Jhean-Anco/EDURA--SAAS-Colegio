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
    const dominio = join(process.cwd(), 'src');
    for (const archivo of archivosTs(dominio)) {
      if (!archivo.includes('dominio')) continue;
      const contenido = readFileSync(archivo, 'utf8');
      expect(contenido).not.toMatch(
        /from 'typeorm'|from "@nestjs\/|from 'express'|from "express"/,
      );
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
