# Línea Base del Repositorio EDURA

Este documento registra el estado operativo y de compilación inicial del proyecto EDURA al comenzar la misión de cierre del MVP.

## 1. Estado del Entorno
* **Sistema Operativo**: Windows
* **Versión de Node.js**: v24.16.0
* **Base de Datos**: PostgreSQL (Local)

## 2. Pruebas de Calidad Iniciales (Línea Base)

### Backend
* **Pruebas Unitarias**: **PASADO** (18 suites, 216 pruebas pasadas).
* **Pruebas E2E**: **FALLIDO** (Inicialmente falló en `test/docentes-flujo.e2e-spec.ts`).
  * *Tipo de Fallo*: Fallo preexistente.
  * *Detalle*: Colisión por restricción de unicidad en la columna `correo_normalizado` de la tabla `usuarios` al reutilizar nombres estáticos en ejecuciones sucesivas del entorno de pruebas.
  * *Corrección aplicada*: Se modificaron los generadores de prueba en `crearContextoCompleto` y `crearContextoDocente` para inyectar un UUID corto aleatorio en el correo electrónico, asegurando su unicidad en cada ejecución.

### Frontend
* **Compilación y Typecheck**: Pendiente de validar.
* **Pruebas Unitarias (Vitest)**: Pendiente de validar.

## 3. Advertencias del Sistema (Doctor de Agentes)
Al ejecutar `node scripts/ai/doctor.mjs` se detectaron:
1. Presencia de `back/.env` (verificado que no se versionen datos sensibles).
2. Advertencias menores por patrones potencialmente peligrosos en scripts de orquestación interna de agentes (`rm -rf`, `DROP TABLE`, etc.).

## 4. Brechas de Frontend vs Backend Detectadas
El backend NestJS cuenta con soporte para módulos de estructura institucional, infraestructura física, personas, estudiantes, docentes y estructura académica, mientras que el frontend en Next.js solo cuenta con soporte inicial para:
1. Autenticación / inicio de sesión.
2. Un panel básico (shell).
3. Módulo parcial de currículo.

Se requiere desarrollar la capa BFF (Route Handlers) y las vistas para todos los demás módulos.
