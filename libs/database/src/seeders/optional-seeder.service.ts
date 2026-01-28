import { Injectable } from '@nestjs/common';
import { EntityModelSeeder } from './optional-seeder/entity.seeder.service';
import { EntityFieldSeeder } from './optional-seeder/entity-field.seeder.service';
import { AlarmConfigSeeder } from './optional-seeder/alarm-config.seeder.service';
import { BrowserGroupSeeder } from './optional-seeder/browser-group.seeder.service';
import { PlantMessageSeeder } from './optional-seeder/plant-message.seeder.service';
import { AlertConfigMessageSeeder } from './optional-seeder/alert-config-message.seeder.service';
import { SourceSeeder } from './optional-seeder/sources.seeder.service';
import { DocumentSeeder } from './optional-seeder/document.seeder.service';
import { EntityFieldsPeriodSeeder } from './optional-seeder/field-period.seeder.service';
import { BookmarkFieldSeeder } from './optional-seeder/bookmark-field.seeder.service';
import { ChartSeeder } from './optional-seeder/charts.seeder.service';
import { ChartDetailSeeder } from './optional-seeder/chart-details.seeder.service';
import { ChartEntitySeeder } from './optional-seeder/chart-entities.seeder.service';
import { DetailFieldSeeder } from './optional-seeder/details_fields.seeder.service';
import { SoilingSeeder } from './optional-seeder/soiling.seeder.service';
import { SoilingEntitiesSeeder } from './optional-seeder/soiling-entities.seeder.service';
import { SoilingEntityFieldSeeder } from './optional-seeder/soiling-entitiy-fields.seeder.service';
import { UserComponentConfigSeeder } from './optional-seeder/user-component-config.seeder.service';
import { UserChartSeeder } from './optional-seeder/user-charts.seeder.service';
import { FleatManagerSeeder } from './optional-seeder/fleat-manager.seeder.service';
import { EntityFieldConditionSeeder } from './optional-seeder/entity-field-condition.seeder.service';
import { CollectionSeeder } from './optional-seeder/collection.seeder.service';
import { CollectionParamSeeder } from './optional-seeder/collection-params.seeder.service';
import { EntityTypeSeeder } from './optional-seeder/entity-type.seeder.service';

@Injectable()
export class OptionalSeederService {
  constructor(
    private readonly entityTypeSeeder: EntityTypeSeeder,
    private readonly entityModelSeeder: EntityModelSeeder,
    private readonly entityFieldSeeder: EntityFieldSeeder,
    private readonly alarmConfigSeeder: AlarmConfigSeeder,
    private readonly browserGroupSeeder: BrowserGroupSeeder,
    private readonly plantMessageSeeder: PlantMessageSeeder,
    private readonly alertConfigMessageSeeder: AlertConfigMessageSeeder,
    private readonly sourceSeeder: SourceSeeder,
    private readonly documentSeeder: DocumentSeeder,
    private readonly entityFieldPeriodSeeder: EntityFieldsPeriodSeeder,
    private readonly bookamrkFieldSeeder: BookmarkFieldSeeder,
    private readonly chartSeeder: ChartSeeder,
    private readonly chartDetailSeeder: ChartDetailSeeder,
    private readonly chartEntitySeeder: ChartEntitySeeder,
    private readonly detailFieldSeeder: DetailFieldSeeder,
    private readonly soilingSeeder: SoilingSeeder,
    private readonly soilingEntitySeeder: SoilingEntitiesSeeder,
    private readonly soilingEntityFieldSeeder: SoilingEntityFieldSeeder,
    private readonly UserComponenConfigSeeder: UserComponentConfigSeeder,
    private readonly userChartseeder: UserChartSeeder,
    private readonly fleatManagerSeeder: FleatManagerSeeder,
    private readonly entityFieldConditionSeeder: EntityFieldConditionSeeder,
    private readonly collectionSeeder: CollectionSeeder,
    private readonly collectionParamSeeder: CollectionParamSeeder,
  ) {}

  async seedOptional() {
    await this.entityTypeSeeder.seed();
    // await this.entityModelSeeder.seed();
    await this.alarmConfigSeeder.seed();
    await this.entityFieldSeeder.seed();
    await this.browserGroupSeeder.seed();
    await this.plantMessageSeeder.seed();
    await this.sourceSeeder.seed();
    await this.alertConfigMessageSeeder.seed();
    await this.documentSeeder.seed();
    await this.entityFieldPeriodSeeder.seed();
    await this.bookamrkFieldSeeder.seed();
    await this.chartSeeder.seed();
    await this.chartDetailSeeder.seed();
    await this.chartEntitySeeder.seed();
    await this.detailFieldSeeder.seed();
    await this.soilingSeeder.seed();
    await this.soilingEntitySeeder.seed();
    await this.soilingEntityFieldSeeder.seed();
    await this.UserComponenConfigSeeder.seed();
    await this.userChartseeder.seed();
    await this.fleatManagerSeeder.seed();
    await this.entityFieldConditionSeeder.seed();
    await this.collectionSeeder.seed();
    await this.collectionSeeder.seed();
    await this.collectionParamSeeder.seed();
  }
}
