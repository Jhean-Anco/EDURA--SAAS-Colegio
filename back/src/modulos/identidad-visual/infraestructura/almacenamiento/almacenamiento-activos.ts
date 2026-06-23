import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { AlmacenamientoActivosIdentidad } from '../../dominio/puertos/puertos';

@Injectable()
export class AlmacenamientoActivosLocal implements AlmacenamientoActivosIdentidad {
  private readonly rutaBase: string;

  constructor() {
    // Definimos una ruta local dentro del workspace por defecto
    this.rutaBase = process.env.ALMACENAMIENTO_ACTIVOS_RUTA_LOCAL
      ? path.resolve(process.env.ALMACENAMIENTO_ACTIVOS_RUTA_LOCAL)
      : path.resolve(__dirname, '../../../../../../almacenamiento-local-activos');

    if (!fs.existsSync(this.rutaBase)) {
      fs.mkdirSync(this.rutaBase, { recursive: true });
    }
  }

  async guardar(
    nombreArchivo: string,
    buffer: Buffer,
    mimeType: string,
  ): Promise<{ claveAlmacenamiento: string; urlPublica: string }> {
    const ext = path.extname(nombreArchivo);
    const nombreUnico = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}${ext}`;
    const rutaCompleta = path.join(this.rutaBase, nombreUnico);

    await fs.promises.writeFile(rutaCompleta, buffer);

    const urlPublica = `/api/v1/publico/activos/${nombreUnico}`;
    return {
      claveAlmacenamiento: nombreUnico,
      urlPublica,
    };
  }

  obtenerUrlPublica(claveAlmacenamiento: string): string {
    return `/api/v1/publico/activos/${claveAlmacenamiento}`;
  }

  async eliminarTemporal(claveAlmacenamiento: string): Promise<void> {
    const rutaCompleta = path.join(this.rutaBase, claveAlmacenamiento);
    if (fs.existsSync(rutaCompleta)) {
      await fs.promises.unlink(rutaCompleta);
    }
  }

  async existe(claveAlmacenamiento: string): Promise<boolean> {
    const rutaCompleta = path.join(this.rutaBase, claveAlmacenamiento);
    return fs.existsSync(rutaCompleta);
  }

  // Método auxiliar para leer el archivo desde el controlador NestJS
  obtenerRutaArchivo(claveAlmacenamiento: string): string {
    return path.join(this.rutaBase, claveAlmacenamiento);
  }
}
