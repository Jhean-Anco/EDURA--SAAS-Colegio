# Diccionario de datos

## Estructura institucional

| Tabla | Propósito | Regla principal |
|---|---|---|
| instituciones_educativas | Institución educativa | Código único, estado controlado |
| sedes | Sede institucional | Código único por institución, principal activa única |
| ubigeos | Ubicación jerárquica | Código único, autorrelación restrictiva |
| direcciones_sede | Dirección física de la sede | Una por sede, ubigeo opcional |
| identidades_sede | Branding institucional por sede | Una por sede, slug global único |
| recursos_identidad_sede | Recursos visuales de identidad | Un recurso activo por identidad/tipo |
| canales_contacto_sede | Medios de contacto | Duplicados activos controlados |
| horarios_atencion_sede | Horarios de atención | Intervalos por día sin duplicidad |
| paginas_sede | Páginas públicas de sede | Slug único por sede, inicio único publicado |
| secciones_pagina_sede | Secciones tipadas de página | Orden único por página |
| tipos_servicio_basico | Catálogo de servicios | Código único |
| servicios_basicos_sede | Servicios por sede | Fechas coherentes, estado controlado |

## Infraestructura física

| Tabla | Propósito | Regla principal |
|---|---|---|
| tipos_elemento_infraestructura | Catálogo base de tipos | Código único |
| estados_conservacion | Catálogo de conservación | Orden no negativo |
| tipos_tenencia_predio | Catálogo de tenencia | Código único |
| tipos_edificacion | Catálogo de edificación | Código único |
| tipos_espacio_fisico | Catálogo de espacios físicos | Requiere aforo explícito |
| tipos_espacio_exterior | Catálogo de exteriores | Código único |
| tipos_componente_infraestructura | Catálogo de componentes | Categoría controlada |
| unidades_medida | Catálogo de unidades | Magnitud obligatoria |
| elementos_infraestructura | Supertipo físico común | Código único por sede y jerarquía restrictiva |
| predios | Especialización predio | Sin padre, área no negativa |
| edificaciones | Especialización edificación | Padre predio, áreas y niveles no negativos |
| niveles | Especialización nivel | Padre edificación, área no negativa |
| espacios_fisicos | Especialización espacio físico | Padre nivel, área y aforo no negativos |
| espacios_exteriores | Especialización espacio exterior | Padre predio, área no negativa |
| componentes_infraestructura | Especialización componente | Cantidad positiva, vida útil no negativa |
## Base SaaS documentada

| Tabla | Propósito | Regla principal |
|---|---|---|
| planes_saas | Plan comercial | Codigo unico e inmutable |
| versiones_plan_saas | Version de plan | Publicada inmutable |
| caracteristicas_saas | Catalogo de capacidades | Codigo unico, activo controlado |
| versiones_plan_caracteristicas | Capacidades por version | Clave compuesta |
| suscripciones_institucion | Suscripcion institucional | Una actual por institucion |
| eventos_suscripcion | Historial de cambios | Inmutable |
| excepciones_capacidad_institucion | Excepcion puntual | Vigencia temporal |
| procesos_alta_institucion | Alta reanudable | Idempotencia por clave |
| pasos_alta_institucion | Paso del alta | Estado por paso |
| obligaciones_pago | Cobranza operativa | Estado controlado |
| pagos_suscripcion | Pagos registrados | Estado controlado |
| aplicaciones_pago | Aplicacion de pago | Relacion pago-obligacion |
