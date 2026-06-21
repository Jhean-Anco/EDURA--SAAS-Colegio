# Arquitectura Frontend EDURA — FE-001

## Patrón BFF (Backend For Frontend)

El navegador **nunca** habla directamente con el backend NestJS. Todo pasa por Route Handlers de Next.js:

```
Browser ──fetch──► Next.js Route Handler ──fetch──► NestJS Backend
                   (lee/escribe iron-session)
```

Los tokens de acceso y refresh se almacenan únicamente en cookies HttpOnly cifradas con iron-session. El código JavaScript del cliente nunca puede leerlos.

## Estructura de directorios

```
src/
├── app/                        # App Router de Next.js
│   ├── (public)/               # Rutas sin autenticación
│   │   └── iniciar-sesion/
│   ├── (auth)/                 # Rutas post-login, pre-contexto
│   │   └── seleccionar-contexto/
│   ├── (platform)/             # Rutas autenticadas con shell
│   │   ├── layout.tsx          # Guard: requiere accessToken + contexto
│   │   └── panel/
│   ├── api/                    # BFF Route Handlers
│   │   ├── autenticacion/
│   │   └── panel/
│   ├── layout.tsx              # Root layout
│   └── globals.css
├── components/
│   ├── ui/                     # Primitivos (Button, Input, Card...)
│   ├── feedback/               # ErrorDisplay, SkeletonPanel, EmptyState
│   ├── layout/                 # Shell, Aside, TopBar, Breadcrumb
│   ├── brand/                  # Logo
│   └── providers/              # QueryProvider
├── features/
│   ├── autenticacion/          # Hooks, componentes, esquemas de auth
│   └── panel/                  # Hooks y componentes del panel
├── lib/
│   ├── auth/sesion.ts          # iron-session config
│   ├── bff/proxy.ts            # Helper fetch hacia backend + renovarSesion
│   ├── errores/                # Mapeo de códigos de error a mensajes español
│   ├── navegacion/             # Registro de navegación + resolver
│   └── query/                  # QueryClient, query key factory
├── types/
│   ├── api.ts                  # BackendError, esBackendError
│   ├── auth.ts                 # ContextoDescriptor, EduraSession, SesionCliente
│   └── navegacion.ts           # NavItem, NavGroup
└── tests/                      # Setup, mocks MSW, test-utils
```

## Flujo de autenticación

```
1. POST /api/autenticacion/iniciar-sesion
   → BFF llama POST /api/v1/autenticacion/iniciar-sesion
   → Guarda accessToken (PRECONTEXTO) + refreshToken en edura_session
   → Genera csrfToken, lo guarda en sesión y en cookie edura_csrf (no HttpOnly)
   → Browser redirige a /seleccionar-contexto

2. GET /api/autenticacion/contextos
   → BFF lee edura_session, llama GET /api/v1/autenticacion/contextos con Bearer
   → Browser muestra lista de contextos

3. POST /api/autenticacion/seleccionar-contexto
   → Browser envía X-CSRF-Token header
   → BFF valida CSRF, llama POST /api/v1/autenticacion/seleccionar-contexto
   → Guarda accessToken (ACCESO) + contexto en edura_session
   → Browser redirige a /panel

4. Refresh (automático, invisible al browser):
   → BFF detecta 401 del backend
   → Llama renovar, obtiene nuevo accessToken PRECONTEXTO
   → Si hay contexto guardado: re-selecciona automáticamente
   → Reintenta la solicitud original
```

## CSRF

Patrón double-submit cookie:
- `edura_session` (HttpOnly): contiene el csrfToken como campo cifrado
- `edura_csrf` (NO HttpOnly): el cliente lo lee para incluirlo en `X-CSRF-Token`
- Los Route Handlers comparan `req.headers.get('x-csrf-token')` con `sesion.csrfToken`
- Solo se aplica en mutaciones post-login (no en login inicial)

## Cookies de sesión

```typescript
// edura_session — iron-session cifrado (AES-256)
{
  accessToken: string;      // PRECONTEXTO o ACCESO según fase
  refreshToken: string;     // Rotation en cada refresh
  contexto?: ContextoDescriptor;
  nombreCompleto?: string;
  email?: string;
  csrfToken: string;
}
```

El payload nunca se expone al JavaScript del browser.

## Registro de navegación

`src/lib/navegacion/registro.ts` exporta `REGISTRO_NAVEGACION: NavItem[]`. Cada ítem declara:
- `permisos`: array de permisos requeridos (AND)
- `ambitos`: ámbitos donde aplica ('INSTITUCION' | 'SEDE')

`resolverNavegacion(contexto)` filtra por ambito y verifica que el contexto tenga todos los permisos. FE-002+ agrega nuevas entradas al registro sin modificar el shell.

## Query keys

Las claves incluyen el contexto completo `{institucionId, ambito, sedeId}` para evitar cache cross-context. Al cambiar contexto: `queryClient.clear()`.

## Errores

`ErrorApi` encapsula código backend + correlacionId + mensaje en español. `ErrorDisplay` muestra el mensaje al usuario y ofrece un detalle colapsable con el correlacionId para soporte técnico.
