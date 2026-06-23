---
id: generar-contrato-openapi
version: "1.0.0"
descripcion: "Genera o actualiza la especificación OpenAPI del backend EDURA"
categoria: api
plataformas: [claude-code, codex, antigravity]
activar_cuando:
  - nuevo endpoint público
  - cambio en DTOs de entrada o salida
  - nueva versión de API
no_activar_cuando:
  - cambios internos sin impacto en la interfaz HTTP
herramientas_permitidas: [lectura, busqueda_dirigida, escritura_docs]
presupuesto: normal
---

## Pasos

1. Verificar si `@nestjs/swagger` está configurado en `back/src/main.ts`.
2. Si está configurado: documentar que el OpenAPI se genera en runtime.
3. Listar los nuevos endpoints y sus DTOs modificados.
4. Verificar que cada DTO tenga decoradores `@ApiProperty()`.
5. Actualizar `docs/ai/api-map.md` con los nuevos endpoints.
6. Si existe script de exportación de OpenAPI, ejecutarlo y guardar en `docs/ai/generated/`.

## Salida

Confirmación de decoradores presentes o lista de DTOs que los requieren.
Ruta del archivo OpenAPI actualizado si se generó.
