# MOD-003 V3 - Linea base

Fecha: 2026-06-19
Rama: `feature/mod-003-identidad-acceso-v3`
Entorno: Windows / PowerShell / Node 24.16.0 / npm 11.13.0
Commit: `838d5db310a8c37fe52e4288187f3c251283cbec`

## Resumen del estado

- Entidades TypeORM registradas: 28
- Migraciones detectadas: 4
- `IdentidadAccesoModule`: presente pero sin funcionalidad de MOD-003

## Comandos ejecutados

### `git status`

Resultado: limpio antes de iniciar cambios.

### `git branch --show-current`

Resultado: `feature/mod-003-identidad-acceso-v3`

### `git rev-parse HEAD`

Resultado: `838d5db310a8c37fe52e4288187f3c251283cbec`

### `npm ci`

Resultado: exitoso.

Duración aproximada: 21 s.

Observaciones:

- Se instalaron 770 paquetes.
- `npm audit` reportó 25 vulnerabilidades en dependencias instaladas.

### `npm run lint`

Resultado: exitoso.

### `npm run build`

Resultado: exitoso.

### `npm test -- --runInBand`

Resultado: exitoso.

Resumen:

- 6 suites
- 8 tests

### `npm run test:e2e -- --runInBand`

Resultado: exitoso.

Resumen:

- 1 suite
- 2 tests

### `npm run db:migration:show`

Resultado: exitoso.

Migraciones detectadas:

- `CrearEstructuraInstitucionalEInfraestructuraFisica1718810000000`
- `ConsolidarBaseInstitucionalInfraestructuraV021718820000000`
- `AgregarIdentidadYPresenciaDigitalSedeV031718830000000`
- `AgregarEvaluacionesConservacionElementoV041718840000000`

## Observaciones técnicas

- La línea base confirma que MOD-003 todavía no tiene implementación funcional real.
- El árbol compila y las pruebas actuales pasan sobre la rama revisada.
- La cantidad de entidades en `src/base-datos/typeorm/typeorm.registro.ts` coincide con 28.
