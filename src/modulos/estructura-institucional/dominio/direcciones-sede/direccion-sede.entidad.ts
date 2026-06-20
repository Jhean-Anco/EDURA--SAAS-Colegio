import { ReglaNegocioError } from '../../../../compartido/dominio/errores-dominio';

export interface DireccionSedeProps {
  id: string;
  sedeId: string;
  idUbigeo: string | null;
  direccionLinea: string;
  referencia: string | null;
  latitud: string | null;
  longitud: string | null;
  codigoPostal: string | null;
}

export class DireccionSede {
  private constructor(private readonly props: DireccionSedeProps) {}

  static reconstruir(props: DireccionSedeProps): DireccionSede {
    return new DireccionSede(props);
  }

  static crear(input: DireccionSedeProps): DireccionSede {
    if (!input.direccionLinea.trim()) {
      throw new ReglaNegocioError('La direccion es obligatoria.');
    }
    if ((input.latitud === null) !== (input.longitud === null)) {
      throw new ReglaNegocioError(
        'Latitud y longitud deben existir juntas o ambas ser nulas.',
      );
    }
    return new DireccionSede({
      ...input,
      direccionLinea: input.direccionLinea.trim(),
      referencia: input.referencia?.trim() ?? null,
      codigoPostal: input.codigoPostal?.trim() ?? null,
    });
  }

  get id(): string {
    return this.props.id;
  }

  get sedeId(): string {
    return this.props.sedeId;
  }

  get direccionLinea(): string {
    return this.props.direccionLinea;
  }

  get referencia(): string | null {
    return this.props.referencia;
  }

  get idUbigeo(): string | null {
    return this.props.idUbigeo;
  }

  get latitud(): string | null {
    return this.props.latitud;
  }

  get longitud(): string | null {
    return this.props.longitud;
  }

  get codigoPostal(): string | null {
    return this.props.codigoPostal;
  }
}
