#!/usr/bin/env node
/**
 * Doctor del sistema de agentes EDURA.
 * Detecta problemas de configuración y política de seguridad.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const ROOT = join(dirname(__filename), '..', '..');
const problemas = [];
const advertencias = [];

function problema(msg) { problemas.push(msg); }
function advertencia(msg) { advertencias.push(msg); }

// 1. Verificar que no haya secretos en archivos rastreados
try {
  const gitFiles = execSync('git ls-files', { cwd: ROOT, encoding: 'utf8' })
    .split('\n')
    .filter(f => f.trim());
  const patronesSecretos = [/\.env$/, /\.pem$/, /\.key$/, /\.p12$/, /secret/i, /credential/i];
  for (const f of gitFiles) {
    if (patronesSecretos.some(p => p.test(f))) {
      problema(`Posible secreto rastreado en Git: ${f}`);
    }
  }
} catch {
  advertencia('No se pudo verificar archivos Git rastreados');
}

// 2. Verificar sincronización de Skills
const skillsDirs = {
  canon: join(ROOT, 'agent-assets/skills'),
  claude: join(ROOT, '.claude/skills'),
  agents: join(ROOT, '.agents/skills'),
};
const skillsCanon = existsSync(skillsDirs.canon) ?
  readdirSync(skillsDirs.canon).filter(f => f.endsWith('.md')).sort() : [];
const skillsClaude = existsSync(skillsDirs.claude) ?
  readdirSync(skillsDirs.claude).filter(f => f.endsWith('.md')).sort() : [];
const skillsAgents = existsSync(skillsDirs.agents) ?
  readdirSync(skillsDirs.agents).filter(f => f.endsWith('.md')).sort() : [];

if (JSON.stringify(skillsCanon) !== JSON.stringify(skillsClaude)) {
  advertencia(`Skills desincronizadas entre agent-assets/ y .claude/skills/ — ejecutar: pnpm ai:skills:sync`);
}
if (JSON.stringify(skillsCanon) !== JSON.stringify(skillsAgents)) {
  advertencia(`Skills desincronizadas entre agent-assets/ y .agents/skills/ — ejecutar: pnpm ai:skills:sync`);
}

// 3. Verificar que .env no esté en el repositorio
if (existsSync(join(ROOT, '.env'))) {
  advertencia('.env encontrado en la raíz — verificar que esté en .gitignore');
}
if (existsSync(join(ROOT, 'back/.env'))) {
  advertencia('back/.env encontrado — verificar que esté en .gitignore');
}

// 4. Verificar scripts sin comandos peligrosos
const scriptsDir = join(ROOT, 'scripts/ai');
if (existsSync(scriptsDir)) {
  const scripts = readdirSync(scriptsDir).filter(f => f.endsWith('.mjs'));
  const patronesPeligrosos = ['rm -rf', 'DROP TABLE', 'DELETE FROM', '--force', 'git push'];
  for (const script of scripts) {
    const contenido = readFileSync(join(scriptsDir, script), 'utf8');
    for (const patron of patronesPeligrosos) {
      if (contenido.includes(patron)) {
        advertencia(`Script ${script} contiene patrón potencialmente peligroso: "${patron}"`);
      }
    }
  }
}

// 5. Verificar lockfiles actualizados
const catalogoExists = existsSync(join(ROOT, '.ai/skills.catalog.yaml'));
const lockExists = existsSync(join(ROOT, '.ai/skills.lock.yaml'));
if (catalogoExists && !lockExists) {
  problema('skills.catalog.yaml existe pero skills.lock.yaml no — ejecutar: pnpm ai:skills:sync');
}

// Reporte
console.log('EDURA — Doctor del sistema de agentes\n');
console.log(`Skills canónicas: ${skillsCanon.length}`);
console.log(`Skills Claude:    ${skillsClaude.length}`);
console.log(`Skills Agents:    ${skillsAgents.length}`);

if (problemas.length === 0 && advertencias.length === 0) {
  console.log('\n✓ Sistema de agentes en buen estado');
  process.exit(0);
}

if (advertencias.length > 0) {
  console.warn('\n⚠ Advertencias:');
  advertencias.forEach((a, i) => console.warn(`  ${i + 1}. ${a}`));
}

if (problemas.length > 0) {
  console.error('\n✗ Problemas:');
  problemas.forEach((p, i) => console.error(`  ${i + 1}. ${p}`));
  process.exit(1);
}
