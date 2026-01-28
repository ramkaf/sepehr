import { Inject, Injectable } from '@nestjs/common';
import { PlantRepositoryService } from '../../repositories/plant.repository';
import { PlantService } from '../plant-unit/plants.service';
import { DataSource } from 'typeorm';
import { EntityField } from 'libs/database';

@Injectable()
export class PlantAssetsService {
  constructor(
    @Inject('DATA_SOURCE')
    private readonly dataSource: DataSource,
    private readonly plantService: PlantService,
  ) {}

  async fetchPlantActiveDevicesByAssets(
    plantUuid: string,
    entityFields: EntityField[],
  ) {
    const { assetTable } =
      await this.plantService.generatePlantTablesName(plantUuid);
    const entityFieldIds = entityFields.map((item) => item.efId);
    const placeholders = entityFieldIds.map((_, i) => `$${i + 1}`).join(',');
    const query = `
        SELECT 
          source_str,
          start_date,
          ef_id,
          asset_prop,
          asset_value
        FROM ${assetTable}
        WHERE ef_id IN (${placeholders}) AND status = 'active'
        ORDER BY source_str, start_date DESC
      `;
    const results = await this.dataSource.manager.query(query, entityFieldIds);
    return results;
  }
}
