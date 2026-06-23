---
id: revisar-autorizacion
version: "1.0.0"
descripcion: "Verifica guards, roles y permisos en endpoints y componentes"
categoria: seguridad
plataformas: [claude-code, codex, antigravity]
activar_cuando:
  - nuevo endpoint creado
  - cambio en guards o decoradores de roles
  - nuevo rol o permiso
  - cambio en módulo identidad-acceso
no_activar_cuando:
  - cambios solo en lógica de dominio sin impacto en presentación
herramientas_permitidas: [lectura, busqueda_dirigida]
presupuesto: normal
---

## Pasos

1. Para cada controlador modificado o nuevo:
   - Verificar que tenga `@UseGuards(JwtAuthGuard)` o equivalente.
   - Verificar que rutas de mutación tengan `@Roles(...)` apropiado.
2. Buscar endpoints sin guard:
   ```
   pnpm ai:search -- "@Get\|@Post\|@Put\|@Delete\|@Patch" --glob "back/src/**/presentacion/**/*.ts"
   ```
3. Verificar que los roles usados existan en el sistema de permisos.
4. En frontend: verificar que rutas protegidas tengan verificación de sesión/rol.
5. Verificar que no haya rutas que deberían ser privadas marcadas como públicas.

## Salida

Lista de endpoints sin autorización adecuada (bloqueante) y advertencias.
Resultado OK si todos los endpoints están correctamente protegidos.
