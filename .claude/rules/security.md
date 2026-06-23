---
description: "Reglas de seguridad para todos los archivos del repositorio"
globs: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.mjs"]
---

# Reglas de Seguridad — EDURA

- Nunca hardcodear secretos, tokens, passwords o claves en código fuente.
- Variables de entorno: solo leer desde `process.env`; nunca loggear su valor.
- Nunca leer archivos `.env`, `*.pem`, `*.key` dentro de scripts de agentes.
- SQL: solo TypeORM query builder o repositorios; nunca concatenar strings en queries.
- Validar toda entrada de usuario con `class-validator` (backend) y Zod (frontend).
- CSRF: proteger endpoints de mutación (POST, PUT, PATCH, DELETE) en el BFF.
- Autorización: verificar `institucion_id` en toda consulta que devuelva datos institucionales.
- Headers de seguridad: configurados en NestJS y Next.js (ver commits de hardening).
- Refresh tokens: rotación en cada uso; invalidar en logout.
- Logs: nunca incluir datos personales de estudiantes, DNI, emails reales.
- Al detectar un secreto en el diff: detener inmediatamente y alertar al usuario.
