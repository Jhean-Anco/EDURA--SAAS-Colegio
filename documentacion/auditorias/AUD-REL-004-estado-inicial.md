# AUD-REL-004 — Diagnóstico de Estado Inicial

**Fecha:** 2026-06-20  
**Commit base:** `12cc5b76e9b2277262f649738e34a48c776d0376`  
**Rama:** `main`  
**Auditor:** Diagnóstico automatizado pre-release REL-004.2/REL-004.3/REL-004.4 + MOD-005.1

---

## 1. Versión del entorno

| Componente | Versión |
|---|---|
| Node.js | v24.16.0 |
| npm | 11.13.0 |
| NestJS | 11.x |
| TypeORM | 0.3.x |
| PostgreSQL (objetivo) | 16 |
| CI workflow | usa Node 20 — **desalineado con local** |

---

## 2. Estado de lint, build y pruebas

| Verificación | Resultado |
|---|---|
| `npm run lint` | PASA — 0 errores, 0 advertencias |
| `npm run build` | PASA — `dist/` generado limpio |
| `npm test` | PASA — 47 tests, 8 suites, 0 fallos |
| `npm run test:e2e` | No ejecutado (requiere BD activa) |

---

## 3. Seguridad — brecha crítica: APP_GUARD no registrado

### Hallazgo principal

`app.module.ts` **no tiene array `providers`** y no registra `APP_GUARD`. El módulo `IdentidadAccesoModule` exporta `GuardiaJwt` como proveedor, pero sin un `APP_GUARD` global, este guardia no protege ningún controlador automáticamente.

### Estado real por controlador

| Controlador | Ruta base | ¿Protegido? | Decoradores actuales |
|---|---|---|---|
| `AutenticacionControlador` | `/api/v1/autenticacion` | Parcial | `@UseGuards(GuardiaJwt)` en algunos endpoints |
| `PersonasControlador` | `/api/v1/personas` | Sí | `@UseGuards(GuardiaJwt, GuardiaPermisos)` + `@Permisos()` |
| `IntegracionesControlador` | `/api/v1/integraciones` | Sí | `@UseGuards(GuardiaJwt, GuardiaPermisos)` + `@Permisos()` |
| `InstitucionesControlador` | `/instituciones` | **NO** | Sin decoradores de auth |
| `SedesControlador` | `/instituciones/:id/sedes` | **NO** | Sin decoradores de auth |
| `UbigeosControlador` | `/ubigeos` | **NO** | Sin decoradores de auth |
| `ContactosControlador` | `/sedes/:id/contactos` | **NO** | Sin decoradores de auth |
| `DireccionesControlador` | `…/sedes/:id/direccion` | **NO** | Sin decoradores de auth |
| `HorariosControlador` | (desconocido) | **NO** | Sin decoradores de auth |
| `IdentidadControlador` | (desconocido) | **NO** | Sin decoradores de auth |
| `PaginasControlador` | `/sedes/:id/paginas` | **NO** | Sin decoradores de auth |
| `RecursosIdentidadControlador` | (desconocido) | **NO** | Sin decoradores de auth |
| `InfraestructuraControlador` | `/sedes/:id/infraestructura` | **NO** | Sin decoradores de auth |
| `ServiciosBasicosControlador` | `/sedes/:id/servicios-basicos` | **NO** | Sin decoradores de auth |
| `SaludControlador` | `/salud` | Intencional | Debe permanecer público |

**12 de 15 controladores están completamente desprotegidos.** Cualquier actor sin autenticar puede leer y modificar instituciones, sedes, infraestructura y demás datos.

### Causa raíz

`ADR-010` especifica que `APP_GUARD` debe registrarse globalmente pero esto nunca se implementó. La decisión arquitectural existe en documentación pero no en código.

---

## 4. Aislamiento multi-tenant — test sin aserciones

El archivo `test/personas-flujo.e2e-spec.ts` contiene una sección de prueba de aislamiento multi-tenant con el siguiente código:

```typescript
// PENDIENTE: Implementar prueba real de aislamiento
console.warn('Prueba de aislamiento pendiente');
return;
```

La prueba existe pero no verifica nada. Un escenario donde usuario A puede leer datos de institución B pasaría silenciosamente.

---

## 5. Variables de entorno — Joi no valida integraciones

`variables-entorno.esquema.ts` (líneas 1-36) valida 13 variables de BD, JWT y entorno, pero no incluye:

| Variable | Estado en Joi |
|---|---|
| `INTEGRACION_DOCUMENTOS_HABILITADA` | **Ausente** |
| `PROVEEDOR_DOCUMENTOS` | **Ausente** |
| `APISPERU_URL_BASE` | **Ausente** |
| `APISPERU_TOKEN` | **Ausente** |
| `APISPERU_TIMEOUT_MS` | **Ausente** |
| `INTEGRACION_RUTAS_HABILITADA` | **Ausente** |
| `GOOGLE_MAPS_API_KEY` | **Ausente** |
| `GOOGLE_MAPS_TIMEOUT_MS` | **Ausente** |

La validación al arranque no detectaría una mala configuración de integraciones. La app arranca sin error aunque `INTEGRACION_DOCUMENTOS_HABILITADA=true` y `APISPERU_TOKEN` esté vacío.

---

## 6. Acceso a `process.env` directo en adaptadores

Los siguientes archivos acceden a `process.env` directamente en lugar de usar `ConfiguracionAplicacion`:

| Archivo | Variable accedida directamente |
|---|---|
| `google-directions-legacy.adaptador.ts:34` | `process.env['GOOGLE_MAPS_API_KEY']` |
| `apisperu-dni.adaptador.ts` | `process.env['APISPERU_TOKEN']` |
| `apisperu-ruc.adaptador.ts` | `process.env['APISPERU_TOKEN']` |

El patrón correcto es inyectar `ConfiguracionAplicacion` y leer las propiedades tipadas. El acceso directo a `process.env` evade la validación Joi y los valores predeterminados.

---

## 7. Migración de Google API — pendiente

El adaptador actual `google-directions-legacy.adaptador.ts` usa la API de Directions (REST GET). La hoja de ruta contempla migrar a **Google Routes API** (POST a `routes.googleapis.com`) que requiere:

- Cambio de verbo HTTP (GET → POST)
- Campo `fieldMask` en headers
- Parseo de `duration` como string `"Xs"` → segundos
- Circuit breaker para fallos en cascada

---

## 8. Desalineación de versión Node en CI

`.github/workflows/ci.yml` usa `node-version: '20'` mientras el entorno local es `v24.16.0`. Esto puede ocultar incompatibilidades que solo se manifiestan en la versión correcta (o viceversa).

---

## 9. Migraciones ejecutadas

| Versión | Nombre | Estado |
|---|---|---|
| V01–V11 | (todas) | Ejecutadas en entorno local |

---

## 10. Resumen de brechas por PR asignado

| Brecha | Severidad | PR que lo corrige |
|---|---|---|
| APP_GUARD no registrado — 12 controllers expuestos | **CRÍTICA** | PR-01 |
| Test de aislamiento sin aserciones | **ALTA** | PR-02 |
| Google Routes API pendiente (usando legacy) | **MEDIA** | PR-03 |
| Joi no valida variables de integraciones | **MEDIA** | PR-04 |
| `process.env` directo en adaptadores | **MEDIA** | PR-04 |
| Node 20 en CI vs Node 24 local | **BAJA** | PR-04 |
| CORS/Helmet/throttling no configurados explícitamente | **MEDIA** | PR-04 |

---

*Generado como parte de FASE 0 de REL-004 antes de iniciar cambios.*
