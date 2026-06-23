---
description: "Reglas para scripts de la plataforma de agentes en scripts/ai/"
globs: ["scripts/ai/**/*.mjs", ".ai/**/*.yaml", "agent-assets/**/*.md", ".claude/skills/**/*.md"]
---

# Reglas Scripts de IA — EDURA

- Scripts en `scripts/ai/` solo usan Node.js built-ins; sin dependencias de producción.
- Toda lectura de archivos debe respetar las exclusiones de `.ai/context-policy.yaml`.
- Scripts deben fallar limpiamente con mensaje legible, no stack trace.
- Si una función requiere credenciales no disponibles: imprimir `no configurado` y salir con código 0.
- Logs de scripts: solo a `stderr`; resultado útil a `stdout`.
- Nunca ejecutar comandos destructivos dentro de scripts de plataforma.
- Métricas: registrar en `.ai/metrics/<tarea>.yaml` al finalizar.
- Skills: siempre sincronizar desde `agent-assets/skills/`; no editar `.claude/skills/` directamente.
- Al agregar un script: verificar con `node --check scripts/ai/<nombre>.mjs`.
