# Reglas de integridad

## Garantizado por PostgreSQL

- Unicidad de códigos en catálogos.
- Unicidad de sede por institución y código.
- Sede principal activa única por institución.
- Autorrelación de ubigeos.
- Una identidad por sede.
- Slug público único cuando existe.
- Una página de inicio publicada por sede.
- Orden único por página en secciones.
- Jerarquía física por `id_elemento_padre`.
- FKs restrictivas en especializaciones.

## Representado por TypeORM

- Registro de 27 entidades.
- Relaciones explícitas con `JoinColumn`.
- Especializaciones con PK/FK compartida.
- `synchronize: false`.
- `migrationsRun: false`.

## Pendiente para dominio

- Reglas de publicación de identidad.
- Validación de contenido JSON por sección.
- Reglas de jerarquía sin ciclos.
- Reglas de publicación/despublicación de páginas.

## Pendiente para aplicación

- Casos de uso de creación, actualización, publicación y consulta.
- Validación de permisos futuros por sede/institución.

## Pendiente de pruebas

- Integración real con PostgreSQL.
- CTE recursivo de árbol y rutas.
- Transacciones de creación y rollback.
## Reglas SaaS documentadas

- `PLATAFORMA` no requiere `institucionId`.
- `INSTITUCION` requiere `institucionId`.
- `SEDE` requiere `institucionId` y `sedeId`.
- Bootstrap propietario usa `PROPIETARIO_PLATAFORMA` y no inventa un ambito en la asignacion.
- Demo y bootstrap son idempotentes.
