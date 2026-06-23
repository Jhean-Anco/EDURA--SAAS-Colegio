---
description: "Reglas para archivos Next.js del frontend EDURA"
globs: ["front/src/**/*.tsx", "front/src/**/*.ts", "front/next.config.ts"]
---

# Reglas Next.js — EDURA front

- App Router: páginas en `front/src/app/<ruta>/page.tsx`.
- Funcionalidades de dominio en `front/src/features/<nombre>/`.
- Llamadas al backend exclusivamente desde route handlers en `app/api/<ruta>/route.ts`.
- Estado de sesión con `iron-session`; nunca exponer el secreto al cliente.
- Componentes client-side marcar con `"use client"` solo cuando sea necesario.
- Formularios con React Hook Form + Zod; validar en cliente Y en servidor.
- Primitivos UI de Radix UI + Tailwind; no instalar librerías UI adicionales sin ADR.
- Nunca hacer fetch directo al backend NestJS desde componentes cliente.
- Errores de API: manejar con Sonner toast; no `alert()`.
- TanStack Query para datos remotos; no `useState` + `useEffect` para fetch.

Comandos disponibles:
```bash
npm --prefix front run lint
npm --prefix front run typecheck
npm --prefix front run test
npm --prefix front run test:coverage
```
