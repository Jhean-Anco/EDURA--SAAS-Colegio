# Matriz de cobertura de módulos

| Entidad o agregado | Dominio | Puerto | Caso de uso | Repositorio | Mapeador | Consulta | Controlador | DTO | Prueba unitaria | Prueba integración | Prueba E2E | Estado | Evidencia |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| InstitucionEducativa | Sí | Sí | Sí | Sí | Sí | Sí | Sí | Sí | Sí | No | No | Parcial | `src/modulos/estructura-institucional` |
| Sede | Sí | Sí | Sí | Sí | Sí | Sí | Sí | Sí | Sí | No | No | Parcial | `src/modulos/estructura-institucional` |
| DireccionSede | Sí | Sí | Sí | Sí | Sí | No | Sí | Sí | No | No | No | Parcial | `src/modulos/estructura-institucional/dominio/direcciones-sede` |
| Ubigeo | Sí | Sí | No | No | No | Sí | Sí | Sí | No | No | No | Parcial | `src/modulos/estructura-institucional/aplicacion/ubigeos` |
| IdentidadSede | Sí | Sí | Sí | Sí | Sí | Sí | Sí | Sí | No | No | No | Parcial | `src/modulos/estructura-institucional/infraestructura/persistencia/typeorm/entidades/identidad-sede.typeorm-entidad.ts` |
| RecursoIdentidadSede | Sí | Sí | Sí | Sí | Sí | No | Sí | Sí | No | No | No | Parcial | `src/modulos/estructura-institucional/infraestructura/persistencia/typeorm/entidades/recurso-identidad-sede.typeorm-entidad.ts` |
| CanalContactoSede | Sí | Sí | Sí | Sí | Sí | No | Sí | Sí | No | No | No | Parcial | `src/modulos/estructura-institucional/infraestructura/persistencia/typeorm/entidades/canal-contacto-sede.typeorm-entidad.ts` |
| HorarioAtencionSede | Sí | Sí | Sí | Sí | Sí | No | Sí | Sí | No | No | No | Parcial | `src/modulos/estructura-institucional/infraestructura/persistencia/typeorm/entidades/horario-atencion-sede.typeorm-entidad.ts` |
| PaginaSede | Sí | Sí | Sí | Sí | Sí | Sí | Sí | Sí | No | No | No | Parcial | `src/modulos/estructura-institucional/infraestructura/persistencia/typeorm/entidades/pagina-sede.typeorm-entidad.ts` |
| SeccionPaginaSede | Sí | Sí | Sí | Sí | Sí | No | Sí | Sí | No | No | No | Parcial | `src/modulos/estructura-institucional/infraestructura/persistencia/typeorm/entidades/seccion-pagina-sede.typeorm-entidad.ts` |
| TipoServicioBasico | Sí | Sí | No | No | No | Sí | No | No | No | No | No | Parcial | `src/modulos/infraestructura-fisica/infraestructura/persistencia/typeorm/entidades/tipo-servicio-basico.typeorm-entidad.ts` |
| ServicioBasicoSede | Sí | Sí | Sí | Sí | Sí | Sí | Sí | Sí | Sí | No | No | Parcial | `src/modulos/infraestructura-fisica/aplicacion/servicios-basicos` |
| TipoElementoInfraestructura | Sí | Sí | No | No | No | Sí | No | No | No | No | No | Parcial | `src/modulos/infraestructura-fisica/infraestructura/persistencia/typeorm/entidades/tipo-elemento-infraestructura.typeorm-entidad.ts` |
| EstadoConservacion | Sí | Sí | No | No | No | Sí | No | No | No | No | No | Parcial | `src/modulos/infraestructura-fisica/infraestructura/persistencia/typeorm/entidades/estado-conservacion.typeorm-entidad.ts` |
| TipoTenenciaPredio | Sí | Sí | No | No | No | Sí | No | No | No | No | No | Parcial | `src/modulos/infraestructura-fisica/infraestructura/persistencia/typeorm/entidades/tipo-tenencia-predio.typeorm-entidad.ts` |
| TipoEdificacion | Sí | Sí | No | No | No | Sí | No | No | No | No | No | Parcial | `src/modulos/infraestructura-fisica/infraestructura/persistencia/typeorm/entidades/tipo-edificacion.typeorm-entidad.ts` |
| TipoEspacioFisico | Sí | Sí | No | No | No | Sí | No | No | No | No | No | Parcial | `src/modulos/infraestructura-fisica/infraestructura/persistencia/typeorm/entidades/tipo-espacio-fisico.typeorm-entidad.ts` |
| TipoEspacioExterior | Sí | Sí | No | No | No | Sí | No | No | No | No | No | Parcial | `src/modulos/infraestructura-fisica/infraestructura/persistencia/typeorm/entidades/tipo-espacio-exterior.typeorm-entidad.ts` |
| TipoComponenteInfraestructura | Sí | Sí | No | No | No | Sí | No | No | No | No | No | Parcial | `src/modulos/infraestructura-fisica/infraestructura/persistencia/typeorm/entidades/tipo-componente-infraestructura.typeorm-entidad.ts` |
| UnidadMedida | Sí | Sí | No | No | No | Sí | No | No | No | No | No | Parcial | `src/modulos/infraestructura-fisica/infraestructura/persistencia/typeorm/entidades/unidad-medida.typeorm-entidad.ts` |
| ElementoInfraestructura | Sí | Sí | Sí | Sí | Sí | Sí | Sí | Sí | Sí | No | No | Parcial | `src/modulos/infraestructura-fisica/infraestructura/persistencia/typeorm/entidades/elemento-infraestructura.typeorm-entidad.ts` |
| Predio | Sí | Sí | Sí | Sí | Sí | No | Sí | Sí | No | No | No | Parcial | `src/modulos/infraestructura-fisica/infraestructura/persistencia/typeorm/entidades/predio.typeorm-entidad.ts` |
| Edificacion | Sí | Sí | Sí | Sí | Sí | No | Sí | Sí | No | No | No | Parcial | `src/modulos/infraestructura-fisica/infraestructura/persistencia/typeorm/entidades/edificacion.typeorm-entidad.ts` |
| Nivel | Sí | Sí | Sí | Sí | Sí | No | Sí | Sí | No | No | No | Parcial | `src/modulos/infraestructura-fisica/infraestructura/persistencia/typeorm/entidades/nivel.typeorm-entidad.ts` |
| EspacioFisico | Sí | Sí | Sí | Sí | Sí | No | Sí | Sí | No | No | No | Parcial | `src/modulos/infraestructura-fisica/infraestructura/persistencia/typeorm/entidades/espacio-fisico.typeorm-entidad.ts` |
| EspacioExterior | Sí | Sí | Sí | Sí | Sí | No | Sí | Sí | No | No | No | Parcial | `src/modulos/infraestructura-fisica/infraestructura/persistencia/typeorm/entidades/espacio-exterior.typeorm-entidad.ts` |
| ComponenteInfraestructura | Sí | Sí | Sí | Sí | Sí | No | Sí | Sí | No | No | No | Parcial | `src/modulos/infraestructura-fisica/infraestructura/persistencia/typeorm/entidades/componente-infraestructura.typeorm-entidad.ts` |
| EvaluacionConservacionElemento | Sí | Sí | No | No | No | No | No | No | No | No | No | No iniciado | `src/modulos/infraestructura-fisica/infraestructura/persistencia/typeorm/entidades/evaluacion-conservacion-elemento.typeorm-entidad.ts` |

## Observaciones

- El código ya registra 28 entidades; la documentación principal todavía no refleja esa cantidad.
- La matriz base confirma que el siguiente bloque debe centrarse en puertos, tokens e inversión de dependencias.

