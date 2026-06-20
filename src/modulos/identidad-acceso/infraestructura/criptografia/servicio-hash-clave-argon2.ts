import * as argon2 from 'argon2';

export class ServicioHashClaveArgon2 {
  async crearHash(clave: string): Promise<string> {
    return argon2.hash(clave, { type: argon2.argon2id });
  }

  async verificar(hash: string, clave: string): Promise<boolean> {
    return argon2.verify(hash, clave);
  }
}
