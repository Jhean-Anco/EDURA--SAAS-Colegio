import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

export class ServicioTokenOpacoCriptografico {
  constructor(private readonly secreto: string) {}

  generar(): { token: string; hash: string } {
    const token = randomBytes(32).toString('base64url');
    return { token, hash: this.hash(token) };
  }

  hash(token: string): string {
    return createHmac('sha256', this.secreto).update(token).digest('hex');
  }

  comparar(hashEsperado: string, token: string): boolean {
    const hashReal = this.hash(token);
    return timingSafeEqual(Buffer.from(hashEsperado), Buffer.from(hashReal));
  }
}
