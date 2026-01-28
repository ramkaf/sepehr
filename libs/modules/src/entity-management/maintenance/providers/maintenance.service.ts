import { PlantAssetsService, PlantService } from '@app/modules/insight';
import { Inject, Injectable } from '@nestjs/common';
import { EntityField } from 'libs/database';
import { DataSource } from 'typeorm';
import { UserGlobalService } from '../../users/userGlobal.service';
import { CompanyService } from '../../company/providers/company.service';

@Injectable()
export class MaintenanceService {
  constructor(private readonly companyService: CompanyService) {}
  async getAllDevices(userUuid: string) {
    const plants = await this.companyService.fetchUserCompany(userUuid);
    return plants;

    // const firstPlant = userPlants[0];
    // const companyInfo = await this.companyService.getCompanyFromPlant(firstPlant.e_id);
    // if (!companyInfo) {
    //   throw new NotFoundException('Plant is not assigned to a company');
    // }

    // Get all company plants that user has access to
    // Note: Access is already guaranteed since company came from user's plant
    // and getPlantsByCompanyId filters by user_id
    // const companyPlants = await this.companyService.getPlantsByCompanyId(
    //   companyInfo.company_id,
    //   user_id,
    // );

    // if (!companyPlants || companyPlants.length === 0) {
    // return {
    //   company_id: companyInfo.company_id,
    //   company_name: companyInfo.company_name,
    //   deviceGroups: [],
    //   warehouse: null,
    // };
    // }

    // Get devices for all plants and group by type, then by plant
    // const deviceGroupsMap = new Map(); // type -> Map(plant_id -> {plant info, devices[]})

    // for (const companyPlant of companyPlants) {
    //   const plant_id = companyPlant.plant_id;
    //   const plantDevices = await this.getPlantDevicesForCompany(plant_id);

    //   // Process each device group from this plant
    //   for (const deviceGroup of plantDevices.device_groups || []) {
    //     const type = deviceGroup.type;

    //     if (!deviceGroupsMap.has(type)) {
    //       deviceGroupsMap.set(type, new Map());
    //     }

    //     const typeMap = deviceGroupsMap.get(type);

    //     if (!typeMap.has(plant_id)) {
    //       typeMap.set(plant_id, {
    //         plant_id: plant_id,
    //         plant_name: plantDevices.plant_name,
    //         devices: [],
    //       });
    //     }

    //     // Add devices from this type group to the plant's device list
    //     typeMap.get(plant_id).devices.push(...deviceGroup.devices);
    //   }
    // }

    // Convert to array format: [{type, data: [{plant_id, plant_name, devices[]}]}]
    // const deviceGroups = Array.from(deviceGroupsMap.entries()).map(([type, plantMap]) => ({
    //   type: type,
    //   data: Array.from(plantMap.values()),
    // }));

    // Get warehouse devices for the company
    // const warehouseData = await this.warehouseService.getCompanyWarehouseDevices(
    //   companyInfo.company_id,
    // );

    // Format warehouse response
    // User's example shows a single warehouse object, but a company can have multiple warehouses
    // Return as array to handle multiple warehouses
    //   const warehouses = warehouseData.map((warehouse) => ({
    //     warehouse_id: warehouse.warehouse_id,
    //     warehouse_name: warehouse.warehouse_name,
    //     devices: warehouse.devices,
    //   }));

    //   return {
    //     company_id: companyInfo.company_id,
    //     company_name: companyInfo.company_name,
    //     deviceGroups: deviceGroups,
    //     warehouse:
    //       warehouses.length > 0 ? (warehouses.length === 1 ? warehouses[0] : warehouses) : null,
    //   };
    // };
    //   async getMaintenanceState(entity_id) {
    //   try {
    //     const query = `
    //       SELECT
    //         dm.dm_id,
    //         dm.entity_id,
    //         dm.current_step_id,
    //         ms.step_name as current_step,
    //         dm.media_id,
    //         dm.updated_at,
    //         dm.last_updated_by
    //       FROM maintenance.device_maintenance dm
    //       LEFT JOIN maintenance.maintenance_steps ms ON dm.current_step_id = ms.ms_id
    //       WHERE dm.entity_id = $1
    //     `;
    //     const result = await postgres_client.oneOrNone(query, [entity_id]);
    //     return result;
    //   } catch (error) {
    //     throw new DatabaseException('Error fetching maintenance state', error);
    //   }
    // }

    //     async getMaintenanceStates(entity_ids) {
    //     try {
    //       if (!entity_ids || entity_ids.length === 0) {
    //         return [];
    //       }
    //       const placeholders = entity_ids.map((_, i) => `$${i + 1}`).join(',');
    //       const query = `
    //         SELECT
    //           dm.dm_id,
    //           dm.entity_id,
    //           dm.current_step_id,
    //           ms.step_name as current_step,
    //           dm.media_id,
    //           dm.updated_at,
    //           dm.last_updated_by
    //         FROM maintenance.device_maintenance dm
    //         LEFT JOIN maintenance.maintenance_steps ms ON dm.current_step_id = ms.ms_id
    //         WHERE dm.entity_id IN (${placeholders})
    //       `;
    //       const results = await postgres_client.manyOrNone(query, entity_ids);
    //       return results || [];
    //     } catch (error) {
    //       throw new DatabaseException('Error fetching maintenance states', error);
    //     }
  }
}
