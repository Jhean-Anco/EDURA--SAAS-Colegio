---
id: auditar-accesibilidad
version: "1.0.0"
descripcion: "Revisa componentes de UI contra criterios WCAG 2.1 AA"
categoria: calidad
plataformas: [claude-code, codex]
activar_cuando:
  - nuevo componente de formulario
  - nueva página con contenido interactivo
  - cambio en componentes de navegación
no_activar_cuando:
  - cambios solo en lógica de negocio sin impacto en UI
  - cambios solo en estilos de color no relacionados a contraste
herramientas_permitidas: [lectura, busqueda_dirigida]
presupuesto: normal
---

## Pasos

1. Leer los componentes modificados o nuevos.
2. Verificar criterios WCAG 2.1 AA:
   - Imágenes tienen `alt` descriptivo
   - Formularios tienen `<label>` asociado o `aria-label`
   - Botones tienen texto visible o `aria-label`
   - Uso de Radix UI primitivos (ya incorporan accesibilidad por defecto)
   - Orden de foco lógico con Tab
   - No usar solo color para comunicar información
   - Mensajes de error asociados al campo (`aria-describedby`)
3. Verificar que los primitivos de Radix UI se usen correctamente (no anular atributos ARIA).
4. Listar problemas encontrados con el criterio WCAG violado.

## Salida

Lista de problemas con criterio WCAG, severidad y sugerencia de corrección.
Resultado OK si se cumplen todos los criterios verificados.
