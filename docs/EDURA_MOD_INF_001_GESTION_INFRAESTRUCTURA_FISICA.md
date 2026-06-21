# EDURA — MOD-INF-001 Gestión de Infraestructura Física

Estado: propuesto para incremento funcional
Fecha: 2026-06-20
Rama: incremento-modulo-infraestructura

## 1. Diagnóstico del repositorio

Repositorio validado: Jhean-Anco/EDURA--SAAS-Colegio.

Evidencia recuperada por conector:
- Repositorio público.
- Rama principal declarada: main.
- Permisos disponibles: admin, maintain, pull, push y triage.
- No se pudo recuperar árbol de archivos, README.md ni package.json mediante las herramientas disponibles.
- La búsqueda de código no devolvió resultados para package.json, vite, next, prisma, src ni app.

Conclusión técnica: este incremento se documenta como especificación trazable sin modificar código de aplicación, porque no existe evidencia suficiente del stack, estructura o módulos implementados.

## 2. Relación con la visión EDURA

EDURA busca convertirse en un sistema SaaS integral para instituciones educativas. La unidad cliente confirmada es la Institución Educativa; dentro de ella se gestionan Sedes y cada sede administra su infraestructura interna.

Este módulo consolida la parte física del colegio y sirve como base para mantenimiento, auditoría, inventario, seguridad operacional y reportes de gestión.

Jerarquía funcional confirmada:

Institución Educativa
└── Sede
    ├── Dirección
    ├── Servicios básicos
    └── Infraestructura física
        ├── Predios
        ├── Edificaciones
        ├── Niveles
        ├── Espacios físicos
        ├── Espacios exteriores
        └── Componentes de infraestructura

## 3. Alcance del incremento

Incluido:
- Registro de predios.
- Registro de edificaciones.
- Registro de niveles o pisos.
- Registro de espacios físicos internos.
- Registro de espacios exteriores.
- Registro de componentes de infraestructura.
- Estado de conservación.
- Capacidad, uso y restricciones de espacios.
- Evidencias documentales o fotográficas como concepto funcional.
- Auditoría de cambios como requisito transversal.

Excluido por ahora:
- Compras y logística.
- Mantenimiento avanzado con órdenes de trabajo.
- Inventario patrimonial contable.
- Integración IoT.
- Costeo de obras.
- Gestión de contratos de proveedores.

## 4. Actores relacionados

STK-001 Dueño SaaS: configura límites del plan, auditoría y parámetros globales.
STK-002 Director: administra la infraestructura de toda la institución.
STK-003 Coordinador de sede: administra infraestructura de su sede asignada.
STK-004 Personal administrativo: registra información operativa autorizada.
STK-005 Docente: consulta espacios asignados o disponibles según permisos.
STK-006 Padre de familia: no administra infraestructura; puede ver información pública si la institución decide publicarla.
STK-007 Estudiante: no administra infraestructura; puede consultar espacios relevantes en flujos académicos futuros.

## 5. Módulos y submódulos

MOD-INF-001 Gestión de Infraestructura Física
- MOD-INF-001.01 Predios
- MOD-INF-001.02 Edificaciones
- MOD-INF-001.03 Niveles
- MOD-INF-001.04 Espacios físicos
- MOD-INF-001.05 Espacios exteriores
- MOD-INF-001.06 Componentes de infraestructura
- MOD-INF-001.07 Estado de conservación
- MOD-INF-001.08 Evidencias
- MOD-INF-001.09 Auditoría del módulo

## 6. Requerimientos funcionales

RF-INF-001: El sistema debe permitir registrar predios asociados a una sede.
RF-INF-002: El sistema debe permitir editar datos de un predio manteniendo historial de auditoría.
RF-INF-003: El sistema debe permitir inactivar un predio sin eliminarlo físicamente.
RF-INF-004: El sistema debe permitir registrar edificaciones dentro de un predio.
RF-INF-005: El sistema debe permitir registrar niveles o pisos dentro de una edificación.
RF-INF-006: El sistema debe permitir registrar espacios físicos internos dentro de un nivel.
RF-INF-007: El sistema debe permitir clasificar espacios por tipo: aula, laboratorio, oficina, almacén, biblioteca, tópico, auditorio, baño, comedor u otro.
RF-INF-008: El sistema debe permitir registrar espacios exteriores asociados a una sede o predio.
RF-INF-009: El sistema debe permitir registrar componentes de infraestructura asociados a predios, edificaciones, niveles o espacios.
RF-INF-010: El sistema debe permitir registrar capacidad máxima de un espacio.
RF-INF-011: El sistema debe permitir registrar área aproximada de predios, edificaciones y espacios.
RF-INF-012: El sistema debe permitir registrar estado de conservación: operativo, requiere atención, crítico, fuera de uso.
RF-INF-013: El sistema debe permitir registrar restricciones de uso por seguridad, mantenimiento o disponibilidad.
RF-INF-014: El sistema debe permitir consultar infraestructura por sede.
RF-INF-015: El sistema debe permitir consultar la jerarquía completa de infraestructura.
RF-INF-016: El sistema debe permitir filtrar espacios por tipo, estado, capacidad y sede.
RF-INF-017: El sistema debe impedir eliminar entidades que tengan dependencias activas.
RF-INF-018: El sistema debe registrar usuario, fecha y acción en cada cambio relevante.
RF-INF-019: El sistema debe preparar el modelo para adjuntar evidencias fotográficas o documentales.
RF-INF-020: El sistema debe exponer datos del módulo solo según permisos del actor.

## 7. Reglas de negocio

RN-INF-001: Todo predio debe pertenecer a una sede.
RN-INF-002: Toda edificación debe pertenecer a un predio.
RN-INF-003: Todo nivel debe pertenecer a una edificación.
RN-INF-004: Todo espacio físico interno debe pertenecer a un nivel.
RN-INF-005: Un espacio exterior puede pertenecer directamente a una sede o a un predio.
RN-INF-006: La capacidad máxima de un espacio no puede ser negativa.
RN-INF-007: Un elemento fuera de uso no debe aparecer como disponible para reservas académicas futuras.
RN-INF-008: No se permite eliminación física de registros maestros; se usa inactivación lógica.
RN-INF-009: Los nombres de espacios deben ser únicos dentro de su contenedor inmediato.
RN-INF-010: Cada cambio debe dejar trazabilidad mínima: actor, fecha, acción y entidad afectada.

## 8. Modelo de datos conceptual en 3FN

ENT-INF-001 InstitucionEducativa
- id
- nombre
- estado

ENT-INF-002 Sede
- id
- institucion_educativa_id
- nombre
- codigo
- direccion
- estado

ENT-INF-003 Predio
- id
- sede_id
- nombre
- codigo
- area_m2
- descripcion
- estado_conservacion
- activo

ENT-INF-004 Edificacion
- id
- predio_id
- nombre
- codigo
- numero_niveles
- area_m2
- estado_conservacion
- activo

ENT-INF-005 Nivel
- id
- edificacion_id
- nombre
- numero_orden
- descripcion
- activo

ENT-INF-006 EspacioFisico
- id
- nivel_id
- nombre
- codigo
- tipo_espacio_id
- capacidad_maxima
- area_m2
- estado_conservacion
- restriccion_uso
- activo

ENT-INF-007 EspacioExterior
- id
- sede_id
- predio_id nullable
- nombre
- codigo
- tipo_espacio_exterior_id
- area_m2
- estado_conservacion
- restriccion_uso
- activo

ENT-INF-008 ComponenteInfraestructura
- id
- tipo_componente_id
- predio_id nullable
- edificacion_id nullable
- nivel_id nullable
- espacio_fisico_id nullable
- espacio_exterior_id nullable
- nombre
- codigo
- estado_conservacion
- activo

ENT-INF-009 TipoEspacio
- id
- nombre
- descripcion
- activo

ENT-INF-010 TipoComponente
- id
- nombre
- descripcion
- activo

ENT-INF-011 EvidenciaInfraestructura
- id
- entidad_tipo
- entidad_id
- tipo_evidencia
- url_archivo
- descripcion
- creado_por
- creado_en

ENT-INF-012 AuditoriaInfraestructura
- id
- entidad_tipo
- entidad_id
- accion
- usuario_id
- fecha_hora
- valores_anteriores
- valores_nuevos

## 9. APIs sugeridas

API-INF-001 GET /api/infraestructura/sedes/{sedeId}/arbol
API-INF-002 GET /api/infraestructura/predios
API-INF-003 POST /api/infraestructura/predios
API-INF-004 PATCH /api/infraestructura/predios/{id}
API-INF-005 DELETE /api/infraestructura/predios/{id} como inactivación lógica
API-INF-006 GET /api/infraestructura/edificaciones
API-INF-007 POST /api/infraestructura/edificaciones
API-INF-008 PATCH /api/infraestructura/edificaciones/{id}
API-INF-009 GET /api/infraestructura/espacios-fisicos
API-INF-010 POST /api/infraestructura/espacios-fisicos
API-INF-011 PATCH /api/infraestructura/espacios-fisicos/{id}
API-INF-012 GET /api/infraestructura/componentes
API-INF-013 POST /api/infraestructura/componentes
API-INF-014 GET /api/infraestructura/catalogos

## 10. Pantallas requeridas

UI-INF-001 Vista árbol de infraestructura por sede.
UI-INF-002 Listado de predios.
UI-INF-003 Formulario de predio.
UI-INF-004 Listado de edificaciones.
UI-INF-005 Formulario de edificación.
UI-INF-006 Gestión de niveles.
UI-INF-007 Listado de espacios físicos.
UI-INF-008 Formulario de espacio físico.
UI-INF-009 Listado de espacios exteriores.
UI-INF-010 Gestión de componentes de infraestructura.
UI-INF-011 Ficha de infraestructura con estado y evidencias.
UI-INF-012 Panel resumen de infraestructura por sede.

## 11. Historias de usuario

HU-INF-001 Como director, quiero registrar predios de cada sede para mantener una base ordenada de la infraestructura institucional.
Criterios de aceptación:
- Dado que tengo permiso de administración, cuando creo un predio con sede, nombre y estado, entonces el sistema lo registra activo.
- Dado que falta la sede, cuando intento guardar, entonces el sistema muestra error obligatorio.

HU-INF-002 Como coordinador de sede, quiero registrar edificaciones dentro de un predio para representar la estructura real de mi sede.
Criterios de aceptación:
- La edificación queda asociada a un único predio.
- El sistema impide duplicar código dentro del mismo predio.

HU-INF-003 Como personal administrativo, quiero registrar aulas, oficinas y laboratorios para que la institución conozca sus espacios disponibles.
Criterios de aceptación:
- El espacio debe tener tipo, nivel, nombre y estado.
- La capacidad máxima debe ser cero o mayor.

HU-INF-004 Como director, quiero ver un árbol de infraestructura por sede para detectar rápidamente cómo está organizada.
Criterios de aceptación:
- El árbol muestra predios, edificaciones, niveles, espacios y componentes.
- Los elementos inactivos se diferencian visualmente o se filtran.

HU-INF-005 Como administrador SaaS, quiero que cada institución vea solo su infraestructura para mantener aislamiento entre clientes.
Criterios de aceptación:
- Una institución no puede consultar infraestructura de otra institución.
- Toda consulta aplica filtro por tenant o institución activa.

## 12. Permisos RBAC

PERM-INF-001 infraestructura.ver
PERM-INF-002 infraestructura.crear
PERM-INF-003 infraestructura.editar
PERM-INF-004 infraestructura.inactivar
PERM-INF-005 infraestructura.ver_auditoria
PERM-INF-006 infraestructura.gestionar_catalogos

Asignación inicial:
- Dueño SaaS: ver auditoría global limitada, configurar catálogo global si aplica.
- Director: todos los permisos dentro de su institución.
- Coordinador de sede: ver, crear y editar dentro de su sede.
- Personal administrativo: crear y editar según delegación.
- Docente: consulta limitada.
- Padre de familia y estudiante: sin permisos administrativos.

## 13. Pruebas mínimas

CP-INF-001 Crear predio válido.
CP-INF-002 Rechazar predio sin sede.
CP-INF-003 Crear edificación dentro de predio.
CP-INF-004 Rechazar duplicado de código por contenedor.
CP-INF-005 Crear nivel dentro de edificación.
CP-INF-006 Crear espacio físico con capacidad válida.
CP-INF-007 Rechazar capacidad negativa.
CP-INF-008 Inactivar espacio con dependencias sin eliminación física.
CP-INF-009 Consultar árbol completo por sede.
CP-INF-010 Validar aislamiento por institución.
CP-INF-011 Registrar auditoría en creación, edición e inactivación.

## 14. Riesgos

RSK-INF-001 Falta de evidencia del stack actual impide implementación directa.
Impacto: alto.
Mitigación: inspeccionar árbol real antes de codificar.

RSK-INF-002 Mezclar infraestructura física con inventario patrimonial puede sobrecargar el módulo.
Impacto: medio.
Mitigación: mantener inventario contable fuera del alcance inicial.

RSK-INF-003 Falta de tenant explícito puede romper aislamiento SaaS.
Impacto: alto.
Mitigación: toda entidad debe quedar vinculada directa o indirectamente a Institución Educativa.

## 15. Prompt para Codex o Claude

Implementar MOD-INF-001 Gestión de Infraestructura Física en EDURA respetando la arquitectura existente del repositorio. Antes de modificar código, inspecciona el stack, estructura de carpetas, ORM, sistema de rutas, autenticación, RBAC y convenciones. No crees una arquitectura paralela.

Objetivo: agregar la gestión jerárquica Institución Educativa > Sede > Predio > Edificación > Nivel > Espacio Físico, además de Espacios Exteriores y Componentes de Infraestructura.

Debes entregar:
1. Migraciones o modelos de base de datos normalizados.
2. Servicios o casos de uso.
3. Endpoints CRUD con validación.
4. Filtro por institución o tenant.
5. Permisos RBAC.
6. Pantallas o componentes de gestión si el frontend existe.
7. Pruebas unitarias y de integración.
8. Documentación de comandos ejecutados.

Restricciones:
- No eliminar físicamente registros maestros; usar inactivación lógica.
- No mezclar inventario patrimonial ni mantenimiento avanzado en este incremento.
- No asumir nombres en inglés para entidades visibles al usuario.
- Mantener compatibilidad con la estructura actual.
- Si falta autenticación o RBAC, crear una interfaz mínima o dejar adaptadores claros.

Criterios de aceptación:
- Se puede registrar y consultar la jerarquía de infraestructura por sede.
- Se validan relaciones obligatorias.
- Se impide acceso cruzado entre instituciones.
- Se registra auditoría mínima de cambios.
- Las pruebas principales pasan.

## 16. Actualización propuesta del estado maestro

Nuevo módulo: MOD-INF-001 Gestión de Infraestructura Física.
Estado: especificado, pendiente de implementación en código.
Decisión: iniciar por infraestructura física antes de mantenimiento, inventario patrimonial o reservas.
Motivo: es base estructural del colegio y depende solo de Institución Educativa y Sede.
Pendiente crítico: inspeccionar árbol real del repositorio para implementar conforme al stack existente.
