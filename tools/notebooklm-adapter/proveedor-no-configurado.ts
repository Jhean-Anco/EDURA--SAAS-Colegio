/**
 * Proveedor stub para cuando NotebookLM no está configurado.
 * Retorna estado claro sin lanzar errores opacos.
 */
import type {
  ProveedorInvestigacionDocumental,
  EstadoProveedor,
  Cuaderno,
  CrearCuaderno,
  SincronizarFuentes,
  ResultadoSincronizacion,
  ConsultaDocumental,
  RespuestaDocumental,
  CitaDocumental,
} from './interfaz.js';

const MENSAJE = 'NotebookLM no configurado. Ver docs/ai/guias/notebooklm.md para instrucciones de autenticación.';

export class ProveedorNoConfigurado implements ProveedorInvestigacionDocumental {
  async verificarDisponibilidad(): Promise<EstadoProveedor> {
    return { disponible: false, proveedor: 'no-configurado', mensaje: MENSAJE };
  }

  async listarCuadernos(): Promise<Cuaderno[]> {
    console.warn(MENSAJE);
    return [];
  }

  async crearCuaderno(_entrada: CrearCuaderno): Promise<Cuaderno> {
    throw new Error(MENSAJE);
  }

  async sincronizarFuentes(_entrada: SincronizarFuentes): Promise<ResultadoSincronizacion> {
    console.warn(MENSAJE);
    return { cuadernoId: '', fuentesAgregadas: 0, fuentesActualizadas: 0, fuentesOmitidas: 0, errores: [MENSAJE] };
  }

  async consultar(_entrada: ConsultaDocumental): Promise<RespuestaDocumental> {
    throw new Error(MENSAJE);
  }

  async obtenerCitas(_respuestaId: string): Promise<CitaDocumental[]> {
    return [];
  }
}
