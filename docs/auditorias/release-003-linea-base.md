# RELEASE-003 - Linea base

Fecha: 2026-06-20
Rama: `feature/release-003-base-saas-operable`
Entorno: Windows / PowerShell / Node v24.16.0 / npm 11.13.0
Commit: `f4c393482991ec27942ce0850a43fab73e033fb9`

## Resumen

- Entidades TypeORM registradas: 40
- Migraciones disponibles: 8
- Migraciones aplicadas en la base actual: 4

## Comandos ejecutados

### `git status`

Resultado: working tree clean.

### `git branch --show-current`

Resultado: `feature/release-003-base-saas-operable`

### `git rev-parse HEAD`

Resultado: `f4c393482991ec27942ce0850a43fab73e033fb9`

### `node --version`

Resultado: `v24.16.0`

### `npm --version`

Resultado: `11.13.0`

### `npm ci`

Resultado: exitoso.

Duración aproximada: 27 s.

### `npm run lint`

Resultado: exitoso.

### `npm run build`

Resultado: exitoso.

### `npm test -- --runInBand`

Resultado: exitoso.

### `npm run test:e2e -- --runInBand`

Resultado: exitoso.

### `npm run db:migration:show`

Resultado: exitoso.

Migraciones detectadas:

- `CrearEstructuraInstitucionalEInfraestructuraFisica1718810000000`
- `ConsolidarBaseInstitucionalInfraestructuraV021718820000000`
- `AgregarIdentidadYPresenciaDigitalSedeV031718830000000`
- `AgregarEvaluacionesConservacionElementoV041718840000000`
- `AgregarSeguridadUsuariosMembresiasConfiguracionV051718850000000`
- `AgregarRolesPermisosAsignacionesV061718860000000`
- `AgregarInvitacionesSesionesTokensV071718870000000`
- `AgregarAuditoriaAppendOnlyV081718880000000`

## Observaciones

- La rama parte de un estado compilable y probado.
- La base ya reconoce 40 entidades TypeORM.
- No se aplicó ninguna migración nueva todavía en esta línea base.
