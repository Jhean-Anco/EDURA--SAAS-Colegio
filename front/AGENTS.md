# AGENTS.md — front (Next.js)

Restricciones específicas del frontend. Ver también `../../AGENTS.md`.

## Patrón obligatorio (BFF)

```
cliente → front/src/app/api/<ruta>/route.ts → back NestJS
```

Nunca llamar directamente al backend desde componentes cliente.

## Estructura de feature

```
front/src/features/<nombre>/
├── components/   # Componentes del feature
├── hooks/        # Hooks con TanStack Query
└── types.ts      # Tipos específicos
```

## Reglas críticas

1. Sesión con `iron-session`: solo en route handlers (server-side).
2. Datos remotos: TanStack Query. No `useState` + `useEffect` para fetch.
3. UI primitivos: Radix UI. No instalar librerías UI adicionales sin ADR.
4. Formularios: React Hook Form + Zod.
5. Errores: Sonner toast. No `alert()`.
6. `"use client"`: solo cuando sea estrictamente necesario.
7. Validar en cliente Y en servidor (route handler).

## Comandos disponibles

```bash
npm --prefix front run lint
npm --prefix front run typecheck
npm --prefix front run test
npm --prefix front run test:coverage
```

## Estructura raíz

```
front/src/
├── app/           # App Router (páginas y route handlers BFF)
├── features/      # Funcionalidades por dominio
├── components/    # Componentes reutilizables
├── design-system/ # Tokens y primitivos UI
├── lib/           # Utilidades y cliente HTTP
└── types/         # Tipos globales
```
