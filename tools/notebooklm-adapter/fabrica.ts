/**
 * Fábrica del proveedor de investigación documental.
 * Selecciona automáticamente entre Enterprise, MCP comunitario o stub.
 */
import type { ProveedorInvestigacionDocumental } from './interfaz.js';
import { ProveedorNoConfigurado } from './proveedor-no-configurado.js';

export type TipoProveedor = 'enterprise' | 'mcp-comunidad' | 'no-configurado';

export function crearProveedor(): ProveedorInvestigacionDocumental {
  const tieneEnterprise = Boolean(
    process.env.NOTEBOOKLM_ENTERPRISE_KEY &&
    process.env.NOTEBOOKLM_PROJECT_ID
  );

  const tieneMcp = Boolean(
    process.env.NOTEBOOKLM_MCP_TOKEN &&
    process.env.NOTEBOOKLM_MCP_URL
  );

  if (tieneEnterprise) {
    // Proveedor A: NotebookLM Enterprise
    // Implementar cuando estén disponibles las APIs oficiales
    console.info('NotebookLM Enterprise detectado — implementación pendiente de API oficial');
    return new ProveedorNoConfigurado();
  }

  if (tieneMcp) {
    // Proveedor B: MCP comunitario
    // Implementar cuando el servidor esté auditado y aprobado
    console.info('NotebookLM MCP detectado — pendiente de auditoría del servidor');
    return new ProveedorNoConfigurado();
  }

  return new ProveedorNoConfigurado();
}

export function detectarTipoProveedor(): TipoProveedor {
  if (process.env.NOTEBOOKLM_ENTERPRISE_KEY) return 'enterprise';
  if (process.env.NOTEBOOKLM_MCP_TOKEN) return 'mcp-comunidad';
  return 'no-configurado';
}
