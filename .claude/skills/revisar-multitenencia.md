---
id: revisar-multitenencia
version: "1.0.0"
descripcion: "Verifica que cambios en entidades incluyan institucion_id y filtros de row isolation"
categoria: seguridad
plataformas: [claude-code, codex, antigravity]
activar_cuando:
  - nueva entidad con datos de institución
  - nuevo endpoint que devuelve datos institucionales
  - cambio en repositorio TypeORM
no_activar_cuando:
  - entidades de catálogo global sin datos por institución
  - cambios solo en lógica de presentación
herramientas_permitidas: [lectura, busqueda_dirigida]
presupuesto: normal
---

## Pasos

1. Buscar `institucion_id` en la entidad modificada o nueva.
2. Si la entidad tiene datos institucionales y falta `institucion_id`: reportar como bloqueante.
3. Verificar que el repositorio aplique filtro `where: { institucion_id }` en consultas.
4. Verificar que el guard de `identidad-acceso` inyecte el filtro automáticamente.
5. Buscar consultas sin filtro de institución:
   ```
   pnpm ai:search -- "\.find\(\|\.findOne\(" --glob "back/src/modulos/**/infraestructura/**/*.ts"
   ```
6. Verificar que los controladores no expongan datos de otras instituciones.

## Salida

Lista de problemas encontrados con severidad (bloqueante / advertencia) y ruta del archivo.
Resultado OK si no se encuentran problemas.
