# EDURA-XXX: Título descriptivo de la tarea

**Estado:** activa | en-progreso | bloqueada
**Fecha:** YYYY-MM-DD
**Actor:** planificador | implementador | revisor | probador | documentador
**Tipo:** mecanico | normal | critico
**Perfil:** local-fast | backend | frontend-ui | docs-research | security-audit | database-review

---

## Objetivo

_Una oración que describa qué debe quedar implementado al terminar._

## Contexto

_Por qué es necesaria esta tarea. Qué problema resuelve. Referencias a decisiones previas._

## Módulos afectados

- [ ] `back/src/modulos/<nombre>/`
- [ ] `front/src/features/<nombre>/`
- [ ] `back/src/base-datos/typeorm/migraciones/`
- [ ] otro

## Alcance permitido

_Lista exacta de archivos, rutas o módulos que el agente puede modificar._

- `back/src/modulos/<nombre>/`
- (agregar según la tarea)

## Fuera de alcance

_Lo que NO debe tocarse._

- No modificar módulos de otros dominios salvo registro en `app.module.ts`.
- No cambiar la base de datos de producción.
- No instalar dependencias de producción nuevas.

## Archivos de referencia

_Rutas útiles para completar la tarea — no abrir todo, solo lo indicado._

- `back/src/modulos/<referencia>/<referencia>.module.ts` — ver estructura
- `docs/ai/conventions.md` — convenciones
- `docs/ai/decisions/ADR-XXXX-*.md` — si aplica

## Requerimientos

1. _Requerimiento concreto y verificable_
2. _..._

## Reglas específicas

- _Cualquier restricción de la tarea que no esté en AGENTS.md_

## Datos de prueba

_Si aplica: datos ficticios o fixtures necesarios. Nunca datos reales._

## Seguridad

- [ ] Verificar multitenencia si la entidad tiene `institucion_id`
- [ ] Verificar guards en endpoints nuevos
- [ ] Sin secretos en el código
- [ ] Sin datos personales en pruebas

## Criterios de aceptación

- [ ] TypeScript compila sin errores
- [ ] ESLint pasa en archivos modificados
- [ ] Pruebas afectadas pasan
- [ ] Sin secretos en el diff
- [ ] _Criterio específico de la funcionalidad_

## Pruebas requeridas

_Qué pruebas deben existir al terminar._

- Unit test: `back/src/modulos/<nombre>/aplicacion/casos-de-uso/<caso>.spec.ts`
- (agregar según la tarea)

## Riesgos

- _Riesgo identificado + mitigación_

## Presupuesto

```yaml
perfil: normal
archivos_maximos: 20
lineas_maximas: 2500
skills_sugeridas:
  - compilar-contexto-tarea
  - crear-recurso-nestjs
  - ejecutar-pruebas-dirigidas
  - cerrar-tarea-edura
```

## Respuesta requerida

Al terminar, reportar:
- Archivos creados o modificados
- Decisiones tomadas
- Resultado de validaciones
- Riesgos residuales
- Pendientes (si los hay)

---
_Plantilla: tasks/templates/TASK.template.md_
