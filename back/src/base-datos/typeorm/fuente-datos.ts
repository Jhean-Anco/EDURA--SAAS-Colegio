import { DataSource, DataSourceOptions } from 'typeorm';
import { configuracionTypeOrm } from './typeorm.options';

export const fuenteDatosOptions = (): DataSourceOptions =>
  configuracionTypeOrm();

const fuenteDatos = new DataSource(fuenteDatosOptions());

export default fuenteDatos;
