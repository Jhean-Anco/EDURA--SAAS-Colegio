# ADR-010 — Autenticación y permisos globales

**Estado:** Aceptado  
**Fecha:** 2026-06-20

## Contexto

El sistema tenía endpoints públicos por defecto y una guardia de permisos que no consultaba `roles_permisos` en base de datos.

## Decisiones

1. **`GuardiaJwt` como guardia global**: Se registra como `APP_GUARD` en `AppModule`. Todo endpoint es privado por defecto. Se usa `@Publico()` solo donde sea necesario (salud, login, refresh).

2. **Validación de sesión en `GuardiaJwt`**: La guardia verifica firma JWT, emisor, audiencia, expiración, existencia y revocación de sesión, estado activo del usuario y versión de seguridad. No hace consultas TypeORM directamente — usa los repositorios inyectados.

3. **`GuardiaPermisos` consulta `roles_permisos`**: La guardia ejecuta una query SQL que une `asignaciones_rol_usuario → roles → roles_permisos → permisos` filtrando por estado activo y vigencia. La autorización es por código de permiso, no por nombre de rol.

4. **`ContextoSolicitudAutenticada`**: Contrato transversal en `compartido/aplicacion/` que desacopla la capa compartida de la implementación JWT de `identidad-acceso`. El decorador `@ContextoActual()` lee siempre de `request.contextoActual`.

5. **`RenovarSesionCasoUso` emite PRECONTEXTO**: Al rotar el refresh token se emite un access token de tipo `PRECONTEXTO` con `ambito: null`. El usuario debe seleccionar contexto nuevamente. Esto es más seguro que preservar un contexto potencialmente desactualizado.

## Consecuencias

- Ningún endpoint de negocio queda público accidentalmente.
- Los permisos son verificables y auditables en base de datos.
- El contexto institucional siempre proviene del JWT, nunca del frontend.
- El token PRECONTEXTO no tiene permisos de negocio — cualquier guardia que exija `ACCESO` lo rechaza.
