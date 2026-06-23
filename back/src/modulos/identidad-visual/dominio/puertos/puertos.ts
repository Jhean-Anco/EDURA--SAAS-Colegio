export interface ResolvedorAcceso {
  tipoAcceso: 'PLATAFORMA' | 'INSTITUCION';
  institucionId: string | null;
  puntoAccesoId: string | null;
  identificadorNormalizado: string | null;
}

export interface ResolvedorPuntoAccesoInstitucion {
  resolver(tipo: string, identificador: string): Promise<ResolvedorAcceso>;
}

export interface AlmacenamientoActivosIdentidad {
  guardar(
    nombreArchivo: string,
    buffer: Buffer,
    mimeType: string,
  ): Promise<{ claveAlmacenamiento: string; urlPublica: string }>;
  obtenerUrlPublica(claveAlmacenamiento: string): string;
  eliminarTemporal(claveAlmacenamiento: string): Promise<void>;
  existe(claveAlmacenamiento: string): Promise<boolean>;
}
