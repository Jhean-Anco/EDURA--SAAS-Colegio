import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { PayloadAcceso } from '../../dominio/valores/payload-acceso';

export class ServicioTokenAccesoJwt {
  constructor(
    private readonly jwt: JwtService,
    private readonly secreto: string,
    private readonly emisor: string,
    private readonly audiencia: string,
  ) {}

  firmar(entrada: PayloadAcceso, ttlSegundos: number): string {
    return this.jwt.sign(entrada, {
      secret: this.secreto,
      issuer: this.emisor,
      audience: this.audiencia,
      expiresIn: ttlSegundos,
      algorithm: 'HS256',
    });
  }

  async verificar(token: string): Promise<PayloadAcceso> {
    // Defense in depth: Check token size limit (max 4096 characters)
    if (!token || token.length > 4096) {
      throw new UnauthorizedException('TOKEN_SIZE_LIMIT_EXCEEDED');
    }
    try {
      const payload = await this.jwt.verifyAsync<PayloadAcceso>(token, {
        secret: this.secreto,
        issuer: this.emisor,
        audience: this.audiencia,
        algorithms: ['HS256'],
      });
      if (!payload || !payload.sub || !payload.sid || !payload.tipoToken) {
        throw new UnauthorizedException('TOKEN_INVALIDO');
      }
      return payload;
    } catch (e) {
      throw new UnauthorizedException('TOKEN_INVALIDO');
    }
  }
}
