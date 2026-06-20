import { JwtService } from '@nestjs/jwt';
import { PayloadAcceso } from '../../dominio/valores/payload-acceso';

export class ServicioTokenAccesoJwt {
  constructor(
    private readonly jwt: JwtService,
    private readonly emisor: string,
    private readonly audiencia: string,
  ) {}

  firmar(entrada: PayloadAcceso, ttlSegundos: number): string {
    return this.jwt.sign(entrada, {
      issuer: this.emisor,
      audience: this.audiencia,
      expiresIn: ttlSegundos,
    });
  }

  verificar(token: string): Promise<PayloadAcceso> {
    return this.jwt.verifyAsync<PayloadAcceso>(token, {
      issuer: this.emisor,
      audience: this.audiencia,
    });
  }
}
