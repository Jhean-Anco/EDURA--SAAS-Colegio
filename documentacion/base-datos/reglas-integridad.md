# Reglas de integridad

## Garantizado por PostgreSQL

- Unicidad de códigos en catálogos.
- Unicidad de `sedes` por institución y código.
- Única sede principal activa por institución mediante índice parcial.
- Autorrelación de `ubigeos` con FK restrictiva.
- Autorrelación de `elementos_infraestructura` con FK compuesta a la misma sede.
- FK restrictivas entre especializaciones y `elementos_infraestructura`.
- Restricciones de no negatividad y fechas coherentes incluidas en la migración V02.

## Representado por TypeORM

- Registro exacto de 21 entidades.
- Especializaciones con PK/FK compartida.
- Relaciones `ManyToOne` y `OneToOne` explícitas con `JoinColumn`.
- `synchronize: false`.
- `migrationsRun: false`.

## Pendiente para dominio

- Validación semántica del estado de cada tipo de elemento.
- Reglas de negocio sobre creación, traslado y baja de infraestructura.
- Coherencia funcional entre sede, elemento y catálogo.

## Pendiente para aplicación

- Casos de uso para creación y actualización.
- Comandos/consultas de mantenimiento.
- Flujo de carga y reconciliación de datos externos.

## Pendiente de pruebas

- Verificación contra PostgreSQL real de restricciones y semillas idempotentes.
- Escenarios de rechazo por padre de otra sede.
- Repetición de semillas sin duplicados.
