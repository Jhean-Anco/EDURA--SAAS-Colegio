import { CorreoElectronico } from '../../dominio/valores/correo-electronico';
import {
  RepositorioUsuarios,
  RepositorioAuditoria,
} from '../../dominio/puertos/repositorios';
import { EventoAuditoria } from '../../dominio/auditoria/evento-auditoria';

export interface IniciarSesionEntrada {
  correo: string;
  clave: string;
}

export interface IniciarSesionSalida {
  usuarioId: string;
  accessToken: string;
}

export class IniciarSesionCasoUso {
  constructor(
    private readonly usuarios: RepositorioUsuarios,
    private readonly auditoria: RepositorioAuditoria,
  ) {}

  async ejecutar(entrada: IniciarSesionEntrada): Promise<IniciarSesionSalida> {
    const correo = CorreoElectronico.crear(entrada.correo);
    const usuario = await this.usuarios.buscarPorCorreoNormalizado(
      correo.valor,
    );
    if (!usuario) {
      await this.auditoria.registrar(
        new EventoAuditoria('0', 'LOGIN_FALLO', 'usuario', 'FALLO'),
      );
      throw new Error('Credenciales invalidas');
    }
    await this.auditoria.registrar(
      new EventoAuditoria(usuario.id, 'LOGIN_EXITO', 'usuario', 'EXITO'),
    );
    return {
      usuarioId: usuario.id,
      accessToken: `stub.${usuario.id}`,
    };
  }
}
