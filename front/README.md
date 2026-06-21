# EDURA Frontend

Interfaz web del sistema de gestión educativa EDURA.

## Stack

- **Framework**: Next.js 15 App Router
- **Lenguaje**: TypeScript (strict)
- **Estilos**: Tailwind CSS 4
- **Componentes**: shadcn/ui + Radix UI
- **Estado servidor**: TanStack Query v5
- **Formularios**: React Hook Form v7 + Zod v3
- **Sesión**: iron-session v8 (cookies HttpOnly cifradas)
- **Tests**: Vitest + Testing Library + MSW

## Arrancar en desarrollo

1. Copia `.env.example` a `.env.local` y configura los valores:
   ```
   BACKEND_URL=http://localhost:3000
   SESSION_SECRET=<mínimo 32 caracteres aleatorios>
   ```

2. Instala dependencias:
   ```bash
   npm install
   ```

3. Inicia el servidor de desarrollo (puerto 3001):
   ```bash
   npm run dev
   ```

El backend debe estar corriendo en `http://localhost:3000`.

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo en puerto 3001 |
| `npm run build` | Build de producción |
| `npm run lint` | ESLint con 0 warnings permitidos |
| `npm run typecheck` | TypeScript sin emitir |
| `npm run test` | Tests unitarios |
| `npm run test:coverage` | Tests con reporte de cobertura |

## Arquitectura

Ver [documentacion/arquitectura-frontend.md](documentacion/arquitectura-frontend.md).

## CORS (backend local)

Agregar en `back/.env`:
```
ORIGENES_CORS=http://localhost:3001,http://localhost:5173
```
