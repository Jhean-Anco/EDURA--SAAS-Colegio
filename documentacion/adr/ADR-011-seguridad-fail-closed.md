# ADR-011 — Seguridad fail-closed: APP_GUARD global

**Estado:** Aceptado  
**Fecha:** 2026-06-20  
**Reemplaza:** Decisión implícita en ADR-010 que nunca se implementó

---

## Contexto

ADR-010 especificó que `GuardiaJwt` y `GuardiaPermisos` debían registrarse globalmente como `APP_GUARD`. Sin embargo, la implementación dejó estas guardias como providers locales de módulos individuales, resultando en 12 de 15 controladores completamente desprotegidos.

El patrón inverso (protección opt-in por controlador) es inseguro porque un nuevo controlador queda expuesto por omisión si el desarrollador olvida el decorador.

---

## Decisión

Adoptar el patrón **fail-closed**: todo endpoint es privado por defecto. El acceso público debe declararse explícitamente.

### Mecanismo

1. `GuardiaJwt` y `GuardiaPermisos` se registran en `AppModule.providers` con el token `APP_GUARD` de `@nestjs/core`. NestJS aplica todos los `APP_GUARD` a cada ruta antes de que el controlador se ejecute.

2. Para endpoints que deben ser públicos (salud, login, renovar token), se usa `@Publico()` que establece metadata `ES_PUBLICO = true`. `GuardiaJwt` lee esta metadata con `Reflector` y devuelve `true` sin verificar el token.

3. Para endpoints autenticados pero sin permiso específico (seleccionar contexto, listar contextos), basta con que `GuardiaJwt` pase. `GuardiaPermisos` sólo actúa si el endpoint tiene `@Permisos(...)` declarado.

4. Para endpoints de negocio, `@Permisos('DOMINIO.ACCION')` declara el permiso mínimo requerido. `GuardiaPermisos` consulta la tabla `roles_permisos` en tiempo real.

### CompartidoModule

Se crea `src/compartido/compartido.module.ts` como módulo `@Global()` que provee:
- `ConsultadorPermisosEfectivosTypeorm` — implementación TypeORM de la consulta SQL de permisos
- `GuardiaPermisos` — guardia que lee `@Permisos()` y consulta permisos efectivos

Al ser `@Global()`, sus providers están disponibles en todos los módulos sin necesidad de importarlo explícitamente.

---

## Consecuencias

### Positivas
- Un nuevo controlador sin `@Publico()` es inaccesible por defecto — el error es visible y seguro
- La superficie de ataque queda auditada declarativamente en los decoradores `@Permisos()`
- Elimina duplicación: `GuardiaPermisos` no necesita registrarse en cada módulo

### Negativas / Compromisos
- Los controladores existentes requieren `@Permisos()` explícito o `@Publico()` — migración de una vez
- `APP_GUARD` con `useExisting` requiere que el provider referenciado ya esté registrado en el mismo módulo o en un módulo `@Global()`

---

## Alternativas rechazadas

- **Protección opt-in por controlador**: mantiene el estado actual inseguro
- **Middleware global**: no tiene acceso a metadata de decoradores, no puede evaluar `@Permisos()`
- **Interceptor global**: se ejecuta después del guardia, no sirve para autenticación

---

## Referencias

- ADR-010: Autenticación y permisos globales (intención original)
- [NestJS Guards](https://docs.nestjs.com/guards)
- OWASP: Security by Default
