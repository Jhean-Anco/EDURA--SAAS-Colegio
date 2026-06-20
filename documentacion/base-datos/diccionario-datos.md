# Diccionario de datos

## Instituciones, sedes y ubicación

| Tabla                    | Propósito             | Columna                  | Tipo PostgreSQL | Nulo | Default           | PK  | FK                           | UK                                 | CHECK                | Regla                                |
| ------------------------ | --------------------- | ------------------------ | --------------- | ---- | ----------------- | --- | ---------------------------- | ---------------------------------- | -------------------- | ------------------------------------ |
| instituciones_educativas | Institución educativa | id                       | uuid            | no   | gen_random_uuid() | sí  | -                            | -                                  | -                    | Identidad principal                  |
|                          |                       | codigo                   | varchar(30)     | no   | -                 | -   | -                            | sí                                 | -                    | Código único                         |
|                          |                       | nombre_legal             | varchar(200)    | no   | -                 | -   | -                            | -                                  | -                    | Nombre formal                        |
|                          |                       | estado                   | varchar(20)     | no   | -                 | -   | -                            | -                                  | ACTIVA/INACTIVA/BAJA | Ciclo de vida                        |
| sedes                    | Sede institucional    | id                       | uuid            | no   | gen_random_uuid() | sí  | -                            | -                                  | -                    | Identidad principal                  |
|                          |                       | id_institucion_educativa | uuid            | no   | -                 | -   | instituciones_educativas(id) | -                                  | -                    | Sede pertenece a institución         |
|                          |                       | codigo                   | varchar(30)     | no   | -                 | -   | -                            | (id_institucion_educativa, codigo) | -                    | Código por institución               |
|                          |                       | es_principal             | boolean         | no   | false             | -   | -                            | -                                  | índice parcial       | Una principal activa por institución |
| ubigeos                  | Ubicación jerárquica  | id                       | uuid            | no   | gen_random_uuid() | sí  | -                            | -                                  | -                    | Nodo geográfico                      |
|                          |                       | id_ubigeo_padre          | uuid            | sí   | -                 | -   | ubigeos(id)                  | -                                  | padre distinto       | Jerarquía                            |
| direcciones_sede         | Dirección física      | id                       | uuid            | no   | gen_random_uuid() | sí  | -                            | -                                  | -                    | Dirección por sede                   |
|                          |                       | id_sede                  | uuid            | no   | -                 | -   | sedes(id)                    | sí                                 | -                    | Una dirección por sede               |
|                          |                       | id_ubigeo                | uuid            | sí   | -                 | -   | ubigeos(id)                  | -                                  | -90..90 / -180..180  | Georreferencia y ubigeo              |

## Catálogos

| Tabla                            | Propósito                     | Columnas relevantes                                                        | Regla                    |
| -------------------------------- | ----------------------------- | -------------------------------------------------------------------------- | ------------------------ |
| tipos_servicio_basico            | Catálogo de servicios         | codigo, nombre, descripcion, activo                                        | Código único             |
| servicios_basicos_sede           | Servicios por sede            | id_sede, id_tipo_servicio_basico, estado_servicio, fecha_inicio, fecha_fin | Fechas coherentes        |
| tipos_elemento_infraestructura   | Catálogo de especializaciones | codigo, nombre, descripcion, activo                                        | Código único             |
| estados_conservacion             | Catálogo de conservación      | codigo, nombre, orden, activo                                              | Orden >= 0               |
| tipos_tenencia_predio            | Catálogo de tenencia          | codigo, nombre, descripcion, activo                                        | Código único             |
| tipos_edificacion                | Catálogo de edificación       | codigo, nombre, descripcion, activo                                        | Código único             |
| tipos_espacio_fisico             | Catálogo de espacios          | codigo, nombre, descripcion, requiere_aforo                                | Requiere aforo explícito |
| tipos_espacio_exterior           | Catálogo de exteriores        | codigo, nombre, descripcion, activo                                        | Código único             |
| tipos_componente_infraestructura | Catálogo de componentes       | codigo, nombre, categoria, descripcion, activo                             | Categoría normalizada    |
| unidades_medida                  | Catálogo de unidades          | codigo, nombre, simbolo, magnitud, descripcion, activo                     | Magnitud obligatoria     |

## Infraestructura física

| Tabla                       | Propósito                   | Regla clave                                                        |
| --------------------------- | --------------------------- | ------------------------------------------------------------------ |
| elementos_infraestructura   | Supertipo común             | Unicidad por sede/código, padre dentro de la misma sede            |
| predios                     | Especialización de elemento | FK compartida con elemento, área no negativa                       |
| edificaciones               | Especialización de elemento | FK compartida, áreas no negativas, niveles no negativos            |
| niveles                     | Especialización de elemento | FK compartida, área no negativa                                    |
| espacios_fisicos            | Especialización de elemento | FK compartida, área y aforo no negativos                           |
| espacios_exteriores         | Especialización de elemento | FK compartida, área no negativa                                    |
| componentes_infraestructura | Especialización de elemento | Cantidad positiva, vida útil no negativa, serie implica cantidad 1 |
