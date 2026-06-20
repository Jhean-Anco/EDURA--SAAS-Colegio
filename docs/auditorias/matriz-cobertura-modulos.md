# Matriz de cobertura de módulos

| Entidad o agregado | Dominio | Puerto | Caso de uso | Repositorio | Mapeador | Consulta | Controlador | DTO | Prueba unitaria | Prueba integración | Prueba E2E | Estado |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| InstitucionEducativa | Sí | Sí | Sí | Sí | Sí | Sí | Sí | Sí | Parcial | No | No | Parcial |
| Sede | Sí | Sí | Sí | Sí | Sí | Sí | Sí | Sí | Parcial | No | No | Parcial |
| DireccionSede | No | No | No | No | No | No | No | No | No | No | No | No iniciado |
| Ubigeo | No | Sí | No | No | No | Sí | No | No | No | No | No | Parcial |
| IdentidadSede | No | No | No | No | No | No | No | No | No | No | No | No iniciado |
| RecursoIdentidadSede | No | No | No | No | No | No | No | No | No | No | No | No iniciado |
| CanalContactoSede | No | No | No | No | No | No | No | No | No | No | No | No iniciado |
| HorarioAtencionSede | No | No | No | No | No | No | No | No | No | No | No | No iniciado |
| PaginaSede | No | No | No | No | No | No | No | No | No | No | No | No iniciado |
| SeccionPaginaSede | No | No | No | No | No | No | No | No | No | No | No | No iniciado |
| TipoServicioBasico | No | Sí | No | No | No | Sí | No | No | No | No | No | Parcial |
| ServicioBasicoSede | No | Sí | No | No | No | No | No | No | No | No | No | Parcial |
| TipoElementoInfraestructura | No | Sí | No | No | No | Sí | No | No | No | No | No | Parcial |
| EstadoConservacion | No | Sí | No | No | No | Sí | No | No | No | No | No | Parcial |
| TipoTenenciaPredio | No | Sí | No | No | No | Sí | No | No | No | No | No | Parcial |
| TipoEdificacion | No | Sí | No | No | No | Sí | No | No | No | No | No | Parcial |
| TipoEspacioFisico | No | Sí | No | No | No | Sí | No | No | No | No | No | Parcial |
| TipoEspacioExterior | No | Sí | No | No | No | Sí | No | No | No | No | No | Parcial |
| TipoComponenteInfraestructura | No | Sí | No | No | No | Sí | No | No | No | No | No | Parcial |
| UnidadMedida | No | Sí | No | No | No | Sí | No | No | No | No | No | Parcial |
| ElementoInfraestructura | No | Sí | No | No | No | Sí | No | No | No | No | No | Parcial |
| Predio | No | Sí | No | No | No | No | No | No | No | No | No | Parcial |
| Edificacion | No | Sí | No | No | No | No | No | No | No | No | No | Parcial |
| Nivel | No | Sí | No | No | No | No | No | No | No | No | No | Parcial |
| EspacioFisico | No | Sí | No | No | No | No | No | No | No | No | No | Parcial |
| EspacioExterior | No | Sí | No | No | No | No | No | No | No | No | No | Parcial |
| ComponenteInfraestructura | No | Sí | No | No | No | No | No | No | No | No | No | Parcial |
| EvaluacionConservacionElemento | No | No | No | No | No | No | No | No | No | No | No | No iniciado |

## Observaciones

- La cobertura actual se concentra en institución, sede y el registro TypeORM de infraestructura física.
- El módulo de infraestructura física sigue sin casos de uso, controladores y pruebas funcionales completas.
- El historial de conservación todavía no está modelado como agregado o tabla funcional adicional en aplicación/presentación.
