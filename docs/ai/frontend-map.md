# Mapa de Frontend EDURA

Stack: Next.js 15, React 19, Tailwind CSS, Radix UI, TanStack Query, React Hook Form, Vitest.
Índice de componentes: `docs/ai/generated/components.json`

## Estructura

```
front/src/
├── app/                   # App Router (páginas y route handlers BFF)
│   └── api/               # Route handlers → proxy al backend NestJS
├── features/              # Funcionalidades por dominio
│   └── <nombre>/          # Componentes, hooks, tipos del feature
├── components/            # Componentes reutilizables sin dominio
├── design-system/         # Tokens, variantes, primitivos UI
├── lib/                   # Utilidades, cliente HTTP, helpers
└── types/                 # Tipos globales TypeScript
```

## Patrón BFF

1. Página o componente llama a `TanStack Query` con endpoint `/api/<ruta>`.
2. Route handler en `app/api/<ruta>/route.ts` reenvía al backend con sesión `iron-session`.
3. Backend responde; route handler filtra y devuelve al cliente.

## Estado de sesión

Librería: `iron-session` (v8).
Sesión cifrada en cookie HTTPOnly. No exponer secreto de sesión al cliente.

## UI

- Primitivos: Radix UI
- Estilos: Tailwind CSS + `class-variance-authority`
- Notificaciones: Sonner
- Formularios: React Hook Form + Zod (ver `@hookform/resolvers`)

## Tests

```bash
npm --prefix front run test          # Vitest una vez
npm --prefix front run test:watch    # Modo watch
npm --prefix front run typecheck     # TypeScript
npm --prefix front run lint          # ESLint
```
