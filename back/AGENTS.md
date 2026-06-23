# AGENTS.md — back (NestJS)

Restricciones específicas del backend. Ver también `../../AGENTS.md`.

## Estructura de módulo obligatoria

```
back/src/modulos/<nombre>/
├── aplicacion/
│   ├── casos-de-uso/
│   └── dtos/
├── dominio/
│   ├── entidades/
│   └── repositorios/
├── infraestructura/
│   └── repositorios/
├── presentacion/
│   └── controladores/
└── <nombre>.module.ts
```

## Reglas críticas

1. Toda entidad con datos institucionales: incluir `institucion_id`.
2. Toda consulta: filtrar por `institucion_id` en el repositorio.
3. Todo endpoint protegido: `JwtAuthGuard` + `RolesGuard` cuando aplique.
4. Nunca exponer la entidad directamente: usar DTO de respuesta.
5. Migraciones: solo generar, nunca ejecutar sin aprobación.
6. Al crear módulo nuevo: registrar en `back/src/app.module.ts`.

## Comandos disponibles

```bash
npm --prefix back run lint
npm --prefix back run typecheck
npm --prefix back run test:unit
npm --prefix back run db:migration:generate --name=Nombre
npm --prefix back run db:migration:show
```

## Módulos existentes

curriculo, docentes, estudiantes, matriculas, identidad-acceso,
estructura-academica, estructura-institucional, personas,
panel-institucional, infraestructura-fisica, integraciones-externas

## Compartido

Código compartido entre módulos: `back/src/compartido/`
Base de datos: `back/src/base-datos/typeorm/`
