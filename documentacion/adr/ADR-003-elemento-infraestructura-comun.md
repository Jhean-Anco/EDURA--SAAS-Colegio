# ADR-003 Elemento infraestructura común

- Estado: aceptado.
- Contexto: la infraestructura física requiere jerarquía común.
- Decisión: usar `elementos_infraestructura` como raíz polimórfica de persistencia.
- Alternativas: tablas por jerarquía o herencia de TypeORM.
- Consecuencias: jerarquía flexible con especializaciones 1:1.
- Riesgos: reglas de ciclo quedan para dominio/casos de uso.
- Fecha: 2026-06-19.
