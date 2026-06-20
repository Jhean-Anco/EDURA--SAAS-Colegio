import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

@Injectable()
export class IndicadorBaseDatos {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async verificar(): Promise<boolean> {
    if (!this.dataSource.isInitialized) {
      return false;
    }
    await this.dataSource.query('SELECT 1');
    return true;
  }
}
