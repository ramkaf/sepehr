import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ConfigModule } from '@nestjs/config';
import { PostgresSchemasEnum } from 'libs/enums';
import { SchemaInitializer } from './models/schema-Initializer';
import { NestConfigModule, NestConfigService } from 'libs/config';
import { RedisModule } from '../redis';
import {
  AccessType,
  AccessTypeSetting,
  Source,
  Role,
  Permission,
  User,
  ApiLog,
  UserComponentsConfig,
  EntityType,
  Settings,
  SettingSection,
  EntityModel,
  FleetManager,
  EntityField,
  Chart,
  ChartDetail,
  DetailField,
  ChartEntity,
  UserChart,
  AlarmCondition,
  PlantMessage,
  Soiling,
  EntityFieldsPeriod,
  EntityFieldCondition,
  BookmarkField,
  AlertConfigMessage,
  AlarmConfig,
  CollectionEntity,
  DocumentEntity,
  BrowserGroupEntity,
  EntityFieldSchema,
  UserEntityAssignment,
  Schematic,
} from './entities';
import { PlantFieldVisibility } from './entities/plant-field-visibility.entity';
import { EntityTypeFieldSetupStatus } from './entities/entity-type-field-setup-status.entity.dto';
import { SchematicCategory } from './entities/schematic-category.entity';
import { SoilingEntities } from './entities/soiling-entities.entity';
import { SoilingEntityFields } from './entities/soiling-entity-fields.entity';
import { Province } from './entities/province.entity';
import { PlantType } from './entities/plant-type.entity';
import { Company } from './entities/company.entity';
import { MediaResource } from './entities/media-resource.entity';
import { WarehouseDevice } from './entities/maintenance/warehouse-devices.entity';
import { MaintenanceStep } from './entities/maintenance/maintenance-step.entity';
import { MaintenanceHistory } from './entities/maintenance/maintenance-history';
import { DeviceWarranty } from './entities/maintenance/device-warranties.entity';
import { DeviceTagMapping } from './entities/maintenance/device-tag-mapping.entity';
import { DeviceSpec } from './entities/maintenance/device-spec.entity';
import { FleetManagerColumns } from './entities/fleet-manager-columns.entity';
import { UserFleetColumnsPreferences } from './entities/user-fleet-columns-preferences.entity';
import { CompanyWarehouse } from './entities/maintenance/company-warehouse.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    RedisModule,
    TypeOrmModule.forRootAsync({
      imports: [NestConfigModule],
      inject: [NestConfigService],
      useFactory: (configService: NestConfigService) => ({
        type: 'postgres',
        host: configService.pgHost,
        port: configService.pgPort,
        username: configService.pgUser,
        password: configService.pgPassword,
        database: configService.pgDb,
        entities: [
          AccessType,
          SettingSection,
          Settings,
          AccessTypeSetting,
          Role,
          Permission,
          User,
          ApiLog,
          Permission,
          UserComponentsConfig,
          EntityType,
          EntityModel,
          Source,
          FleetManager,
          EntityField,
          Chart,
          ChartDetail,
          DetailField,
          ChartEntity,
          UserChart,
          AlarmCondition,
          PlantMessage,
          Soiling,
          EntityFieldsPeriod,
          EntityFieldCondition,
          BookmarkField,
          AlertConfigMessage,
          AlarmConfig,
          CollectionEntity,
          DocumentEntity,
          BrowserGroupEntity,
          EntityFieldSchema,
          PlantFieldVisibility,
          EntityTypeFieldSetupStatus,
          UserEntityAssignment,
          Schematic,
          SchematicCategory,
          SoilingEntities,
          SoilingEntityFields,
          Province,
          PlantType,
          Company,
          MediaResource,
          WarehouseDevice,
          MaintenanceStep,
          MaintenanceHistory,
          DeviceWarranty,
          DeviceTagMapping,
          DeviceSpec,
          FleetManagerColumns,
          UserFleetColumnsPreferences,
          CompanyWarehouse,
        ],
        synchronize: false,
        logging: configService.pgLogging,
      }),
      extraProviders: [
        {
          provide: 'SchemaInitializer',
          useFactory: (dataSource: DataSource) =>
            new SchemaInitializer(dataSource),
          inject: [DataSource],
        },
      ],
    }),
    TypeOrmModule.forFeature([EntityType, EntityModel]),
  ],
  providers: [
    {
      provide: 'DATA_SOURCE',
      useFactory: (dataSource: DataSource) => dataSource,
      inject: [DataSource],
    },
  ],
  exports: [TypeOrmModule, 'DATA_SOURCE'],
})
export class PostgresModule implements OnModuleInit {
  private readonly logger = new Logger(PostgresModule.name);
  constructor(private dataSource: DataSource) {}

  private requiredSchemas = Object.values(PostgresSchemasEnum);

  async onModuleInit() {
    try {
      await this.ensureSchemasExist();

      if (process.env['NODE_ENV'] !== 'production') {
        await this.dataSource.synchronize();
      }
      // await this.ensureEntityTypeSequenceStartsAt233();
      // await this.ensureEntitySequenceStartsAt944();
      // await this.ensureEntityFieldSequenceStartsAt4372();

      this.logger.log('PostgresModule initialization completed successfully');
    } catch (error) {
      this.logger.error('Error during PostgresModule initialization:', error);
      throw error;
    }
  }

  private async ensureSchemasExist(): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.connect();
      const result = await queryRunner.query(
        "SELECT schema_name FROM information_schema.schemata WHERE schema_name NOT LIKE 'pg_%' AND schema_name != 'information_schema'",
      );
      const existingSchemas = result.map((row: any) => row.schema_name);

      for (const schema of this.requiredSchemas) {
        if (!existingSchemas.includes(schema)) {
          await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS "${schema}"`);
          this.logger.log(`Created schema: ${schema}`);
        }
      }
    } catch (error) {
      this.logger.error('Error ensuring schemas exist:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // private async ensureEntityTypeSequenceStartsAt233(): Promise<void> {
  //   const queryRunner = this.dataSource.createQueryRunner();
  //   try {
  //     await queryRunner.connect();

  //     // Check if sequence exists first
  //     const sequenceExists = await queryRunner.query(`
  //       SELECT EXISTS (
  //         SELECT 1 FROM information_schema.sequences
  //         WHERE sequence_schema = 'main'
  //         AND sequence_name = 'entity_types_et_id_seq'
  //       ) as exists
  //     `);

  //     if (sequenceExists[0].exists) {
  //       await queryRunner.query(`
  //         DO $$
  //         DECLARE
  //           current_value bigint;
  //         BEGIN
  //           SELECT last_value INTO current_value FROM main.entity_types_et_id_seq;
  //           IF current_value < 233 THEN
  //             ALTER SEQUENCE main.entity_types_et_id_seq RESTART WITH 233;
  //           END IF;
  //         END $$;
  //       `);
  //       this.logger.log('Entity type sequence ensured to start at 233');
  //     } else {
  //       this.logger.warn(
  //         'Entity type sequence not found - skipping sequence adjustment'
  //       );
  //     }
  //   } catch (error) {
  //     this.logger.error('Error ensuring sequence starts at 233:', error);
  //     throw error;
  //   } finally {
  //     await queryRunner.release();
  //   }
  // }

  // private async ensureEntitySequenceStartsAt944(): Promise<void> {
  //   const queryRunner = this.dataSource.createQueryRunner();
  //   try {
  //     await queryRunner.connect();

  //     const sequenceExists = await queryRunner.query(`
  //       SELECT EXISTS (
  //         SELECT 1 FROM information_schema.sequences
  //         WHERE sequence_schema = 'main'
  //         AND sequence_name = 'entity_e_id_seq'
  //       ) as exists
  //     `);

  //     if (sequenceExists[0].exists) {
  //       await queryRunner.query(`
  //         DO $$
  //         DECLARE
  //           current_value bigint;
  //         BEGIN
  //           SELECT last_value INTO current_value FROM main.entity_e_id_seq;
  //           IF current_value < 944 THEN
  //             ALTER SEQUENCE main.entity_e_id_seq RESTART WITH 944;
  //           END IF;
  //         END $$;
  //       `);
  //       this.logger.log('Entity sequence ensured to start at 944');
  //     } else {
  //       this.logger.warn(
  //         'Entity sequence not found - skipping sequence adjustment'
  //       );
  //     }
  //   } catch (error) {
  //     this.logger.error('Error ensuring entity sequence starts at 944:', error);
  //     throw error;
  //   } finally {
  //     await queryRunner.release();
  //   }
  // }

  // private async ensureEntityFieldSequenceStartsAt4372(): Promise<void> {
  //   const queryRunner = this.dataSource.createQueryRunner();
  //   try {
  //     await queryRunner.connect();

  //     const sequenceExists = await queryRunner.query(`
  //       SELECT EXISTS (
  //         SELECT 1 FROM information_schema.sequences
  //         WHERE sequence_schema = 'main'
  //         AND sequence_name = 'entity_fields_ef_id_seq'
  //       ) as exists
  //     `);

  //     if (sequenceExists[0].exists) {
  //       await queryRunner.query(`
  //         DO $$
  //         DECLARE
  //           current_value bigint;
  //         BEGIN
  //           SELECT last_value INTO current_value FROM main.entity_fields_ef_id_seq;
  //           IF current_value < 4372 THEN
  //             ALTER SEQUENCE main.entity_fields_ef_id_seq RESTART WITH 4372;
  //           END IF;
  //         END $$;
  //       `);
  //       this.logger.log('Entity field sequence ensured to start at 4372');
  //     } else {
  //       this.logger.warn(
  //         'Entity field sequence not found - skipping sequence adjustment'
  //       );
  //     }
  //   } catch (error) {
  //     this.logger.error(
  //       'Error ensuring entity field sequence starts at 4372:',
  //       error
  //     );
  //     throw error;
  //   } finally {
  //     await queryRunner.release();
  //   }
  // }
}
