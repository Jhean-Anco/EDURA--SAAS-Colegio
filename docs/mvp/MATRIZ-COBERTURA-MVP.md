# Matriz de Cobertura — MVP de EDURA

Esta matriz detalla el estado actual de los procesos principales y casos de uso requeridos para el MVP de EDURA, contrastando el backend con el BFF y el frontend.

## Convenciones de Estado
* **COMPLETO**: Contrato, persistencia, validación, seguridad y flujos UI completamente funcionales y probados.
* **PARCIAL**: Parcialmente implementado o pendiente de integración fina.
* **AUSENTE**: Funcionalidad ausente en esa capa.
* **FUERA DEL MVP**: Funcionalidad planificada para futuras etapas.

---

## Matriz de Cobertura

| ID | Dominio | Módulo | Proceso | Caso de Uso / Endpoint | Backend | BFF (Route Handler) | Frontend (Página/Form) | Prioridad | Estado Global | Brecha / Decisión |
|---|---|---|---|---|---|---|---|---|---|---|
| **AUT-01** | Seguridad | `identidad-acceso` | Login | `POST /autenticacion/iniciar-sesion` | COMPLETO | COMPLETO | COMPLETO | Alta | **COMPLETO** | Estable. |
| **AUT-02** | Seguridad | `identidad-acceso` | Selección Contexto | `POST /autenticacion/seleccionar-contexto` | COMPLETO | COMPLETO | COMPLETO | Alta | **COMPLETO** | Estable. |
| **AUT-03** | Seguridad | `identidad-acceso` | Cierre de Sesión | `POST /autenticacion/cerrar-sesion` | COMPLETO | COMPLETO | COMPLETO | Alta | **COMPLETO** | Estable. |
| **AUT-04** | Seguridad | `identidad-acceso` | Control de Permisos | Cargar menús por roles/permisos JWT | COMPLETO | PARCIAL | PARCIAL | Alta | **PARCIAL** | Navegación usa estructura estática; cambiar a carga dinámica basada en JWT decodificado en BFF. |
| **AUT-05** | Seguridad | `identidad-acceso` | Renovación Token | Rotar refresh token / recuperación 401 | COMPLETO | AUSENTE | AUSENTE | Alta | **AUSENTE** | El BFF no reintenta llamadas automáticamente ante expiración de token. |
| **PAN-01** | Panel | `panel-institucional` | Dashboard | `GET /panel-institucional/resumen` | COMPLETO | COMPLETO | COMPLETO | Alta | **COMPLETO** | Datos del dashboard actualizados con datos reales de la BD. |
| **EST-01** | Institucional | `estructura-institucional` | Gestión IE | `GET/PATCH /instituciones/:id` | COMPLETO | AUSENTE | AUSENTE | Alta | **AUSENTE** | Desarrollar BFF y pantalla de perfil de Institución Educativa. |
| **EST-02** | Institucional | `estructura-institucional` | Gestión Sedes | `GET/POST/PATCH /sedes` | COMPLETO | AUSENTE | AUSENTE | Alta | **AUSENTE** | Desarrollar BFF y pantalla de administración de Sedes (Sede principal y adicionales). |
| **INF-01** | Infraestructura | `infraestructura-fisica` | Gestión Espacios | `GET/POST/PATCH /predios`, `/edificaciones`, `/niveles`, `/espacios-fisicos` | COMPLETO | AUSENTE | AUSENTE | Media | **AUSENTE** | Desarrollar BFF y visualización jerárquica de la infraestructura de la sede. |
| **INF-02** | Infraestructura | `infraestructura-fisica` | Servicios Básicos | Gestión de servicios por sede (agua, luz) | COMPLETO | AUSENTE | AUSENTE | Media | **AUSENTE** | BFF y módulo de alta/edición de servicios. |
| **PER-01** | Comunidad | `personas` | Gestión Personas | `GET/POST /personas` | COMPLETO | AUSENTE | AUSENTE | Alta | **AUSENTE** | Crear BFF y pantalla de registro, listado y filtros de personas de la institución. |
| **ALU-01** | Comunidad | `estudiantes` | Gestión Alumnos | `GET/POST/PATCH /estudiantes` | COMPLETO | AUSENTE | AUSENTE | Alta | **AUSENTE** | Crear BFF y vistas para matricular y gestionar estudiantes de la sede. |
| **ALU-02** | Comunidad | `estudiantes` | Apoderados | Vinculación Estudiante-Apoderado | COMPLETO | AUSENTE | AUSENTE | Alta | **AUSENTE** | Crear formulario para vincular apoderados a estudiantes en la creación/edición. |
| **DOC-01** | Comunidad | `docentes` | Gestión Docentes | `GET/POST/PATCH /docentes` | COMPLETO | AUSENTE | AUSENTE | Alta | **AUSENTE** | Desarrollar BFF y pantalla de registro/edición de docentes y especialidades. |
| **ACA-01** | Académica | `estructura-academica` | Calendario Escolar | `GET/POST /anios-academicos`, `/periodos` | COMPLETO | AUSENTE | AUSENTE | Alta | **AUSENTE** | BFF y panel para abrir, configurar y gestionar transiciones de años académicos. |
| **ACA-02** | Académica | `estructura-academica` | Grados y Secciones | `GET/POST /grados`, `/secciones` | COMPLETO | AUSENTE | AUSENTE | Alta | **AUSENTE** | Desarrollar administración de oferta y secciones de la sede. |
| **CUR-01** | Académica | `curriculo` | Planes de Estudio | `/planes-estudio` | COMPLETO | COMPLETO | PARCIAL | Alta | **PARCIAL** | La UI de currículo está implementada parcialmente; requiere completar la aprobación y duplicación de planes. |
| **MAT-01** | Académica | `matriculas` | Registrar Matrícula | `POST /matriculas` | COMPLETO | AUSENTE | AUSENTE | Alta | **AUSENTE** | Flujo transversal principal. Requiere BFF, formulario de matrícula con selección de sección y control de cupos. |
| **INT-01** | Integraciones | `integraciones-externas` | Consulta Reniec/Sunat | `POST /integraciones/dni`, `/integraciones/ruc` | COMPLETO | AUSENTE | AUSENTE | Media | **AUSENTE** | Agregar botón de búsqueda por DNI/RUC en el registro de personas usando el endpoint del backend. |

---

## Brechas Críticas del MVP a Resolver en el Frontend

1. **Aislamiento Multiinstitución en el Frontend**: Se debe asegurar que las peticiones BFF envíen el `idInstitucion` y `idSede` extraídos del JWT en la sesión de Next.js, previniendo inyecciones de tenant desde el cliente.
2. **Navegación dinámica por permisos**: Ocultar y denegar acceso a rutas no autorizadas en base al JWT.
3. **Flujo de Matrícula de Fin a Fin**: La matrícula depende de:
   * Persona existente -> Estudiante -> Oferta Académica y Sección -> Matrícula. Este flujo debe ser operable de extremo a extremo sin datos falsos.
