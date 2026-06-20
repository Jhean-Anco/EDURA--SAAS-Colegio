import { JwtService } from '@nestjs/jwt';

export class ServicioTokenAccesoJwt {
  constructor(
    private readonly jwt: JwtService,
    private readonly emisor: string,
    private readonly audiencia: string,
  ) {}

  firmar(entrada: {
    usuarioId: string;
    sesionId: string;
    versionSeguridad: number;
    ambito: 'PLATAFORMA' | 'INSTITUCION' | 'SEDE';
    institucionId: string | null;
    sedeId: string | null;
  }): string {
    return this.jwt.sign(entrada, {
      issuer: this.emisor,
      audience: this.audiencia,
      expiresIn: '15m',
    });
  }
}
