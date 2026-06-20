import {
  ContextoAcceso,
  ConsultadorContextosAcceso,
} from '../../dominio/puertos/repositorios';

export class ListarContextosUsuarioConsulta {
  constructor(private readonly consultador: ConsultadorContextosAcceso) {}

  ejecutar(usuarioId: string): Promise<ContextoAcceso[]> {
    return this.consultador.listarPorUsuario(usuarioId);
  }
}
