# Matriz de cobertura de módulos — REL-004.1

Fecha: 2026-06-20  
Rama: release/rel-004-1-estabilizacion

## Resumen de semillas

| Tabla                            | Registros | Mecanismo                      |
| -------------------------------- | --------- | ------------------------------ |
| estados_conservacion             | 6         | ON CONFLICT (codigo) DO UPDATE |
| tipos_componente_infraestructura | 17        | ON CONFLICT (codigo) DO UPDATE |
| unidades_medida                  | 6         | ON CONFLICT (codigo) DO UPDATE |
| tipos_espacio_fisico             | 12        | ON CONFLICT (codigo) DO UPDATE |
| tipos_documento_identidad        | 6         | ON CONFLICT (codigo) DO UPDATE |
| permisos                         | 22        | ON CONFLICT (codigo) DO UPDATE |
| roles                            | 3         | ON CONFLICT (codigo) DO UPDATE |
| roles_permisos                   | 32        | ON CONFLICT DO NOTHING         |

## Cobertura de pruebas unitarias

| Suite                      | Tests  | Descripción                                                                      |
| -------------------------- | ------ | -------------------------------------------------------------------------------- |
| semillas.spec.ts           | 12     | Integridad de datos de catálogos, documentos, permisos y roles                   |
| personas.spec.ts           | 12     | Casos de uso de personas: creación, documentos, contactos, direcciones, vínculos |
| integraciones.spec.ts      | 11     | Validaciones de DNI/RUC, coordenadas, y proveedores no-disponibles               |
| salud-controlador.spec.ts  | —      | Endpoint de salud                                                                |
| app-module.spec.ts         | —      | Bootstrap del módulo raíz                                                        |
| variables-entorno.spec.ts  | —      | Validación de variables de entorno                                               |
| registro-entidades.spec.ts | —      | Registro de entidades TypeORM                                                    |
| dominio-imports.spec.ts    | —      | Aislamiento de dominio (sin imports de infra)                                    |
| **Total**                  | **47** |                                                                                  |

## Estado de endpoints por módulo

### MOD-001: Identidad y Acceso

| Endpoint                             | Método | Auth    | Permisos |
| ------------------------------------ | ------ | ------- | -------- |
| /api/v1/autenticacion/inicio-sesion  | POST   | Público | —        |
| /api/v1/autenticacion/renovar-sesion | POST   | Público | —        |
| /api/v1/autenticacion/cerrar-sesion  | DELETE | JWT     | —        |

### MOD-003: Estructura Institucional

| Endpoint                  | Método   | Auth | Permisos                         |
| ------------------------- | -------- | ---- | -------------------------------- |
| /api/v1/instituciones     | GET/POST | JWT  | INSTITUCIONES.LEER / .CREAR      |
| /api/v1/instituciones/:id | GET/PUT  | JWT  | INSTITUCIONES.LEER / .ACTUALIZAR |
| /api/v1/sedes             | GET/POST | JWT  | SEDES.LEER / .CREAR              |

### MOD-004: Personas

| Endpoint                               | Método     | Auth | Permisos                       |
| -------------------------------------- | ---------- | ---- | ------------------------------ |
| /api/v1/personas                       | GET        | JWT  | PERSONAS.LEER                  |
| /api/v1/personas                       | POST       | JWT  | PERSONAS.CREAR                 |
| /api/v1/personas/:id                   | GET        | JWT  | PERSONAS.LEER                  |
| /api/v1/personas/:id/documentos        | POST       | JWT  | PERSONAS.GESTIONAR_DOCUMENTOS  |
| /api/v1/personas/:id/contactos         | POST       | JWT  | PERSONAS.GESTIONAR_CONTACTOS   |
| /api/v1/personas/:id/direcciones       | POST       | JWT  | PERSONAS.GESTIONAR_DIRECCIONES |
| /api/v1/personas/:id/vinculo-membresia | PUT/DELETE | JWT  | PERSONAS.VINCULAR_USUARIO      |
| /api/v1/personas/consultas/dni         | POST       | JWT  | PERSONAS.CONSULTAR_DNI         |

### MOD-INT: Integraciones Externas

| Endpoint                                       | Método | Auth | Permisos                    |
| ---------------------------------------------- | ------ | ---- | --------------------------- |
| /api/v1/integraciones/documentos/consultas/ruc | POST   | JWT  | INSTITUCIONES.CONSULTAR_RUC |
| /api/v1/geografia/rutas/calcular               | POST   | JWT  | GEOGRAFIA.CALCULAR_RUTA     |

## Integraciones externas

| Integración                 | Estado por defecto | Variable de control                     |
| --------------------------- | ------------------ | --------------------------------------- |
| APIsPeru DNI                | Deshabilitada      | INTEGRACION_DOCUMENTOS_HABILITADA=false |
| APIsPeru RUC                | Deshabilitada      | INTEGRACION_DOCUMENTOS_HABILITADA=false |
| Google Maps Distance Matrix | Deshabilitada      | INTEGRACION_RUTAS_HABILITADA=false      |

## Restricciones de seguridad aplicadas

- `synchronize: false` — solo migraciones explícitas
- Tenant siempre desde JWT, nunca del body
- Todos los endpoints privados por defecto (APP_GUARD)
- Soft delete en todas las entidades de negocio
- Permisos consultados desde `roles_permisos` en BD (no hardcoded en código)
- Token tipo PRECONTEXTO/ACCESO con rotación de familia de refresh
- No se registran datos personales (DNI, RUC, claves) en logs
