import { AppModule } from '../../src/app.module';

describe('AppModule', () => {
  it('está exportado y disponible para bootstrap', () => {
    expect(AppModule).toBeDefined();
  });
});
