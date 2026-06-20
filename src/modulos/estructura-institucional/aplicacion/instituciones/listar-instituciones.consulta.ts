import { RepositorioInstituciones } from '../../dominio/instituciones/repositorio-instituciones.puerto';
import { ContextoSolicitudAutenticada } from '../../../../compartido/aplicacion/contexto-solicitud-autenticada';

export class ListarInstitucionesConsulta {
  constructor(private readonly repositorio: RepositorioInstituciones) {}

  async ejecutar(ctx: ContextoSolicitudAutenticada | undefined) {
    return this.repositorio.listarPorAlcance({
      ambito: ctx?.ambito ?? 'PLATAFORMA',
      institucionId: ctx?.institucionId ?? null,
    });
  }
}
