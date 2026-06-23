# Guía de Credenciales MCP — EDURA

Esta guía explica cómo configurar las variables de entorno requeridas para los servidores MCP de EDURA.
Nunca se deben pegar credenciales en el chat ni en archivos versionados.

## Principios de seguridad

- Usar siempre cuentas con el **alcance mínimo necesario**
- Ninguna credencial va en `.env`, solo en variables de entorno del sistema o en `.env.local` (no versionado)
- Para PostgreSQL: cuenta de **solo lectura**, distinta al usuario de la aplicación
- Para GitHub: **Personal Access Token fino** al repositorio EDURA exclusivamente
- Para Google Cloud: preferir **Application Default Credentials** sobre Service Account

---

## POSTGRES_MCP_URL

**Servidor que la usa:** `postgres-local-readonly` (perfil `database-review`)

### Paso 1 — Crear usuario de solo lectura

```sql
-- Conectar como superusuario (psql -U postgres)
CREATE USER edura_readonly WITH PASSWORD '<clave_segura>';
GRANT CONNECT ON DATABASE edura_dev TO edura_readonly;
GRANT USAGE ON SCHEMA public TO edura_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO edura_readonly;
-- Para tablas futuras:
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO edura_readonly;
```

### Paso 2 — Configurar variable

**PowerShell (sesión actual, para probar):**
```powershell
$env:POSTGRES_MCP_URL = "postgresql://edura_readonly:<clave>@localhost:5432/edura_dev"
```

**PowerShell (permanente para el usuario, sin exponer en terminal):**
```powershell
[System.Environment]::SetEnvironmentVariable(
  "POSTGRES_MCP_URL",
  "postgresql://edura_readonly:<clave>@localhost:5432/edura_dev",
  "User"
)
```

### Paso 3 — Verificar
```powershell
# Reiniciar Claude Code y ejecutar:
node scripts/ai/mcp-manager.mjs test postgres-local-readonly
```

---

## GITHUB_TOKEN

**Servidor que la usa:** `github-plugin-codex` (perfil `pr-review`, solo en Codex)

### Paso 1 — Crear token

1. Ir a: **GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens**
2. Crear token con:
   - **Repository access:** Solo el repositorio EDURA
   - **Permissions mínimos:**
     - Contents: Read-only (para búsqueda de código)
     - Pull requests: Read and Write (para revisar y comentar PRs)
     - Issues: Read and Write (para leer y crear issues)
   - **Expiración:** 90 días (renovar con recordatorio)

### Paso 2 — Configurar variable

```powershell
[System.Environment]::SetEnvironmentVariable("GITHUB_TOKEN", "ghp_...", "User")
```

### Paso 3 — Verificar
```powershell
# Reiniciar Codex y ejecutar:
codex mcp list
# El plugin github debe aparecer como enabled
```

---

## GOOGLE_CLOUD_PROJECT (NotebookLM Enterprise)

**Servidor que la usa:** `notebooklm-enterprise` (perfil `docs-research`)

> **Nota:** Requiere licencia NotebookLM Enterprise activa. El stub en `tools/notebooklm-adapter/` funciona sin credenciales.

### Opción A — Application Default Credentials (recomendada)

```powershell
# Instalar Google Cloud CLI: https://cloud.google.com/sdk/docs/install
gcloud auth application-default login
# No se requiere variable GOOGLE_APPLICATION_CREDENTIALS
```

### Opción B — Service Account

```powershell
# Crear service account en Google Cloud Console con acceso a NotebookLM API
# Descargar el JSON de la key
[System.Environment]::SetEnvironmentVariable(
  "GOOGLE_APPLICATION_CREDENTIALS",
  "C:\ruta\a\service-account.json",
  "User"
)
```

### Variable de proyecto (siempre requerida)

```powershell
[System.Environment]::SetEnvironmentVariable("GOOGLE_CLOUD_PROJECT", "<id-proyecto>", "User")
```

---

## STITCH_API_KEY

**Servidor que la usa:** `stitch` (perfil `frontend-ui`, solo cuando hay tarea de diseño UX)

### Paso 1 — Obtener API key

1. Iniciar sesión en el dashboard de Stitch
2. Navegar a **Settings → API Keys**
3. Crear key con alcance limitado al proyecto EDURA

### Paso 2 — Configurar variable

```powershell
[System.Environment]::SetEnvironmentVariable("STITCH_API_KEY", "<key>", "User")
```

---

## Verificación del entorno completo

```powershell
# Detectar qué está configurado (sin revelar valores):
node scripts/ai/mcp-manager.mjs discover

# Ver plan de acción para lo que falta:
node scripts/ai/mcp-manager.mjs plan

# Estado actual del lockfile:
node scripts/ai/mcp-manager.mjs list
```

---

## Rotación de credenciales

| Credencial         | Frecuencia recomendada | Acción al rotar                            |
|--------------------|------------------------|--------------------------------------------|
| POSTGRES_MCP_URL   | Con cambio de clave    | Actualizar variable de usuario             |
| GITHUB_TOKEN       | 90 días (al expirar)   | Crear nuevo token, actualizar variable     |
| GOOGLE_CLOUD       | Según política ADC     | `gcloud auth application-default login`   |
| STITCH_API_KEY     | Al detectar filtración | Revocar en dashboard, crear nueva key      |

---

## Referencia rápida

```
config/agents/mcp.env.example    → Plantilla de variables (sin valores)
.ai/mcp.registry.yaml            → Registro de servidores y qué vars necesitan
.ai/mcp.lock.yaml                → Estado actual y pasos pendientes por servidor
scripts/ai/mcp-manager.mjs       → Herramienta de gestión (discover, plan, test)
scripts/ai/mcp-setup.mjs         → Wizard de setup asistido
```
