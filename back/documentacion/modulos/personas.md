# MOD-004 Personas

## Objetivo

Registrar personas por institución educativa con datos básicos, documentos, medios de contacto, direcciones y vínculo opcional con membresías.

## Alcance

- Crear y consultar personas.
- Registrar documentos de identidad.
- Registrar medios de contacto.
- Registrar direcciones.
- Vincular persona con membresía institucional.
- Mantener aislamiento por institución.

## Fuera de alcance

- Estudiantes.
- Docentes.
- Trabajadores.
- Responsables familiares.
- Matrícula.
- Procesos académicos.

## Entidades

- Persona
- TipoDocumentoIdentidad
- DocumentoIdentidadPersona
- MedioContactoPersona
- DireccionPersona

## Reglas

- Cada persona pertenece a una institución educativa.
- No se comparte una tabla global de personas.
- El vínculo con usuario se realiza por membresía.
- La baja lógica es terminal.

## Casos de uso

- CrearPersonaCasoUso
- ObtenerPersonaConsulta
- ListarPersonasConsulta
- VincularPersonaMembresiaCasoUso

## Endpoints

- `POST /api/v1/personas`
- `GET /api/v1/personas`
- `GET /api/v1/personas/:idPersona`

## Permisos

- `PERSONAS.CREAR`
- `PERSONAS.LEER`

## Seguridad

- JWT obligatorio.
- Contexto institucional obligatorio.
- Aislamiento por institución.

## Datos personales

Se almacenan solo los datos necesarios para operación institucional. No se registra información sensible fuera del alcance funcional.

## Pruebas

- Unitarias de dominio y aplicación.
- Registro de entidades TypeORM.
- E2E básica del módulo.

## Riesgos

- El módulo aún no cubre todo el ciclo de documentos/contactos/direcciones con reglas completas.
- El control fino por permisos debe ampliarse en siguientes incrementos.

## Evolución futura

El diseño deja espacio para incorporar estudiantes, docentes, trabajadores y familias referenciando a Persona sin romper el aislamiento institucional.
