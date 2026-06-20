# Línea base de implementación

- Fecha: 2026-06-19
- Commit base: `86eca372fbe46b688efb72df15a26465f04c402b`
- Rama analizada: `main`
- Directorio auditado: `D:\EDURA\sistema\back`

## Hallazgos iniciales

- El registro TypeORM contiene 28 entidades.
- El `README.md` todavía reporta 27 entidades.
- La arquitectura vigente ya separa módulos por frontera funcional, pero todavía hay acoplamientos directos a TypeORM en aplicación, presentación e infraestructura.
- Existen migraciones versionadas y `synchronize` está desactivado.

## Comandos ejecutados

- `git rev-parse HEAD`
- `npm.cmd ci`
- `npm.cmd run lint`
- `npm.cmd run build`
- `npm.cmd test -- --runInBand`
- `npm.cmd run test:e2e -- --runInBand`
- `npm.cmd run db:migration:show`

## Resultados

| Comando                               | Resultado                       |
| ------------------------------------- | ------------------------------- |
| `npm.cmd ci`                          | Correcto                        |
| `npm.cmd run lint`                    | Correcto                        |
| `npm.cmd run build`                   | Correcto                        |
| `npm.cmd test -- --runInBand`         | Correcto                        |
| `npm.cmd run test:e2e -- --runInBand` | Correcto                        |
| `npm.cmd run db:migration:show`       | Mostró 4 migraciones ejecutadas |

## Riesgos observados

- La capa de aplicación importa repositorios TypeORM concretos en varios casos de uso y consultas.
- La presentación aún depende de consultas/repositorios de infraestructura.
- La documentación de entidades no coincide con el registro real.
- Faltan pruebas de integración con PostgreSQL real y cobertura de concurrencia.
