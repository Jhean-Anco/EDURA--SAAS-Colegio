#!/usr/bin/env node
/**
 * Generador de índice estructural del repositorio EDURA.
 * Genera metadatos de símbolos, módulos, entidades y rutas sin leer archivos completos.
 */
import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync, statSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const __filename = fileURLToPath(import.meta.url);
const ROOT = join(dirname(__filename), '..', '..');
const OUT_DIR = join(ROOT, 'docs/ai/generated');
mkdirSync(OUT_DIR, { recursive: true });

function hash(contenido) {
  return createHash('md5').update(contenido).digest('hex').slice(0, 8);
}

function buscarPatron(patron, glob) {
  try {
    return execSync(
      `rg "${patron}" --glob="${glob}" -l --glob=!**/node_modules/** --glob=!**/dist/**`,
      { cwd: ROOT, encoding: 'utf8', stdio: 'pipe' }
    ).trim().split('\n').filter(Boolean);
  } catch { return []; }
}

function extraerPrimera(contenido, patron) {
  return contenido.match(patron)?.[1]?.trim() ?? null;
}

console.log('EDURA — Generando índice estructural\n');

// 1. Módulos NestJS
const modulosDir = join(ROOT, 'back/src/modulos');
const nestModulos = [];
if (existsSync(modulosDir)) {
  for (const nombre of readdirSync(modulosDir)) {
    const modPath = join(modulosDir, nombre);
    if (!statSync(modPath).isDirectory()) continue;
    const moduleFile = join(modPath, `${nombre}.module.ts`);
    const info = {
      nombre,
      ruta: `back/src/modulos/${nombre}`,
      moduleFile: existsSync(moduleFile) ? `back/src/modulos/${nombre}/${nombre}.module.ts` : null,
      subdirectorios: existsSync(modPath) ? readdirSync(modPath).filter(d => {
        try { return statSync(join(modPath, d)).isDirectory(); } catch { return false; }
      }) : [],
    };
    nestModulos.push(info);
  }
}
writeFileSync(join(OUT_DIR, 'nest-modules.json'), JSON.stringify(nestModulos, null, 2));
console.log(`✓ nest-modules.json — ${nestModulos.length} módulos`);

// 2. Controladores
const controladores = buscarPatron('@Controller', 'back/src/**/*.ts');
const controllersData = controladores.map(f => {
  const contenido = readFileSync(join(ROOT, f), 'utf8');
  return {
    archivo: f,
    prefijo: extraerPrimera(contenido, /@Controller\(['"]([^'"]*)['"]\)/),
    clase: extraerPrimera(contenido, /export class (\w+)/),
  };
});
writeFileSync(join(OUT_DIR, 'controllers.json'), JSON.stringify(controllersData, null, 2));
console.log(`✓ controllers.json — ${controllersData.length} controladores`);

// 3. Entidades TypeORM
const entidades = buscarPatron('@Entity', 'back/src/**/dominio/entidades/**/*.ts');
const entidadesData = entidades.map(f => {
  const contenido = readFileSync(join(ROOT, f), 'utf8');
  return {
    archivo: f,
    tabla: extraerPrimera(contenido, /@Entity\(['"]([^'"]*)['"]\)/),
    clase: extraerPrimera(contenido, /export class (\w+)/),
    tieneInstitucionId: contenido.includes('institucion_id'),
    tieneAuditoria: contenido.includes('@CreateDateColumn') && contenido.includes('@UpdateDateColumn'),
  };
});
writeFileSync(join(OUT_DIR, 'entities.json'), JSON.stringify(entidadesData, null, 2));
console.log(`✓ entities.json — ${entidadesData.length} entidades`);

// 4. Componentes React
const componentesFiles = buscarPatron('export (default )?function|export const', 'front/src/**/*.tsx');
const componentesData = componentesFiles.slice(0, 100).map(f => ({
  archivo: f,
  es_page: f.includes('/page.tsx'),
  es_layout: f.includes('/layout.tsx'),
  es_api: f.includes('/api/'),
}));
writeFileSync(join(OUT_DIR, 'components.json'), JSON.stringify(componentesData, null, 2));
console.log(`✓ components.json — ${componentesData.length} componentes`);

// 5. Migraciones
const migracionesDir = join(ROOT, 'back/src/base-datos/typeorm/migraciones');
const migraciones = existsSync(migracionesDir) ?
  readdirSync(migracionesDir).filter(f => f.endsWith('.ts')).map(f => ({
    archivo: `back/src/base-datos/typeorm/migraciones/${f}`,
    nombre: f.replace('.ts', ''),
  })) : [];
writeFileSync(join(OUT_DIR, 'migrations.json'), JSON.stringify(migraciones, null, 2));
console.log(`✓ migrations.json — ${migraciones.length} migraciones`);

// 6. Resumen de símbolos (extracto)
const simbolos = [
  ...controllersData.map(c => ({ tipo: 'Controller', clase: c.clase, archivo: c.archivo })),
  ...entidadesData.map(e => ({ tipo: 'Entity', clase: e.clase, archivo: e.archivo })),
];
writeFileSync(join(OUT_DIR, 'symbols.json'), JSON.stringify(simbolos, null, 2));
console.log(`✓ symbols.json — ${simbolos.length} símbolos`);

console.log(`\n✓ Índice generado en docs/ai/generated/ (${new Date().toISOString().slice(0, 10)})`);
