import {
  EstadoIncompatibleError,
  ReglaNegocioError,
} from '../../../../compartido/dominio/errores-dominio';

export type EstadoSede = 'ACTIVA' | 'INACTIVA' | 'BAJA';

export interface SedeProps {
  id: string;
  institucionId: string;
  codigo: string;
  nombre: string;
  esPrincipal: boolean;
  estado: EstadoSede;
}

export class Sede {
  private constructor(private readonly props: SedeProps) {}

  static reconstruir(props: SedeProps): Sede {
    return new Sede(props);
  }

  static crear(input: {
    id: string;
    institucionId: string;
    codigo: string;
    nombre: string;
    institucionActiva: boolean;
  }): Sede {
    if (!input.institucionActiva) {
      throw new EstadoIncompatibleError(
        'La institución debe estar activa para crear una sede.',
      );
    }
    const codigo = input.codigo.trim().toUpperCase();
    if (!codigo) {
      throw new ReglaNegocioError('El código de sede no puede quedar vacío.');
    }
    if (!input.nombre.trim()) {
      throw new ReglaNegocioError('El nombre de sede es obligatorio.');
    }
    return new Sede({
      id: input.id,
      institucionId: input.institucionId,
      codigo,
      nombre: input.nombre.trim(),
      esPrincipal: false,
      estado: 'ACTIVA',
    });
  }

  establecerPrincipal(): void {
    if (this.props.estado === 'BAJA') {
      throw new EstadoIncompatibleError(
        'Una sede dada de baja no puede ser principal.',
      );
    }
    this.props.esPrincipal = true;
  }

  retirarCondicionPrincipal(): void {
    this.props.esPrincipal = false;
  }

  activar(): void {
    if (this.props.estado === 'BAJA') {
      throw new EstadoIncompatibleError(
        'Una sede dada de baja no se reactiva.',
      );
    }
    this.props.estado = 'ACTIVA';
  }

  desactivar(): void {
    if (this.props.estado === 'BAJA') {
      throw new EstadoIncompatibleError(
        'Una sede dada de baja no cambia de estado.',
      );
    }
    this.props.estado = 'INACTIVA';
  }

  darDeBaja(): void {
    this.props.estado = 'BAJA';
  }

  get id(): string {
    return this.props.id;
  }

  get institucionId(): string {
    return this.props.institucionId;
  }

  get codigo(): string {
    return this.props.codigo;
  }

  get estado(): EstadoSede {
    return this.props.estado;
  }

  get esPrincipal(): boolean {
    return this.props.esPrincipal;
  }

  get nombre(): string {
    return this.props.nombre;
  }

  get estadoCompleto(): EstadoSede {
    return this.props.estado;
  }
}
