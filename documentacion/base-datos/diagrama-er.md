# Diagrama ER lógico

## Estructura institucional

- `instituciones_educativas` 1---n `sedes`
- `sedes` 1---1 `direcciones_sede`
- `sedes` 1---0..1 `identidades_sede`
- `identidades_sede` 1---n `recursos_identidad_sede`
- `sedes` 1---n `canales_contacto_sede`
- `sedes` 1---n `horarios_atencion_sede`
- `sedes` 1---n `paginas_sede`
- `paginas_sede` 1---n `secciones_pagina_sede`
- `ubigeos` 1---n `ubigeos` por `id_ubigeo_padre`
- `ubigeos` 1---n `direcciones_sede`
- `sedes` 1---n `servicios_basicos_sede`
- `tipos_servicio_basico` 1---n `servicios_basicos_sede`

## Infraestructura física

- `sedes` 1---n `elementos_infraestructura`
- `tipos_elemento_infraestructura` 1---n `elementos_infraestructura`
- `estados_conservacion` 1---n `elementos_infraestructura`
- `elementos_infraestructura` 1---n `elementos_infraestructura` por `id_elemento_padre`
- `elementos_infraestructura` 1---0..1 `predios`
- `elementos_infraestructura` 1---0..1 `edificaciones`
- `elementos_infraestructura` 1---0..1 `niveles`
- `elementos_infraestructura` 1---0..1 `espacios_fisicos`
- `elementos_infraestructura` 1---0..1 `espacios_exteriores`
- `elementos_infraestructura` 1---0..1 `componentes_infraestructura`

## Catálogos

- `tipos_tenencia_predio` -> `predios`
- `tipos_edificacion` -> `edificaciones`
- `tipos_espacio_fisico` -> `espacios_fisicos`
- `tipos_espacio_exterior` -> `espacios_exteriores`
- `tipos_componente_infraestructura` -> `componentes_infraestructura`
- `unidades_medida` -> `componentes_infraestructura`

## Notas

- La jerarquía física se expresa por `elementos_infraestructura.id_elemento_padre`.
- Las especializaciones comparten la PK/FK `id_elemento_infraestructura`.
- No se modelan tablas adicionales fuera de las 27 entidades registradas.
