# ADR-012 — Migración a Google Routes API

**Estado:** Aceptado  
**Fecha:** 2026-06-20  
**Reemplaza:** Uso de Google Directions API (Legacy) en `google-directions-legacy.adaptador.ts`

---

## Contexto

El adaptador anterior usaba la API de Google Directions (REST GET) que Google ha marcado como legacy. La nueva **Google Routes API** ofrece:

- Mejor precisión de tiempos de viaje con tráfico en tiempo real
- Más opciones de ruteo (preferencias de ruta, evitar peajes, etc.)
- Respuesta estructurada con `distanceMeters` (int) y `duration` (string `"Xs"`) en lugar de objetos anidados
- Soporte a `fieldMask` para reducir payload de respuesta

La migración es necesaria además porque la API Legacy dejará de tener soporte activo.

---

## Decisión

Crear `GoogleRoutesApiAdaptador` que implementa el puerto `CalculadorRutas` usando:

- **Método:** `POST` a `https://routes.googleapis.com/directions/v2:computeRoutes`
- **Autenticación:** Header `X-Goog-Api-Key` (no query param)
- **Field mask:** `X-Goog-FieldMask: routes.distanceMeters,routes.duration,routes.description`
- **Parseo de duración:** Regex `(\d+(?:\.\d+)?)s` sobre el string devuelto por la API
- **Circuit breaker:** Estado CERRADO → ABIERTO (tras 3 fallos) → SEMI_ABIERTO (tras 30s) → CERRADO
- **Retry con backoff:** Hasta 2 reintentos con espera exponencial (300ms, 600ms)
- **Timeout:** Configurable vía `GOOGLE_MAPS_TIMEOUT_MS` (compartido con legacy)

### Variables de entorno nuevas

| Variable | Descripción | Default |
|---|---|---|
| `GOOGLE_ROUTES_API_KEY` | API key con Routes API habilitada | `''` (vacío) |
| `GOOGLE_ROUTES_URL_BASE` | URL base del endpoint | `https://routes.googleapis.com/directions/v2:computeRoutes` |

El adaptador legacy `google-directions-legacy.adaptador.ts` se conserva en el repositorio para referencia pero ya no se usa en producción.

---

## Consecuencias

### Positivas
- API mantenida activamente por Google
- Circuit breaker evita cascadas de fallos en caso de indisponibilidad
- Retry con backoff absorbe errores transitorios (timeouts de red, rate limits temporales)
- `fieldMask` reduce el tamaño del payload de respuesta

### Negativas / Compromisos
- Requiere nueva API key con Routes API habilitada (diferente permiso que Directions)
- El parseo de duración como string `"Xs"` es menos robusto que el int de Directions
- El estado del circuit breaker vive en memoria — se resetea al reiniciar la app

---

## Referencias

- [Google Routes API Docs](https://developers.google.com/maps/documentation/routes)
- ADR-011: Seguridad fail-closed
