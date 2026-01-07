import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import {
  BookmarkField,
  buildBrowserEntitiesTreeQuery,
  buildEntityEventsQuery,
  buildEntityStatesQuery,
} from 'libs/database';
import {
  ComputationalParameterService,
  EntityBaseService,
  EntityFieldBaseService,
  EntityService,
  IBrowserLastValueResponse,
  MaskFunctionService,
  NonComputationalService,
  PlantService,
  StaticParameterService,
  UserGlobalService,
} from 'libs/modules';
import { EntityFieldUuidDto, EntityUuidDto, PlantUuidDto } from 'libs/dtos';
import { IEntityField, IEventResult, IStateResult } from 'libs/interfaces';
import { calculateDurationBetween2Date } from 'libs/utils';

@Injectable()
export class BrowserService {
  constructor(
    @Inject('DATA_SOURCE')
    private readonly dataSource: DataSource,
    @InjectRepository(BookmarkField)
    private readonly BookmarkFieldRepository: Repository<BookmarkField>,
    private readonly plantService: PlantService,
    private readonly entityService: EntityService,
    private readonly entityBaseService: EntityBaseService,
    private readonly entityFieldBaseService: EntityFieldBaseService,
    private readonly userService: UserGlobalService,
    private readonly staticParameterService: StaticParameterService,
    private readonly computationalParameterService: ComputationalParameterService,
    private readonly nonComputationalParameterService: NonComputationalService,
    private readonly maskFunctionService: MaskFunctionService,
  ) {}

  async fetchEntitiesTree(plantUuidDto: PlantUuidDto) {
    const { plantUuid } = plantUuidDto;
    const { plant, statusTable } =
      await this.plantService.generatePlantTablesName(plantUuid);
    const postgresQuery = buildBrowserEntitiesTreeQuery(statusTable);
    const rawData = await this.dataSource.manager.query(postgresQuery, [
      plant.eId,
    ]);
    return rawData;
  }

  async fetchEntityFields(
    request: Request,
    entityUuidDto: EntityUuidDto, // : Promise<IBrowserLastValueResponse[]>
  ) {
    const { id: userUuid } = request.user!;
    const { eUuid } = entityUuidDto;
    const entity = await this.entityBaseService.findOne(eUuid);
    if (!entity) {
      throw new NotFoundException(
        `The requested entity with UUID '${eUuid}' was not found in the system. Please verify the UUID and try again.`,
      );
    }
    const plant = await this.entityService.getEntityPlant(eUuid);
    const parameters =
      await this.entityService.getEntityFieldsWithBookmarksAndPeriod(
        entity.uuid,
        userUuid,
      );
    // return parameters;
    const { entityFields } = parameters.entityType;

    const nonComputationalParameters = entityFields.filter(
      (item) => !item.isComputational && !item.isStatic,
    ) as unknown as IEntityField[];
    const computationalParameters = entityFields.filter(
      (item) => item.isComputational && !item.isStatic,
    ) as unknown as IEntityField[];
    const staticParameters = entityFields.filter(
      (item) => item.isStatic,
    ) as unknown as IEntityField[];
    let nonComputationalParametersWithLastValue: IBrowserLastValueResponse[] =
      [];

    let computationalParametersWithLastValue: IBrowserLastValueResponse[] = [];
    let staticParametersWithLastValue: IBrowserLastValueResponse[] = [];
    if (nonComputationalParameters.length > 0) {
      nonComputationalParametersWithLastValue =
        await this.nonComputationalParameterService.fetchNonComputationalParamWithPeriodLastValue(
          plant,
          entity.entityTag,
          nonComputationalParameters,
        );
    }
    if (computationalParameters.length > 0) {
      computationalParametersWithLastValue =
        await this.computationalParameterService.fetchAllEntityComputationalParameterLastValue(
          plant,
          entity,
          computationalParameters,
        );
    }
    if (staticParameters.length > 0) {
      staticParametersWithLastValue =
        await this.staticParameterService.mapStaticParametersToLastValue(
          staticParameters,
        );
    }
    const totalParametersWithValues: IBrowserLastValueResponse[] = [
      ...computationalParametersWithLastValue,
      ...staticParametersWithLastValue,
      ...nonComputationalParametersWithLastValue,
    ];
    return this.maskFunctionService.maskBrowserParametersLastValues(
      totalParametersWithValues,
    );
  }

  async bookmarkToggle(req: Request, entityFieldUuidDto: EntityFieldUuidDto) {
    const { efUuid } = entityFieldUuidDto;
    if (!req.user) throw new BadRequestException('something goes wrong');
    const { id: userUuid } = req.user;
    const [entityField, user] = await Promise.all([
      this.entityFieldBaseService.findOne(efUuid),
      this.userService.findOne(userUuid),
    ]);
    if (!entityField) {
      throw new BadRequestException(
        `Entity field with UUID ${efUuid} not found`,
      );
    }

    if (!user) {
      throw new UnauthorizedException('User authentication failed');
    }

    const existingBookmark = await this.BookmarkFieldRepository.findOne({
      where: {
        entityField: { uuid: efUuid },
        user: { uuid: userUuid },
      },
    });

    if (existingBookmark) {
      await this.BookmarkFieldRepository.remove(existingBookmark);
      return {
        bookmarked: false,
        message: 'Bookmark removed successfully',
      };
    } else {
      const newBookmark = this.BookmarkFieldRepository.create({
        entityField,
        user,
      });
      await this.BookmarkFieldRepository.save(newBookmark);
      return {
        bookmarked: true,
        message: 'Bookmark added successfully',
      };
    }
  }

  async fetchEntityEvents(
    entityUuidDto: EntityUuidDto,
  ): Promise<IEventResult[]> {
    const { eUuid } = entityUuidDto;
    const entity = await this.entityBaseService.findOne(eUuid);
    if (!entity) {
      throw new BadRequestException(
        `Entity with UUID '${eUuid}' not found. Please verify the UUID and try again.`,
      );
    }
    const plant = await this.entityService.getEntityPlant(eUuid);
    const { entityTag: site } = plant;
    const { eventTable } = await this.plantService.generatePlantTablesName(
      plant.eId,
    );
    const postgresQuery = buildEntityEventsQuery(eventTable);
    const events: IEventResult[] = await this.dataSource.manager.query(
      postgresQuery,
      [entity.entityTag],
    );
    const result = events.map((item: IEventResult) => {
      const { strDuration, duration } = calculateDurationBetween2Date(
        item.startDate,
        item.receptionDate,
      );
      return { ...item, duration, site, strDuration };
    });
    return result;
  }

  async fetchEntityStates(
    entityUuidDto: EntityUuidDto,
  ): Promise<IStateResult[]> {
    const { eUuid } = entityUuidDto;
    const entity = await this.entityBaseService.findOne(eUuid);
    if (!entity) {
      throw new BadRequestException(
        `Entity with UUID '${eUuid}' not found. Please verify the UUID and try again.`,
      );
    }
    const plant = await this.entityService.getEntityPlant(eUuid);
    const { entityTag: site } = plant;
    const { stateTable } = await this.plantService.generatePlantTablesName(
      plant.eId,
    );
    const postgresQuery = buildEntityStatesQuery(stateTable);
    const states = await this.dataSource.manager.query(postgresQuery, [
      entity.entityTag,
    ]);
    const result: IStateResult[] = states.map((item: IStateResult) => {
      return { ...item, site };
    });
    return result;
  }
}
