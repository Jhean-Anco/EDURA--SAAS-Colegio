#!/usr/bin/env node
/**
 * Gestor de Skills EDURA.
 * Uso: node scripts/ai/skills-manager.mjs <comando> [args]
 * Comandos: list, discover, audit, install, disable, remove, prune
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const ROOT = join(dirname(__filename), '..', '..');
const comando = process.argv[2];

const CANON = join(ROOT, 'agent-assets/skills');
const CATALOGO_PATH = join(ROOT, '.ai/skills.catalog.yaml');

function leerSkills() {
  if (!existsSync(CANON)) return [];
  return readdirSync(CANON).filter(f => f.endsWith('.md')).map(f => {
    const contenido = readFileSync(join(CANON, f), 'utf8');
    const id = f.replace('.md', '');
    const descripcion = contenido.match(/descripcion:\s*"([^"]+)"/)?.[1] ?? '';
    const categoria = contenido.match(/categoria:\s*(\S+)/)?.[1] ?? '';
    const estado = contenido.match(/estado:\s*(\S+)/)?.[1] ?? 'instalada';
    const plataformas = contenido.match(/plataformas:\s*\[([^\]]+)\]/)?.[1]?.split(',').map(s => s.trim()) ?? [];
    return { id, descripcion, categoria, estado, plataformas };
  });
}

switch (comando) {
  case 'list': {
    const skills = leerSkills();
    console.log(`Skills EDURA (${skills.length})\n`);
    for (const s of skills) {
      console.log(`  ${s.id}`);
      console.log(`    Categoría: ${s.categoria} | Estado: ${s.estado}`);
      console.log(`    ${s.descripcion}`);
      console.log(`    Plataformas: ${s.plataformas.join(', ')}\n`);
    }
    break;
  }

  case 'discover': {
    console.log('Descubrimiento de Skills externas\n');
    console.log('Fuentes verificadas: ninguna configurada');
    console.log('Para agregar una Skill externa:');
    console.log('  1. Revisar su SKILL.md e inspeccionar scripts manualmente');
    console.log('  2. Verificar que cumpla la política en .ai/security-policy.yaml');
    console.log('  3. Ejecutar: pnpm ai:skills:audit -- <origen>');
    console.log('  4. Si pasa auditoría: pnpm ai:skills:install -- <skill>');
    break;
  }

  case 'audit': {
    const origen = process.argv[3];
    if (!origen) {
      console.error('Uso: pnpm ai:skills:audit -- <origen>');
      process.exit(1);
    }
    console.log(`Auditoría de Skill: ${origen}\n`);
    console.log('Lista de verificación:');
    const checks = [
      'Instalación dentro del repositorio',
      'Fuente identificable',
      'Licencia compatible (MIT/Apache/ISC)',
      'Versión o commit fijado',
      'SKILL.md inspeccionado',
      'Scripts inspeccionados manualmente',
      'Sin comandos destructivos',
      'Sin lectura de secretos',
      'Sin instalación global',
      'Sin acceso irrestricto a red',
      'Sin dependencia de producción',
      'Propósito directamente relacionado con la tarea',
    ];
    checks.forEach((c, i) => console.log(`  ${i + 1}. [ ] ${c}`));
    console.log('\nCompleta la lista manualmente antes de instalar.');
    break;
  }

  case 'install': {
    const skill = process.argv[3];
    if (!skill) {
      console.error('Uso: pnpm ai:skills:install -- <skill>');
      process.exit(1);
    }
    console.log(`Para instalar la Skill "${skill}":`);
    console.log('  1. Crear agent-assets/skills/<nombre>.md siguiendo el formato estándar');
    console.log('  2. Registrar en .ai/skills.catalog.yaml');
    console.log('  3. Ejecutar: pnpm ai:skills:sync');
    console.log('  4. Actualizar .ai/skills.lock.yaml');
    break;
  }

  case 'disable': {
    const skill = process.argv[3];
    if (!skill) { console.error('Uso: pnpm ai:skills:disable -- <skill>'); process.exit(1); }
    console.log(`Para deshabilitar "${skill}":`);
    console.log('  1. Cambiar estado en .ai/skills.catalog.yaml a "deshabilitada"');
    console.log('  2. Ejecutar: pnpm ai:skills:sync');
    break;
  }

  case 'remove': {
    const skill = process.argv[3];
    if (!skill) { console.error('Uso: pnpm ai:skills:remove -- <skill>'); process.exit(1); }
    console.log(`Para eliminar "${skill}", requiere confirmación manual:`);
    console.log('  1. Eliminar agent-assets/skills/<nombre>.md');
    console.log('  2. Eliminar de .ai/skills.catalog.yaml y .ai/skills.lock.yaml');
    console.log('  3. Ejecutar: pnpm ai:skills:sync');
    break;
  }

  case 'prune': {
    console.log('Limpieza de Skills obsoletas:\n');
    const skills = leerSkills();
    const obsoletas = skills.filter(s => s.estado === 'obsoleta' || s.estado === 'deshabilitada');
    if (obsoletas.length === 0) {
      console.log('No hay Skills obsoletas o deshabilitadas');
    } else {
      console.log(`Skills candidatas a eliminar: ${obsoletas.map(s => s.id).join(', ')}`);
      console.log('Usar pnpm ai:skills:remove -- <skill> para eliminar cada una');
    }
    break;
  }

  default:
    console.error(`Comando desconocido: ${comando}`);
    console.error('Comandos: list, discover, audit, install, disable, remove, prune');
    process.exit(1);
}
