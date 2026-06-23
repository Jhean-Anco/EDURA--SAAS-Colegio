# Mapa de Base de Datos EDURA

Fuente canónica: `back/src/base-datos/typeorm/migraciones/`
Fuente de datos: `back/src/base-datos/typeorm/fuente-datos.ts`
Diccionario completo: `docs/DICCIONARIO-DATOS.md`

## Entidades principales por módulo

| Módulo                  | Entidades clave (buscar en `dominio/entidades/`) |
|-------------------------|--------------------------------------------------|
| identidad-acceso        | Usuario, Rol, Permiso, SesionRefresh             |
| personas                | Persona                                           |
| estructura-institucional| Institucion, Sede                                 |
| estructura-academica    | NivelEducativo, Grado, Seccion                   |
| curriculo               | PlanEstudios, Curso, Componente                  |
| docentes                | Docente, AsignacionDocente                       |
| estudiantes             | Estudiante                                        |
| matriculas              | Matricula, DetalleMatricula                      |
| infraestructura-fisica  | Aula, RecursoFisico                              |

## Convención de columnas multitenencia

Toda entidad que almacene datos institucionales incluye `institucion_id` (FK a Institucion).
El guard de row isolation en `identidad-acceso` inyecta este filtro automáticamente.

## Comandos de base de datos

```bash
# Generar migración
npm --prefix back run db:migration:generate --name=NombreDescriptivo

# Ejecutar migraciones (requiere aprobación)
npm --prefix back run db:migration:run

# Ver estado de migraciones
npm --prefix back run db:migration:show

# Sembrar catálogos
npm --prefix back run db:seed:catalogos
```

## Nota de seguridad

Nunca ejecutar `db:migration:run` contra producción sin revisión humana.
Nunca ejecutar `db:seed:demo` con `ENTORNO=produccion`.
Índice estructural regenerado: `docs/ai/generated/entities.json`
