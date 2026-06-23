/**
 * Interfaz intercambiable para proveedores de investigación documental.
 * Implementar con NotebookLM Enterprise (Proveedor A) o MCP comunitario (Proveedor B).
 */

export interface EstadoProveedor {
  disponible: boolean;
  proveedor: 'notebooklm-enterprise' | 'notebooklm-mcp-comunidad' | 'no-configurado';
  mensaje?: string;
}

export interface Cuaderno {
  id: string;
  nombre: string;
  descripcion: string;
  propietario: string;
  fuentes: number;
  ultimaSincronizacion?: string;
}

export interface CrearCuaderno {
  nombre: string;
  descripcion: string;
  propietario: string;
  fuentesIniciales?: string[];
}

export interface SincronizarFuentes {
  cuadernoId: string;
  rutasDocumentos: string[];
  manifiestoPath?: string;
}

export interface ResultadoSincronizacion {
  cuadernoId: string;
  fuentesAgregadas: number;
  fuentesActualizadas: number;
  fuentesOmitidas: number;
  errores: string[];
}

export interface ConsultaDocumental {
  cuadernoId: string;
  plantilla: string;
  parametros?: Record<string, string>;
  limitePalabras?: number;
}

export interface CitaDocumental {
  fuente: string;
  fragmento: string;
  paginaOSeccion?: string;
}

export interface RespuestaDocumental {
  id: string;
  cuadernoId: string;
  consulta: string;
  respuesta: string;
  citas: CitaDocumental[];
  fuentesConsultadas: string[];
  contradicciones: string[];
  incertidumbres: string[];
  elementosNoEncontrados: string[];
  fecha: string;
}

export interface ProveedorInvestigacionDocumental {
  verificarDisponibilidad(): Promise<EstadoProveedor>;
  listarCuadernos(): Promise<Cuaderno[]>;
  crearCuaderno(entrada: CrearCuaderno): Promise<Cuaderno>;
  sincronizarFuentes(entrada: SincronizarFuentes): Promise<ResultadoSincronizacion>;
  consultar(entrada: ConsultaDocumental): Promise<RespuestaDocumental>;
  obtenerCitas(respuestaId: string): Promise<CitaDocumental[]>;
}
