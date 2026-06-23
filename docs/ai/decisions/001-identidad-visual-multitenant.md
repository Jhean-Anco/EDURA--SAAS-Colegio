# ADR 001: Identidad Visual Multitenant y Autenticación Dinámica

## Estado
Aprobado

## Fecha
2026-06-23

## Contexto
EDURA es un SaaS educativo multiinstitución y multisede. Para permitir la personalización de marca sin comprometer la estabilidad del sistema ni la experiencia del usuario (UX), necesitábamos un mecanismo para:
1. Personalizar la identidad visual de cada institución (logotipos, colores, lemas).
2. Servir un portal de login dinámico según el tenant que accede (vía subdominio, ruta slug, dominio personalizado).
3. Evitar el parpadeo de estilos (theme flickering) en Next.js App Router durante la inyección de variables CSS de colores.
4. Asegurar que las combinaciones de colores cumplan con las directrices de accesibilidad (WCAG AA).
5. Almacenar activos de marca (imágenes, logos) de forma óptima sin guardarlos como binarios en la base de datos PostgreSQL.

## Decisiones
Implementamos las siguientes soluciones:
1. **Esquema de Base de Datos**: Creamos 4 entidades principales:
   - `IdentidadVisualInstitucion`: Controla el estado global de la configuración de identidad visual.
   - `VersionIdentidadVisual`: Controla las versiones borrador e históricas (permitiendo reversión y edición segura).
   - `ActivoIdentidadVisual`: Referencia metadatos y rutas físicas de archivos almacenados.
   - `PuntoAccesoInstitucion`: Configura cómo se identifica un acceso (ruta slug, subdominio, etc.).
2. **Pre-validación de Contraste (WCAG AA)**: Implementamos tanto en front como en back (mediante regex Hex y cálculos de contraste de color relativo) validaciones que exigen una relación de contraste mínima de 4.5:1 para elementos de texto común sobre fondos, asegurando accesibilidad.
3. **Inyección en Next.js SSR (BFF)**: Resolviendo el tenant en el servidor leyendo el encabezado `Host` o la ruta slug y generando un bloque `<style>` dinámico en el `<head>` de `layout.tsx`. Esto elimina por completo el flickering visual.
4. **Almacenamiento Desacoplado**: Usamos una interfaz de almacenamiento (`RepositorioActivosIdentidad` + `AlmacenamientoActivosLocal` con posibilidad de S3) guardando solo la ruta/clave en BD y sirviendo los archivos a través de un endpoint HTTP público protegido.

## Consecuencias
- **Beneficios**: Personalización ilimitada y segura por tenant, alto nivel de accesibilidad obligatorio por diseño, cero flickering visual en SSR, cookies seguras host-only.
- **Riesgos controlados**: El almacenamiento local de archivos en desarrollo se mapea a una carpeta fuera de la base de datos (`almacenamiento-local-activos`), facilitando la migración a buckets de producción sin modificar código de negocio.
