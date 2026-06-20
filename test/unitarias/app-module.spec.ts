describe('AppModule', () => {
  it('está exportado y disponible para bootstrap', async () => {
    process.env.ENTORNO = 'test';
    process.env.PUERTO_API = '3000';
    process.env.ORIGENES_CORS = 'http://localhost:5173';
    process.env.BD_HOST = 'localhost';
    process.env.BD_PUERTO = '5432';
    process.env.BD_USUARIO = 'edura';
    process.env.BD_CLAVE = 'edura_desarrollo';
    process.env.BD_NOMBRE = 'edura';
    process.env.BD_SSL = 'false';
    process.env.BD_REGISTRO_CONSULTAS = 'false';
    const { AppModule } = await import('../../src/app.module');
    expect(AppModule).toBeDefined();
  });
});
