---
id: crear-recurso-nestjs
version: "1.0.0"
descripcion: "Genera módulo, servicio, controlador, DTOs y entidad en NestJS siguiendo convenciones EDURA"
categoria: backend
plataformas: [claude-code, codex, antigravity]
activar_cuando:
  - nuevo módulo de dominio en el backend
  - nuevo caso de uso que requiere endpoint
  - nueva entidad con CRUD completo
no_activar_cuando:
  - solo agregar un campo a un DTO existente
  - solo agregar un método a un servicio existente
herramientas_permitidas: [lectura, escritura_modulos_back, busqueda_dirigida]
presupuesto: normal
---

## Pasos

1. Leer un módulo existente similar como referencia (solo `.module.ts` + un caso de uso).
2. Crear estructura en `back/src/modulos/<nombre>/`:
   - `dominio/entidades/<Nombre>.ts` — entidad TypeORM
   - `dominio/repositorios/I<Nombre>Repositorio.ts` — interfaz repositorio
   - `aplicacion/dtos/crear-<nombre>.dto.ts` — DTO de creación
   - `aplicacion/dtos/<nombre>.response.dto.ts` — DTO de respuesta
   - `aplicacion/casos-de-uso/crear-<nombre>.caso.ts` — caso de uso
   - `infraestructura/repositorios/<Nombre>TypeOrmRepositorio.ts`
   - `presentacion/controladores/<nombre>.controlador.ts`
   - `<nombre>.module.ts`
3. Registrar el módulo en `back/src/app.module.ts`.
4. Activar Skill `crear-migracion-typeorm` si la entidad es nueva.
5. Activar Skill `revisar-multitenencia` si la entidad tiene datos institucionales.
6. Activar Skill `revisar-autorizacion` para los endpoints creados.

## Límites

- No crear módulos de dominio no declarados en la tarea.
- No modificar módulos de otros dominios salvo registro en `app.module.ts`.

## Salida

Lista de archivos creados y registro en `app.module.ts`.
