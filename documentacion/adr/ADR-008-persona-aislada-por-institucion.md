# ADR-008 - Persona aislada por institucion

## Contexto

Cada institución educativa administra su propio universo de personas.

## Decisión

La tabla `personas` incluye `id_institucion_educativa` y todas las consultas filtran por esa clave.

## Consecuencias

- No hay acceso cruzado entre instituciones.
- El mismo individuo físico puede tener registros distintos por institución.

