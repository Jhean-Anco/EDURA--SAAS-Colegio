# Arquitectura backend

- Monolito modular con módulos de frontera clara.
- Capas: presentación, aplicación, dominio e infraestructura.
- Dependencias: `presentacion -> aplicacion -> dominio`.
- Infraestructura implementa puertos y acceso a datos.
- No implementado en esta fase: auth, usuarios, roles, matrícula, estudiantes, docentes, pagos y mensajería.
