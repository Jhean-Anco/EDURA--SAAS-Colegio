# Fixture BEN-MCP-EDURA-001 — Localización de módulo matriculas

## Propósito
Escenario para medir diferencia entre herramientas locales generales
vs servidor MCP edura-contexto en una tarea de localización estructural.

## Tarea
Encontrar el servicio que gestiona matrículas, identificar la entidad
TypeORM y retornar nombre de tabla y 3 columnas principales.

## Respuesta esperada
- Servicio: `back/src/modulos/matriculas/aplicacion/servicios/matriculas.service.ts`
- Entidad: `Matricula` en `back/src/modulos/matriculas/dominio/entidades/matricula.entity.ts`
- Tabla: `matriculas`
- Columnas: `id`, `estudiante_id`, `periodo_id` (o equivalentes en la entidad real)

## Métricas a comparar
- Variante A (sin MCP): archivos abiertos, llamadas Glob/Grep, líneas leídas
- Variante B (con edura-contexto): llamadas MCP, bytes de respuesta, tiempo

## Nota
Este fixture no incluye código modificado. El repositorio real se usa como fuente.
El módulo `matriculas` puede o no estar implementado — registrar el estado real.
