#!/usr/bin/env node
/**
 * Verificador de presupuesto de contexto para tareas EDURA.
 * Uso: node scripts/ai/budget.mjs --perfil <mecanico|normal|critico> --archivos N --lineas N
 */
const args = process.argv.slice(2);
function arg(nombre) {
  const idx = args.indexOf(nombre);
  return idx >= 0 ? args[idx + 1] : null;
}

const perfil = arg('--perfil') ?? 'normal';
const archivos = parseInt(arg('--archivos') ?? '0');
const lineas = parseInt(arg('--lineas') ?? '0');
const herramientas = parseInt(arg('--herramientas') ?? '0');

const PRESUPUESTOS = {
  mecanico:  { archivos_maximos: 8,  lineas_maximas: 800,  herramientas_maximas: 12 },
  normal:    { archivos_maximos: 20, lineas_maximas: 2500, herramientas_maximas: 30 },
  critico:   { archivos_maximos: 60, lineas_maximas: 8000, herramientas_maximas: 80 },
};

const presupuesto = PRESUPUESTOS[perfil];
if (!presupuesto) {
  console.error(`Perfil desconocido: ${perfil}. Usar: mecanico, normal, critico`);
  process.exit(1);
}

let excedido = false;
console.log(`Verificación de presupuesto — perfil: ${perfil}\n`);

function check(nombre, valor, maximo) {
  const pct = ((valor / maximo) * 100).toFixed(0);
  const estado = valor > maximo ? '✗ EXCEDIDO' : valor > maximo * 0.8 ? '⚠ CERCA' : '✓';
  console.log(`  ${nombre.padEnd(20)} ${String(valor).padStart(5)} / ${maximo} (${pct}%) ${estado}`);
  if (valor > maximo) excedido = true;
}

check('Archivos', archivos, presupuesto.archivos_maximos);
check('Líneas', lineas, presupuesto.lineas_maximas);
check('Herramientas', herramientas, presupuesto.herramientas_maximas);

if (excedido) {
  console.log('\n✗ Presupuesto excedido');
  console.log('  Registrar exceso en .ai/metrics/ con justificación');
  console.log('  Causas válidas: ver .ai/budgets.yaml > excepciones');
  process.exit(1);
} else {
  console.log('\n✓ Dentro del presupuesto');
}
