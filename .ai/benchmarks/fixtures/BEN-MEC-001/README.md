# Fixture BEN-MEC-001 — Import TypeScript inválido

## Propósito
Escenario mecánico para benchmark. El archivo `paginacion.dto.ts` contiene
un import a una ruta inexistente.

## Instalación del fixture
Copiar `paginacion.dto.ts` a:
`back/src/compartido/aplicacion/dtos/paginacion.dto.ts`

## Causa raíz esperada
Import en línea 7: `import { AlgoInexistente } from '../../../inexistente/ruta-que-no-existe'`

## Solución esperada
Eliminar el import inválido. El símbolo `AlgoInexistente` no se usa en el archivo.

## Validación post-fix
```bash
node --check back/src/compartido/aplicacion/dtos/paginacion.dto.ts
```
