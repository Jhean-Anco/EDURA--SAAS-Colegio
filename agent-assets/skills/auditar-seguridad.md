---
id: auditar-seguridad
version: "1.0.0"
descripcion: "Revisa cambios en busca de vulnerabilidades OWASP, secretos expuestos y problemas de autenticación"
categoria: seguridad
plataformas: [claude-code, codex, antigravity]
activar_cuando:
  - cambio en módulo identidad-acceso
  - nuevo endpoint de autenticación
  - cambio de dependencia de seguridad
  - revisión periódica de seguridad
no_activar_cuando:
  - cambios puramente de UI sin lógica de negocio
herramientas_permitidas: [lectura, busqueda_dirigida, git_diff, ejecucion_npm_audit]
presupuesto: critico
---

## Pasos

1. Revisar diff con Skill `revisar-diff` primero.
2. Verificar OWASP Top 10:
   - A01 Broken Access Control → revisar guards y filtros de institución
   - A02 Cryptographic Failures → verificar que JWT use algoritmo seguro, no MD5/SHA1
   - A03 Injection → buscar queries con concatenación de strings
   - A05 Security Misconfiguration → revisar CORS, headers
   - A07 Authentication Failures → verificar refresh token rotation
3. Ejecutar `npm audit --prefix back` y `npm audit --prefix front`.
4. Verificar que no haya `.env` o secretos en los cambios.
5. Verificar rate limiting en endpoints de auth.
6. Documentar hallazgos en `docs/ai/research/` con esquema estándar.

## Salida

Informe con hallazgos por severidad (crítico / alto / medio / bajo / informativo).
Ruta del informe guardado.
