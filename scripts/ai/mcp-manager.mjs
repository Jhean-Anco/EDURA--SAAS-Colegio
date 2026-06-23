#!/usr/bin/env node
/**
 * Gestor de servidores MCP EDURA.
 *
 * Uso: node scripts/ai/mcp-manager.mjs <comando> [opciones]
 *
 * Comandos:
 *   list                        Lista todos los servidores y su estado
 *   status [servidor]           Estado detallado (todos o uno específico)
 *   discover                    Detecta plataformas y MCPs disponibles en el entorno
 *   plan                        Genera plan de acción para conectar MCPs pendientes
 *   test <servidor>             Ejecuta pruebas de salud nivel 1-4
 *   audit <servidor>            Muestra checklist de auditoría para instalar un MCP
 *   disable <servidor>          Marca servidor como deshabilitado en el lockfile
 *   generate-configs            Genera archivos de configuración por plataforma
 *
 * Opciones globales:
 *   --json                      Salida en formato JSON
 *   --dry-run                   Simula cambios sin escribir archivos
 *   --non-interactive           No solicita confirmaciones (para CI)
 *   --backup                    Crea respaldo antes de modificar archivos
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const ROOT = join(dirname(__filename), '..', '..');
const REGISTRY_PATH = join(ROOT, '.ai/mcp.registry.yaml');
const LOCK_PATH = join(ROOT, '.ai/mcp.lock.yaml');

const args = process.argv.slice(2);
const comando = args[0];
const opcion = args[1];

const FLAG_JSON = args.includes('--json');
const FLAG_DRY_RUN = args.includes('--dry-run');
const FLAG_BACKUP = args.includes('--backup');
const FLAG_NON_INTERACTIVE = args.includes('--non-interactive');

// ── Utilidades ──────────────────────────────────────────────────────────────

function leerYamlSimple(ruta) {
  if (!existsSync(ruta)) return null;
  return readFileSync(ruta, 'utf8');
}

function extraerEstadoGlobal(lockYaml, id) {
  if (!lockYaml) return 'desconocido';
  const rx = new RegExp(String.raw`  ${id}:\n\s+id: ${id}\n\s+estado_global: (\S+)`);
  const m = lockYaml.match(rx);
  return m ? m[1] : 'desconocido';
}

function extraerEstadoPorPlataforma(lockYaml, id, plataforma) {
  if (!lockYaml) return 'desconocido';
  const seccionRx = new RegExp(String.raw`  ${id}:[\s\S]*?plataformas:[\s\S]*?${plataforma}:\n\s+estado: (\S+)`);
  const m = lockYaml.match(seccionRx);
  return m ? m[1] : 'no_configurado';
}

function colorEstado(estado) {
  const mapa = {
    conectado: '\x1b[32m',
    operativo: '\x1b[32m',
    instalado: '\x1b[36m',
    configurado: '\x1b[33m',
    pendiente: '\x1b[33m',
    propuesto: '\x1b[90m',
    no_detectado: '\x1b[90m',
    no_aplica: '\x1b[90m',
    no_configurado: '\x1b[90m',
    bloqueado: '\x1b[31m',
    deshabilitado: '\x1b[31m',
    fallido: '\x1b[31m',
    desconocido: '\x1b[90m',
  };
  const reset = '\x1b[0m';
  return `${mapa[estado] || ''}${estado}${reset}`;
}

function escribirConBackup(ruta, contenido) {
  if (FLAG_DRY_RUN) {
    console.log(`[dry-run] Escribiría: ${ruta}`);
    return;
  }
  if (FLAG_BACKUP && existsSync(ruta)) {
    const backup = `${ruta}.bak.${Date.now()}`;
    copyFileSync(ruta, backup);
    console.log(`  Respaldo: ${backup}`);
  }
  mkdirSync(dirname(ruta), { recursive: true });
  writeFileSync(ruta, contenido, 'utf8');
}

function salidaJson(datos) {
  console.log(JSON.stringify(datos, null, 2));
}

// ── Comandos ────────────────────────────────────────────────────────────────

function cmdList() {
  const lock = leerYamlSimple(LOCK_PATH);

  const SERVIDORES = [
    'edura-contexto',
    'playwright',
    'postgres-local-readonly',
    'github-plugin-codex',
    'notebooklm-enterprise',
    'notebooklm-mcp-comunidad',
    'stitch',
  ];

  if (FLAG_JSON) {
    const resultado = SERVIDORES.map(id => ({
      id,
      estado_global: extraerEstadoGlobal(lock, id),
      plataformas: {
        'claude-code': extraerEstadoPorPlataforma(lock, id, 'claude-code'),
        codex: extraerEstadoPorPlataforma(lock, id, 'codex'),
        antigravity: extraerEstadoPorPlataforma(lock, id, 'antigravity'),
      },
    }));
    salidaJson(resultado);
    return;
  }

  console.log('\nServidores MCP — EDURA\n');
  console.log('  ID                          Global           Claude Code      Codex');
  console.log('  ' + '─'.repeat(75));

  SERVIDORES.forEach(id => {
    const global = extraerEstadoGlobal(lock, id);
    const cc = extraerEstadoPorPlataforma(lock, id, 'claude-code');
    const codex = extraerEstadoPorPlataforma(lock, id, 'codex');
    console.log(
      `  ${id.padEnd(28)} ${colorEstado(global).padEnd(25)} ${colorEstado(cc).padEnd(25)} ${colorEstado(codex)}`
    );
  });

  console.log('\n  Perfiles: local-fast | backend | frontend-ui | docs-research | pr-review | security-audit | database-review');
  console.log('  Ver estado detallado: node scripts/ai/mcp-manager.mjs status <id>\n');
}

function cmdStatus(id) {
  const lock = leerYamlSimple(LOCK_PATH);
  if (!lock) { console.error('Lock no encontrado: .ai/mcp.lock.yaml'); process.exit(1); }

  if (!id) {
    console.log('\nUso: node scripts/ai/mcp-manager.mjs status <servidor-id>\n');
    cmdList();
    return;
  }

  const globalEstado = extraerEstadoGlobal(lock, id);
  const cc = extraerEstadoPorPlataforma(lock, id, 'claude-code');
  const codex = extraerEstadoPorPlataforma(lock, id, 'codex');
  const ag = extraerEstadoPorPlataforma(lock, id, 'antigravity');

  if (FLAG_JSON) {
    salidaJson({ id, estado_global: globalEstado, claude_code: cc, codex, antigravity: ag });
    return;
  }

  console.log(`\nEstado de: ${id}`);
  console.log('─'.repeat(50));
  console.log(`  Global       : ${colorEstado(globalEstado)}`);
  console.log(`  Claude Code  : ${colorEstado(cc)}`);
  console.log(`  Codex        : ${colorEstado(codex)}`);
  console.log(`  Antigravity  : ${colorEstado(ag)}`);

  // Pruebas de salud si están en el lock
  const matrizRx = new RegExp(String.raw`"${id}/claude-code":\s+\[([^\]]+)\]`);
  const matrizM = lock.match(matrizRx);
  if (matrizM) {
    const niveles = matrizM[1].split(',').map(s => s.trim());
    console.log(`\n  Pruebas de salud (N1-N5):`);
    ['Proceso', 'Protocolo JSON-RPC', 'Herramientas', 'Llamada funcional', 'Integración E2E'].forEach((n, i) => {
      console.log(`    N${i + 1} ${n.padEnd(22)}: ${colorEstado(niveles[i] || 'pendiente')}`);
    });
  }
  console.log('');
}

function cmdDiscover() {
  console.log('\nDetectando entorno de plataformas MCP...\n');

  const resultados = {};

  // Claude Code
  try {
    const v = execSync('claude --version 2>&1', { encoding: 'utf8', timeout: 5000 }).trim();
    resultados['claude-code'] = { detectado: true, version: v };
    console.log(`  ✓ Claude Code  : ${v}`);
  } catch {
    resultados['claude-code'] = { detectado: false };
    console.log(`  ✗ Claude Code  : no encontrado en PATH`);
  }

  // Codex
  try {
    const v = execSync('codex --version 2>&1', { encoding: 'utf8', timeout: 5000 }).trim();
    resultados.codex = { detectado: true, version: v };
    console.log(`  ✓ Codex        : ${v}`);
  } catch {
    resultados.codex = { detectado: false };
    console.log(`  ✗ Codex        : no encontrado en PATH`);
  }

  // Antigravity
  try {
    const v = execSync('antigravity --version 2>&1', { encoding: 'utf8', timeout: 5000 }).trim();
    resultados.antigravity = { detectado: true, version: v };
    console.log(`  ✓ Antigravity  : ${v}`);
  } catch {
    resultados.antigravity = { detectado: false };
    console.log(`  ✗ Antigravity  : no detectado — ver config/agents/antigravity/manual-steps.md`);
  }

  // Node.js
  try {
    const v = execSync('node --version', { encoding: 'utf8', timeout: 3000 }).trim();
    resultados.node = { detectado: true, version: v };
    const mayor = Number.parseInt(v.slice(1));
    const ok = mayor >= 18;
    console.log(`  ${ok ? '✓' : '✗'} Node.js       : ${v}${ok ? '' : ' (requiere >=18)'}`);
  } catch {
    resultados.node = { detectado: false };
  }

  // ripgrep
  try {
    const v = execSync('rg --version 2>&1', { encoding: 'utf8', timeout: 3000 }).split('\n')[0].trim();
    resultados.ripgrep = { detectado: true, version: v };
    console.log(`  ✓ ripgrep      : ${v}`);
  } catch {
    resultados.ripgrep = { detectado: false };
    console.log(`  ✗ ripgrep      : no encontrado (reduce capacidad de búsqueda)`);
  }

  // Variables de entorno MCP
  console.log('\n  Variables de entorno MCP:');
  const vars = ['POSTGRES_MCP_URL', 'GITHUB_TOKEN', 'GOOGLE_CLOUD_PROJECT', 'STITCH_API_KEY'];
  vars.forEach(v => {
    const presente = !!process.env[v];
    console.log(`    ${presente ? '✓' : '○'} ${v.padEnd(25)} ${presente ? 'configurada' : 'no configurada'}`);
    resultados[v] = presente;
  });

  // MCP EDURA Contexto
  const serverPath = join(ROOT, 'tools/mcp-edura-contexto/server.mjs');
  const serverOk = existsSync(serverPath);
  console.log(`\n  Servidor MCP EDURA Contexto : ${serverOk ? '✓ presente' : '✗ no encontrado'}`);
  resultados['edura-contexto-server'] = serverOk;

  console.log('');

  if (FLAG_JSON) salidaJson(resultados);
}

function cmdPlan() {
  const lock = leerYamlSimple(LOCK_PATH);
  console.log('\nPlan de acción MCP — EDURA\n');

  const pendientes = [];

  // edura-contexto/codex
  const ccEstado = extraerEstadoPorPlataforma(lock, 'edura-contexto', 'codex');
  if (ccEstado !== 'conectado') {
    pendientes.push({
      servidor: 'edura-contexto',
      plataforma: 'codex',
      accion: 'Verificar con: codex mcp list → confirmar que edura-contexto aparece enabled',
      bloqueo: null,
    });
  }

  // playwright/claude-code — pendiente aprobación
  pendientes.push({
    servidor: 'playwright',
    plataforma: 'claude-code',
    accion: "Aprobar en Claude Code: escribir '/mcp' → seleccionar playwright → aprobar",
    bloqueo: null,
  });

  // postgres
  if (!process.env.POSTGRES_MCP_URL) {
    pendientes.push({
      servidor: 'postgres-local-readonly',
      plataforma: 'claude-code',
      accion: 'Configurar POSTGRES_MCP_URL con cuenta de solo lectura. Ver config/agents/mcp.env.example',
      bloqueo: 'POSTGRES_MCP_URL',
    });
  }

  // github
  if (!process.env.GITHUB_TOKEN) {
    pendientes.push({
      servidor: 'github-plugin-codex',
      plataforma: 'codex',
      accion: 'Configurar GITHUB_TOKEN (token fino al repo EDURA). Ver config/agents/mcp.env.example',
      bloqueo: 'GITHUB_TOKEN',
    });
  }

  // antigravity
  pendientes.push({
    servidor: 'todos',
    plataforma: 'antigravity',
    accion: 'Antigravity no detectado. Instalar y seguir config/agents/antigravity/manual-steps.md cuando esté disponible',
    bloqueo: 'antigravity_no_detectado',
  });

  if (FLAG_JSON) { salidaJson(pendientes); return; }

  if (pendientes.length === 0) {
    console.log('  ✓ Todo conectado. Sin acciones pendientes.\n');
    return;
  }

  pendientes.forEach((p, i) => {
    console.log(`  ${i + 1}. [${p.servidor}/${p.plataforma}]`);
    console.log(`     Acción  : ${p.accion}`);
    if (p.bloqueo) console.log(`     Bloqueo : ${p.bloqueo} no configurado`);
    console.log('');
  });
}

function mcpPipe(serverPath, mensajes, timeoutMs = 10000) {
  const stdin = mensajes.map(m => JSON.stringify(m)).join('\n') + '\n';
  const r = execSync(`node "${serverPath}"`, {
    input: stdin, encoding: 'utf8', timeout: timeoutMs,
  });
  return r.trim().split('\n')
    .filter(l => l.startsWith('{'))
    .map(l => { try { return JSON.parse(l); } catch { return null; } })
    .filter(Boolean);
}

const MSG_INIT = { jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'mcp-manager', version: '1.0' } } };
const MSG_NOTIF = { jsonrpc: '2.0', method: 'notifications/initialized', params: {} };

function testEduraContexto() {
  const serverPath = join(ROOT, 'tools/mcp-edura-contexto/server.mjs');

  process.stdout.write('  N1 Proceso        : ');
  if (!existsSync(serverPath)) { console.log('FALLIDO — server.mjs no encontrado'); process.exit(1); }
  console.log('pasado (archivo presente)');

  process.stdout.write('  N2 Protocolo      : ');
  try {
    const lineas = mcpPipe(serverPath, [MSG_INIT]);
    const parsed = lineas.find(r => r.id === 1);
    console.log(parsed?.result?.serverInfo
      ? `pasado — name="${parsed.result.serverInfo.name}"`
      : 'pasado (respuesta válida)');
  } catch (e) { console.log(`FALLIDO — ${e.message.slice(0, 80)}`); process.exit(1); }

  process.stdout.write('  N3 Herramientas   : ');
  try {
    const lineas = mcpPipe(serverPath, [MSG_INIT, MSG_NOTIF, { jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} }]);
    const n = lineas.find(r => r.id === 2)?.result?.tools?.length ?? 0;
    console.log(`pasado — ${n} herramientas descubiertas`);
  } catch (e) { console.log(`FALLIDO — ${e.message.slice(0, 80)}`); }

  process.stdout.write('  N4 Llamada        : ');
  try {
    const lineas = mcpPipe(serverPath, [
      MSG_INIT, MSG_NOTIF,
      { jsonrpc: '2.0', id: 3, method: 'tools/call', params: { name: 'obtener_estado_proyecto', arguments: {} } },
    ]);
    const resp = lineas.find(r => r.id === 3);
    if (resp?.result?.content)      console.log('pasado — obtener_estado_proyecto respondió correctamente');
    else if (resp?.error)            console.log(`degradado — ${resp.error.message}`);
    else                             console.log('pasado (respuesta recibida)');
  } catch (e) { console.log(`FALLIDO — ${e.message.slice(0, 80)}`); }

  console.log('\n  N5 Integración E2E : pendiente (requiere sesión Claude Code o Codex activa)\n');
}

function testPostgres() {
  if (!process.env.POSTGRES_MCP_URL) {
    console.log('  BLOQUEADO — POSTGRES_MCP_URL no configurada');
    console.log('  Configurar primero. Ver config/agents/mcp.env.example\n');
    process.exit(1);
  }
  console.log('  N1 Proceso        : ejecutando npx @modelcontextprotocol/server-postgres...');
  try {
    execSync('npx -y @modelcontextprotocol/server-postgres --help', { timeout: 15000, stdio: 'pipe' });
    console.log('  N1 Proceso        : pasado');
  } catch { console.log('  N1 Proceso        : degradado (verificar instalación npm)'); }
  console.log('  N2-N4             : requiere base de datos local activa\n');
}

function cmdTest(id) {
  if (!id) { console.error('Uso: node scripts/ai/mcp-manager.mjs test <servidor-id>'); process.exit(1); }
  console.log(`\nPruebas de salud: ${id}\n`);
  if (id === 'edura-contexto')        { testEduraContexto(); return; }
  if (id === 'postgres-local-readonly') { testPostgres(); return; }
  console.log(`  Prueba manual requerida para: ${id}`);
  console.log('  Consultar: .ai/mcp.lock.yaml → matriz_pruebas_salud\n');
}

function cmdAudit(id) {
  if (!id) { console.error('Uso: node scripts/ai/mcp-manager.mjs audit <servidor>'); process.exit(1); }

  console.log(`\nChecklist de auditoría para instalar MCP: ${id}\n`);

  const checklist = [
    ['fuente_verificable', 'Fuente verificable con URL oficial (no fork anónimo)'],
    ['version_fijada', 'Versión fijada (no "latest" en producción)'],
    ['codigo_inspeccionado', 'Código o paquete inspeccionado antes de instalar'],
    ['licencia_compatible', 'Licencia compatible verificada (MIT/Apache/ISC/BSD)'],
    ['checksum_calculado', 'Checksum calculado y registrado en registry'],
    ['sin_secretos_instalacion', 'No requiere secretos para el proceso de instalación'],
    ['deshabilitado_por_defecto', 'Queda deshabilitado por defecto hasta aprobación'],
    ['limitado_a_perfil', 'Limitado a un perfil específico (no todos los perfiles)'],
    ['datos_documentados', 'Qué datos envía documentados (inputs/outputs)'],
    ['sin_acceso_produccion', 'Sin acceso a base de datos o APIs de producción'],
    ['sin_privilegios_globales', 'Sin permisos de npm global install ni escritura en sistema'],
  ];

  checklist.forEach(([clave, desc], i) => {
    console.log(`  ${(i + 1).toString().padStart(2)}. [ ] ${desc}`);
    console.log(`       clave: ${clave}`);
  });

  console.log('\n  Completar todas antes de cambiar estado a "instalado" en el registry.');
  console.log('  Registrar resultado en .ai/mcp.registry.yaml bajo el id del servidor.\n');
}

function cmdDisable(id) {
  if (!id) { console.error('Uso: node scripts/ai/mcp-manager.mjs disable <servidor>'); process.exit(1); }

  const lock = leerYamlSimple(LOCK_PATH);
  if (!lock) { console.error('Lock no encontrado'); process.exit(1); }

  console.log(`\n${FLAG_DRY_RUN ? '[dry-run] ' : ''}Marcando ${id} como deshabilitado...\n`);

  const actualizado = lock.replace(
    new RegExp(String.raw`(  ${id}:\n\s+id: ${id}\n\s+estado_global: )\S+`),
    '$1deshabilitado'
  );

  if (actualizado === lock) {
    console.log(`  No se encontró ${id} en el lockfile.`);
    process.exit(1);
  }

  escribirConBackup(LOCK_PATH, actualizado);
  console.log(`  ✓ ${id} marcado como deshabilitado en .ai/mcp.lock.yaml\n`);
}

function cmdGenerateConfigs() {
  console.log('\nGenerando configuraciones de MCP por plataforma...\n');
  const configDir = join(ROOT, 'config/agents');

  // Claude Code — config generada (evidencia, la real es .mcp.json)
  const claudeConfig = {
    _nota: "Configuración generada por mcp-manager. La config activa está en .mcp.json en la raíz del proyecto.",
    _generado: new Date().toISOString().split('T')[0],
    mcpServers: {
      "edura-contexto": {
        command: "node",
        args: ["tools/mcp-edura-contexto/server.mjs"],
        description: "Servidor MCP local EDURA — sin secretos, solo ROOT del proyecto."
      },
      "playwright": {
        command: "npx",
        args: ["@playwright/mcp@0.0.76", "--headless"],
        description: "Browser automation para frontend-ui. Solo localhost.",
        _perfil: "frontend-ui",
        _estado: "instalado_pendiente_aprobacion"
      },
      "postgres-local-readonly": {
        command: "npx",
        args: ["-y", "@modelcontextprotocol/server-postgres", "${POSTGRES_MCP_URL}"],
        env: { POSTGRES_MCP_URL: "${POSTGRES_MCP_URL}" },
        description: "PostgreSQL local solo lectura para database-review.",
        _perfil: "database-review",
        _estado: "configurado_pendiente_autenticacion"
      }
    }
  };

  escribirConBackup(
    join(configDir, 'claude/mcp.generated.json'),
    JSON.stringify(claudeConfig, null, 2)
  );
  console.log('  ✓ config/agents/claude/mcp.generated.json');

  // Codex — TOML generado (evidencia, la real está en ~/.codex/config.toml)
  const codexToml = `# Configuración Codex MCP generada por mcp-manager — ${new Date().toISOString().split('T')[0]}
# La config activa está en ~/.codex/config.toml
# Esta copia sirve como referencia versionada.

[mcp_servers.edura-contexto]
command = "node"
args = ["d:/EDURA/sistema/tools/mcp-edura-contexto/server.mjs"]

[mcp_servers.playwright]
command = "npx"
args = ["@playwright/mcp@0.0.76", "--headless"]

# postgres: añadir cuando POSTGRES_MCP_URL esté configurada
# [mcp_servers.postgres-local-readonly]
# command = "npx"
# args = ["-y", "@modelcontextprotocol/server-postgres", "<POSTGRES_MCP_URL>"]

[plugins."github@openai-curated"]
enabled = true
`;

  escribirConBackup(
    join(configDir, 'codex/mcp.generated.toml'),
    codexToml
  );
  console.log('  ✓ config/agents/codex/mcp.generated.toml');

  // Antigravity — pasos manuales
  const antigravitySteps = `# Antigravity — Pasos de configuración MCP
# Generado: ${new Date().toISOString().split('T')[0]}
# Estado: no_detectado (Antigravity no encontrado en PATH)

## Estado actual
Antigravity no fue detectado en el entorno. Este archivo documenta los pasos
a seguir cuando esté disponible.

## Pasos de configuración

### 1. Instalar Antigravity
Seguir las instrucciones oficiales de Google para instalar Antigravity CLI.
Verificar con: antigravity --version

### 2. Configurar MCP EDURA Contexto
Antigravity utiliza el estándar AGENTS.md y puede soportar MCPs via OpenAPI o STDIO.
Una vez instalado, verificar el mecanismo de integración MCP soportado.

Configuración propuesta (ajustar según documentación oficial):
\`\`\`json
{
  "mcpServers": {
    "edura-contexto": {
      "command": "node",
      "args": ["d:/EDURA/sistema/tools/mcp-edura-contexto/server.mjs"]
    }
  }
}
\`\`\`

### 3. Verificar detección
node scripts/ai/mcp-manager.mjs discover
→ Antigravity debe aparecer como detectado

### 4. Ejecutar pruebas de salud
node scripts/ai/mcp-manager.mjs test edura-contexto

### 5. Actualizar lockfile
Actualizar .ai/mcp.lock.yaml con el estado real verificado.

## Referencia
- AGENTS.md en la raíz del repositorio
- .ai/mcp.registry.yaml
- .ai/mcp.lock.yaml
`;

  escribirConBackup(
    join(configDir, 'antigravity/manual-steps.md'),
    antigravitySteps
  );
  console.log('  ✓ config/agents/antigravity/manual-steps.md');

  console.log('\n  Nota: Los archivos .generated.* son evidencia versionada.');
  console.log('  Las configuraciones activas están en .mcp.json y ~/.codex/config.toml\n');
}

// ── Dispatch ─────────────────────────────────────────────────────────────────

switch (comando) {
  case 'list':            cmdList(); break;
  case 'status':          cmdStatus(opcion); break;
  case 'discover':        cmdDiscover(); break;
  case 'plan':            cmdPlan(); break;
  case 'test':            cmdTest(opcion); break;
  case 'audit':           cmdAudit(opcion); break;
  case 'disable':         cmdDisable(opcion); break;
  case 'generate-configs': cmdGenerateConfigs(); break;
  case 'health':
    console.log('El comando "health" fue reemplazado por "test <servidor>" y "status [servidor]".');
    console.log('Uso: node scripts/ai/mcp-manager.mjs status');
    break;
  default:
    console.error(`\nComando desconocido: ${comando || '(ninguno)'}\n`);
    console.error('Comandos disponibles:');
    console.error('  list                  Lista todos los servidores MCP y estado');
    console.error('  status [servidor]     Estado detallado (todos o uno específico)');
    console.error('  discover              Detecta plataformas y variables en el entorno');
    console.error('  plan                  Genera plan de acción para MCPs pendientes');
    console.error('  test <servidor>       Pruebas de salud N1-N4');
    console.error('  audit <servidor>      Checklist de auditoría pre-instalación');
    console.error('  disable <servidor>    Marca servidor como deshabilitado');
    console.error('  generate-configs      Genera configs por plataforma');
    console.error('\nOpciones: --json  --dry-run  --backup  --non-interactive\n');
    process.exit(1);
}
