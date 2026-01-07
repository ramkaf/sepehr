// src/auth/auth.controller.ts
import {
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Inject,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { Public } from 'libs/decorators';
import { BrowserService } from '../../../dashboard/browser/providers/browser.service';
import {
  Jarghoyeh1Service,
  Jarghoyeh3Service,
  JarghoyehService,
  Koshk1Service,
  Koshk2Service,
  MehrizService,
  PlantService,
  QomService,
  Baft1Service,
} from 'libs/modules';
import { ClientProxy } from '@nestjs/microservices';
import { InitPlantService } from '../../init-plant/providers/init-plant.service';
import { NOTIFICATION_RABBITMQ_SERVICE } from '@app/modules/messaging';
import { EntityField, EntityModel } from 'libs/database';
import { PeriodEnum } from 'libs/interfaces';
@UseInterceptors(ClassSerializerInterceptor)
@Controller('admin/test')
export class TestController {
  constructor(
    private readonly jarghoyehService: JarghoyehService,
    private readonly jarghoyeh1Service: Jarghoyeh1Service,
    private readonly jarghoyeh3Service: Jarghoyeh3Service,
    private readonly koshk1Service: Koshk1Service,
    private readonly baftServiceB: Baft1Service,
    private readonly koshk2Service: Koshk2Service,
    private readonly qomService: QomService,
    private readonly browserService: BrowserService,
    private readonly mehrizService: MehrizService,
    private readonly plantService: PlantService,
    @Inject(NOTIFICATION_RABBITMQ_SERVICE)
    private readonly rabbitmqService: ClientProxy,
    private readonly initPlantService: InitPlantService,
  ) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post()
  async test() {
    // const koshk2 = await this.koshk2Service.modAllValues(
    //   {} as EntityModel,
    //   {} as EntityField,
    //   {
    //     mode: PeriodEnum.D,
    //     startDate: '2025-07-27T14:15:00.000+03:30',
    //     endDate: '2025-10-27T22:00:00.000+03:30',
    //   },
    // );
    // const koshk1 = await this.koshk1Service.modAllValues(
    //   {} as EntityModel,
    //   {} as EntityField,
    //   {
    //     mode: PeriodEnum.D,
    //     startDate: '2025-07-27T14:15:00.000+03:30',
    //     endDate: '2025-10-27T22:00:00.000+03:30',
    //   },
    // );
    // const jarghoyeh2 = await this.jarghoyehService.modAllValues(
    //   {} as EntityModel,
    //   {} as EntityField,
    //   {
    //     mode: PeriodEnum.D,
    //     startDate: '2025-07-27T14:15:00.000+03:30',
    //     endDate: '2025-10-27T22:00:00.000+03:30',
    //   },
    // );
    //     const jarghoyeh1 = await this.jarghoyeh1Service.modAllValues({} as EntityModel ,   {} as EntityField ,
    //    {
    //   mode: PeriodEnum.D,
    //   startDate: '2025-07-27T14:15:00.000+03:30',
    //   endDate: '2025-10-27T22:00:00.000+03:30',
    // })
    // const jarghoyeh3 = await this.jarghoyeh3Service.modAllValues(
    //   {} as EntityModel,
    //   {} as EntityField,
    //   {
    //     mode: PeriodEnum.D,
    //     startDate: '2025-07-27T14:15:00.000+03:30',
    //     endDate: '2025-10-27T22:00:00.000+03:30',
    //   },
    // );
    // const qom = await this.qomService.modAllValues(
    //   {} as EntityModel,
    //   {} as EntityField,
    //   {
    //     mode: PeriodEnum.D,
    //     startDate: '2025-07-27T14:15:00.000+03:30',
    //     endDate: '2025-10-27T22:00:00.000+03:30',
    //   },
    // );
    // const mehriz = await this.mehrizService.modAllValues(
    //   {} as EntityModel,
    //   {} as EntityField,
    //   {
    //     mode: PeriodEnum.D,
    //     startDate: '2025-07-27T14:15:00.000+03:30',
    //     endDate: '2025-10-27T22:00:00.000+03:30',
    //   },
    // );

    // const Y = await this.jarghoyehService.acCorrectPerformanceAllValues(
    //   {} as EntityModel,
    //   {} as EntityField,
    //   {
    //     mode: PeriodEnum.D,
    //     startDate: '2025-11-27T14:15:00.000+03:30',
    //     endDate: '2025-12-27T22:00:00.000+03:30',
    //   },
    // );
    const jarghoyeh = await this.jarghoyehService.substationAcRawPerformanceLastValue(
       {entityTag : 'jarghoyeh:PCC:MV POWER METER SUB 1'} as EntityModel,
      {} as EntityField,
    );
    const jarghoyeh3 =
      await this.jarghoyeh3Service.substationAcRawPerformanceLastValue(
         {entityTag : 'jarghoyeh:PCC:MV POWER METER SUB 1'} as EntityModel,
        {} as EntityField,
      );
    const qom = await this.qomService.substationAcRawPerformanceLastValue(
      {entityTag : 'jarghoyeh:PCC:MV POWER METER SUB 1'} as EntityModel,
      {} as EntityField,
    );
    const mehriz = await this.mehrizService.substationAcRawPerformanceLastValue(
      {entityTag : 'jarghoyeh:PCC:MV POWER METER SUB 1'} as EntityModel,
      {} as EntityField,
    );
    const koshk1 = await this.koshk1Service.substationAcRawPerformanceLastValue(
       {entityTag : 'jarghoyeh:PCC:MV POWER METER SUB 1'} as EntityModel,
      {} as EntityField,
    );
    const koshk2 = await this.koshk2Service.substationAcRawPerformanceLastValue(
      {entityTag : 'jarghoyeh:PCC:MV POWER METER SUB 1'} as EntityModel,
      {} as EntityField,
    );
    const baft = await this.baftServiceB.substationAcRawPerformanceLastValue(
      {entityTag : 'jarghoyeh:PCC:MV POWER METER SUB 1'} as EntityModel,
      {} as EntityField,
    );
    return {
      jarghoyeh,
      jarghoyeh3,
      qom,
      mehriz,
      koshk1,
      koshk2,
      baft,
    };



    // const jarghoyeh = await this.jarghoyehService.substationAcCorrectPerformanceAllValues(
    //   {entityTag : 'jarghoyeh:PCC:MV POWER METER SUB 1'} as EntityModel,
    //   {} as EntityField,
    //   {
    //     mode: PeriodEnum.D,
    //     startDate: '2025-07-27T14:15:00.000+03:30',
    //     endDate: '2025-10-27T22:00:00.000+03:30',
    //   },
    // );
    // const jarghoyeh3 =
    //   await this.jarghoyeh3Service.substationAcCorrectPerformanceAllValues(
    //       {entityTag : 'jarghoyeh:PCC:MV POWER METER SUB 1'} as EntityModel,
    //   {} as EntityField,
    //   {
    //     mode: PeriodEnum.D,
    //     startDate: '2025-07-27T14:15:00.000+03:30',
    //     endDate: '2025-10-27T22:00:00.000+03:30',
    //   },
    //   );
    // const qom = await this.qomService.substationAcCorrectPerformanceAllValues(
    // {entityTag : 'jarghoyeh:PCC:MV POWER METER SUB 1'} as EntityModel,
    //   {} as EntityField,
    //   {
    //     mode: PeriodEnum.D,
    //     startDate: '2025-07-27T14:15:00.000+03:30',
    //     endDate: '2025-10-27T22:00:00.000+03:30',
    //   },
    // );
    // const mehriz = await this.mehrizService.substationAcCorrectPerformanceAllValues(
    // {entityTag : 'jarghoyeh:PCC:MV POWER METER SUB 1'} as EntityModel,
    //   {} as EntityField,
    //   {
    //     mode: PeriodEnum.D,
    //     startDate: '2025-07-27T14:15:00.000+03:30',
    //     endDate: '2025-10-27T22:00:00.000+03:30',
    //   },
    // );
    // const koshk1 = await this.koshk1Service.substationAcCorrectPerformanceAllValues(
    //   {entityTag : 'jarghoyeh:PCC:MV POWER METER SUB 1 '} as EntityModel,
    //   {} as EntityField,
    //   {
    //     mode: PeriodEnum.D,
    //     startDate: '2025-10-27T14:15:00.000+03:30',
    //     endDate: '2025-12-27T22:00:00.000+03:30',
    //   },
    // );
    // const koshk2 = await this.koshk2Service.substationAcCorrectPerformanceAllValues(
    //  {entityTag : 'jarghoyeh:PCC:MV POWER METER SUB 1'} as EntityModel,
    //   {} as EntityField,
    //   {
    //     mode: PeriodEnum.D,
    //     startDate: '2025-07-27T14:15:00.000+03:30',
    //     endDate: '2025-10-27T22:00:00.000+03:30',
    //   },
    // );
    // const baft = await this.baftServiceB.substationAcCorrectPerformanceAllValues(
    //  {entityTag : 'jarghoyeh:PCC:MV POWER METER SUB 1'} as EntityModel,
    //   {} as EntityField,
    //   {
    //     mode: PeriodEnum.D,
    //     startDate: '2025-07-27T14:15:00.000+03:30',
    //     endDate: '2025-10-27T22:00:00.000+03:30',
    //   },
    // );
    return {
      koshk1
      // jarghoyeh,
      // jarghoyeh3,
      // qom,
      // mehriz,
      // koshk1,
      // koshk2,
      // baft,
    };
  }
  // const isolation = await this.jarghoyeh1Service.isolationTodayLastValue()
  // const irradiance = this.jarghoyeh1Service.isolationTodayLastValue({} as EntityModel)
  // const isolation = await this.jarghoyehService.irradiationLastValue({} as EntityModel)
  // return isolation
  // const jarghoyeh = await this.jarghoyehService.plantActiveDuration()
  // const jarghoyeh1 = await this.jarghoyeh1Service.plantActiveDuration()
  // const jarghoyeh3 = await this.jarghoyeh3Service.plantActiveDuration()
  // const qom = await this.qomService.plantActiveDuration()
  // const mehriz = await this.mehrizService.plantActiveDuration()
  // const koshk1 = await this.koshk1Service.plantActiveDuration()
  // const koshk2 = await this.koshk2Service.plantActiveDuration()
  // return {
  //   jarghoyeh,jarghoyeh1,jarghoyeh3,qom,mehriz,koshk1,koshk2
  // }
  // const res = await this.initPlantService.getSources({
  //   plantUuid: '7439bd2e-f790-448a-aa65-29ea8012509c',
  // });
  // return res;
  // await this.plantService.fetchWithFleetByPlantId(1)
  // return await this.plantService.getPlants()
  // const entityField = {
  //   uuid: '39a6ab79-37f5-422e-a251-77ce3712476e',
  //   efId: 8951,
  //   fieldTag: 'power_str_18',
  //   maskFunction: null,
  //   nestLastValueFunctionName: 'stringPowerLastValue',
  //   nestAllValuesFunctionName: 'stringPowerAllValues',
  //   etId: 7,
  // } as EntityField;
  // const entity = {
  //   eId: 3,
  //   entityTag: 'jarghoyeh:Substation 1:Inverter 1',
  //   etId: 7,
  //   uuid: '76e394d6-05c5-40c5-8781-477beedac815',
  // } as EntityModel;
  // const lastValue =  await this.jarghoyehService.stringPowerLastValue(entity , entityField)
  // const allValues =  await this.jarghoyehService.stringPowerAllValues(entity , entityField ,  {
  //     mode: PeriodEnum.M,
  //     startDate: '2025-07-27T14:15:00.000+03:30',
  //     endDate: '2025-10-27T22:00:00.000+03:30',
  //   })
  //   return {lastValue , allValues}
  // return await this.jarghoyehService.inverterPowerTotalAllValues(
  //   entity,
  //   entityField,
  //   {
  //     mode: PeriodEnum.M,
  //     startDate: '2025-07-27T14:15:00.000+03:30',
  //     endDate: '2025-10-27T22:00:00.000+03:30',
  //   }
  // );
  // const country = await this.jarghoyeh1Service.substationPerformanceLastValue({entityTag  : 'jarghoyeh1:Substation 1:Inverter 1'} as EntityModel);
  // return country;
  // this.rabbitmqService.emit(NOTIFICATION_MAILER_WELCOME, {});
  // const jarghoyeh1 = await this.jarghoyeh1Service.performanceLastValue(
  //   {} as EntityModel
  // );
  // const powerFactor = await this.jarghoyeh1Service.powerFactorLastValue(
  //   {} as EntityModel
  // );
  //     const isolation = await this.jarghoyeh1Service.isolationTodayLastValue(
  //   {} as EntityModel
  // );
  //         const mod = await this.jarghoyeh1Service.modLastValue(
  //   {} as EntityModel
  // );
  // const jarghoyeh1 =
  //   await this.jarghoyeh1Service.substaionRawProductionEnergyLastValue({
  //     entityTag: 'jarghoyeh1:Substation 1:Inverter 1',
  //   } as EntityModel);
  // const jarghoyeh1Al =
  //   await this.jarghoyeh1Service.substaionRawProductionEnergyAllValues(
  //     { entityTag: 'jarghoyeh1:Substation 1:Inverter 1' } as EntityModel,
  //     { maskFunction: null } as EntityField,
  //     {
  //       mode: PeriodEnum.M,
  //       startDate: '2025-07-27T14:15:00.000+03:30',
  //       endDate: '2025-10-27T22:00:00.000+03:30',
  //     }
  //   );
  // return jarghoyeh1Al;
  // return { jarghoyeh1, jarghoyeh1Al };
  // const jarghoyeh2 = await this.jarghoyehService.fetchFullTreeData();
  // const jarghoyeh3 = await this.jarghoyeh3Service.fetchFullTreeData();
  // const koshk1 = await this.koshk1Service.fetchFullTreeData();
  // const koshk2 = await this.koshk2Service.fetchFullTreeData();
  // const qom = await this.qomService.fetchFullTreeData();
  // const mehriz = await this.mehrizService.fetchFullTreeData();
  // return {
  //   jarghoyeh1,
  //   jarghoyeh1Al,
  // jarghoyeh2,
  // jarghoyeh1performance,
  // jarghoyeh3,
  // qom,
  // mehriz,
  // koshk1,
  // koshk2,
  // };
  // const jarghoyeh =
  // await this.jarghoyehService.substaionRawProductionEnergyLastValue({entityTag : 'jarghoyeh:Substation 1:SmartLogger'} as EntityModel);
  // const jarghoyeh3 =
  //   await this.jarghoyeh3Service.substaionRawProductionEnergyLastValue({entityTag : 'jarghoyeh:Substation 1:SmartLogger'} as EntityModel);
  // const qom = await this.qomService.substaionRawProductionEnergyLastValue(
  //   {entityTag : 'jarghoyeh3:Substation 1:SmartLogger'} as EntityModel
  // );
  // const mehriz = await this.mehrizService.substaionRawProductionEnergyLastValue(
  //   {entityTag : 'mehriz:Substation 1:SmartLogger'} as EntityModel
  // );
  // const koshk1= await this.koshk1Service.substaionRawProductionEnergyLastValue(
  //   {entityTag : 'koshk1:Substation 1:SmartLogger'} as EntityModel
  // );
  // const koshk2 = await this.koshk2Service.substaionRawProductionEnergyLastValue(
  //   {entityTag : 'koshk2:Substation 1:SmartLogger'} as EntityModel
  // );
  // return {
  //   jarghoyeh,
  //   // jarghoyeh1performance,
  //   jarghoyeh3,
  //   qom,
  //   mehriz,
  //   koshk1,
  //   koshk2,
  // };
  // const jarghoyeh = await this.jarghoyehService.powerAllValues(
  //   {} as EntityModel,
  //   {} as EntityField,
  //         {mode: PeriodEnum.Default, startDate: '2025-10-20T14:15:00.000+03:30', endDate: '2025-10-20T22:00:00.000+03:30' }
  // );
  //    const koshk2 = await this.koshk2Service.powerAllValues(
  //   {} as EntityModel,
  //   {} as EntityField,
  //         {mode: PeriodEnum.Default, startDate: '2025-10-20T14:15:00.000+03:30', endDate: '2025-10-20T22:00:00.000+03:30' }
  // );
  //        const qom = await this.qomService.powerAllValues(
  //   {} as EntityModel,
  //   {} as EntityField,
  //         {mode: PeriodEnum.Default, startDate: '2025-10-20T14:15:00.000+03:30', endDate: '2025-10-20T22:00:00.000+03:30' }
  // );
  // return {jarghoyeh , qom , koshk2};
  // const powerLastValue = await this.mehrizService.powerLastValue(
  //   {} as EntityModel
  // );
  // const irradiationLastValue = await this.mehrizService.irradiationLastValue(
  //   {} as EntityModel
  // );
  // const energyExportTodayLastValue = await this.mehrizService.energyExportTodayLastValue(
  //   {} as EntityModel
  // );
  // const energyImportTodayLastValue =
  //   await this.mehrizService.energyImportTodayLastValue({} as EntityModel);
  // const performace = await this.mehrizService.performanceLastValue(
  //   {} as EntityModel
  // );
  // const substationPerformanceLastValue = await this.mehrizService.substationPerformanceLastValue({entityTag : 'Qom:substation 1:Inverter 1'} as EntityModel)
  // const powerFactorLastValue = await this.mehrizService.powerFactorLastValue({} as EntityModel)
  // const energyExportTotalLastValue = await this.mehrizService.energyExportTotalLastValue({} as EntityModel)
  // const energyImportTotalLastValue = await this.mehrizService.energyImportTodayLastValue({} as EntityModel)
  // const substationEnergyLossLessLastValue =await this.mehrizService.substationEnergyLossLessLastValue({entityTag : 'qom:Substation 1:SmartLogger'} as EntityModel)
  // const substationNetEnergyAfterLossesLastValue =await this.mehrizService.substationNetEnergyAfterLossesLastValue({entityTag : 'qom:PCC:MV POWER METER SUB 1'} as EntityModel)
  // const substationNetImportEnergyAfterLossesLastValue =await this.mehrizService.substationNetImportEnergyAfterLossesLastValue({entityTag : 'qom:PCC:MV POWER METER SUB 1'} as EntityModel)
  // const modLastValue = await this.mehrizService.modLastValue({} as EntityModel)
  // return {
  // energyExportTodayLastValue,
  // energyImportTodayLastValue,
  // performace,
  // irradiationLastValue,
  // powerLastValue,
  // substationPerformanceLastValue,
  // modLastValue ,
  // substationNetImportEnergyAfterLossesLastValue ,
  // substationNetEnergyAfterLossesLastValue,
  // powerFactorLastValue,
  // energyExportTotalLastValue,
  // substationEnergyLossLessLastValue,
  // energyImportTotalLastValue
  // };
  // const res = await this.mehrizService.irradiationAllValues({
  //   entityTag: 'asd',
  // } as EntityModel , {} as EntityField , {mode : PeriodEnum.Default , startDate : null , endDate : null});
  // return { res };
  // const j = await this.jarghoyehService.performanceLastValue({
  //   entityTag: 'asd',
  // } as EntityModel)
  //     const q = await this.mehrizService.performanceLastValue({
  //   entityTag: 'asd',
  // } as EntityModel)
  // return {j , q}
  // const jarghoyeh = await this.jarghoyehService.substaionNetEnergyTodayAllValues(
  //   { entityTag: 'koshk1:PCC:MV POWER METER SUB 1' } as EntityModel,
  //   { maskFunction: MaskFunctionsEnum.ReLU } as EntityField,
  //   {
  //     mode: PeriodEnum.D,
  //     startDate: '2024-10-24T06:15:00.000+03:30',
  //     endDate: '2025-10-25T22:00:00.000+03:30',
  //   }
  // );
  // const jarghoyeh3 = await this.jarghoyeh3Service.substaionNetEnergyTodayAllValues(
  //      { entityTag: 'koshk1:PCC:MV POWER METER SUB 1' } as EntityModel,
  //   { maskFunction: MaskFunctionsEnum.ReLU } as EntityField,
  //   {
  //     mode: PeriodEnum.D,
  //     startDate: '2024-10-24T06:15:00.000+03:30',
  //     endDate: '2025-10-25T22:00:00.000+03:30',
  //   }
  // );
  // const qom = await this.qomService.substaionNetEnergyTodayAllValues(
  //       { entityTag: 'koshk1:PCC:MV POWER METER SUB 1' } as EntityModel,
  //   { maskFunction: MaskFunctionsEnum.ReLU } as EntityField,
  //   {
  //     mode: PeriodEnum.D,
  //     startDate: '2024-10-24T06:15:00.000+03:30',
  //     endDate: '2025-10-25T22:00:00.000+03:30',
  //   }
  // );
  // const mehriz = await this.mehrizService.substaionNetEnergyTodayAllValues(
  //        { entityTag: 'koshk1:PCC:MV POWER METER SUB 1' } as EntityModel,
  //   { maskFunction: MaskFunctionsEnum.ReLU } as EntityField,
  //   {
  //     mode: PeriodEnum.D,
  //     startDate: '2024-10-24T06:15:00.000+03:30',
  //     endDate: '2025-10-25T22:00:00.000+03:30',
  //   }
  // );
  // const koshk1 = await this.koshk1Service.substaionNetEnergyTodayAllValues(
  //      { entityTag: 'koshk1:PCC:MV POWER METER SUB 1' } as EntityModel,
  //   { maskFunction: MaskFunctionsEnum.ReLU } as EntityField,
  //   {
  //     mode: PeriodEnum.D,
  //     startDate: '2024-10-24T06:15:00.000+03:30',
  //     endDate: '2025-10-25T22:00:00.000+03:30',
  //   }
  // );
  // return { mehriz, koshk1 };
  // return koshk1
  // return koshk1;
  // const koshk2 = await this.koshk2Service.substaionNetEnergyTodayAllValues(
  //   { entityTag: 'koshk1:PCC:MV POWER METER SUB 1' } as EntityModel,
  //   { maskFunction: MaskFunctionsEnum.ReLU } as EntityField,
  //   {
  //     mode: PeriodEnum.C,
  //     startDate: '2025-10-24T06:15:00.000+03:30',
  //     endDate: '2025-10-25T22:00:00.000+03:30',
  //   }
  // );
  // return koshk2;
  // return { jarghoyeh, jarghoyeh3, qom, mehriz, koshk1, koshk2 };
  // const qom = await this.qomService.energyExportTodayAllValues(
  //   { entityTag: 'qom:Substation 1:SmartLogger' } as EntityModel,
  //   { maskFunction: MaskFunctionsEnum.ReLUReverse } as EntityField,
  //   {
  //     mode: PeriodEnum.C,
  //     startDate: '2025-10-20T14:15:00.000+03:30',
  //     endDate: '2025-10-20T22:00:00.000+03:30',
  //   }
  // );
  // const koshk2 = await this.koshk2Service.energyExportTodayAllValues(
  //   { entityTag: 'koshk2:Substation 1:SmartLogger' } as EntityModel,
  //   { maskFunction: MaskFunctionsEnum.ReLUReverse } as EntityField,
  //   {
  //     mode: PeriodEnum.C,
  //     startDate: '2025-10-20T14:15:00.000+03:30',
  //     endDate: '2025-10-20T22:00:00.000+03:30',
  //   }
  // );
  // const koshk1 = await this.koshk1Service.energyExportTodayAllValues(
  //   { entityTag: 'koshk1:Substation 1:SmartLogger' } as EntityModel,
  //   { maskFunction: MaskFunctionsEnum.ReLU } as EntityField,
  //   {
  //     mode: PeriodEnum.C,
  //     startDate: '2025-10-20T14:15:00.000+03:30',
  //     endDate: '2025-10-20T22:00:00.000+03:30',
  //   }
  // );
  // // return {koshk1 , koshk2}
  // const mehriz = await this.mehrizService.energyExportTodayAllValues(
  //   { entityTag: 'jarghoyeh:Substation 1:SmartLogger' } as EntityModel,
  //   { maskFunction: MaskFunctionsEnum.ReLUReverse } as EntityField,
  //   {
  //     mode: PeriodEnum.C,
  //     startDate: '2025-10-20T14:15:00.000+03:30',
  //     endDate: '2025-10-20T22:00:00.000+03:30',
  //   }
  // );
  // const jarghoyeh3 =
  //   await this.jarghoyeh3Service.energyExportTodayAllValues(
  //     { entityTag: 'jarghoyeh3:Substation 1:SmartLogger' } as EntityModel,
  //     { maskFunction: MaskFunctionsEnum.ReLUReverse } as EntityField,
  //     {
  //       mode: PeriodEnum.C,
  //       startDate: '2025-10-20T14:15:00.000+03:30',
  //       endDate: '2025-10-20T22:00:00.000+03:30',
  //     }
  //   );
  // return { jarghoyeh, jarghoyeh3, mehriz, qom, koshk2, koshk1 };
  // return {jarghoyeh}
  // const qom = await this.qomService.isolationTodayLastValueasdadsad({} as EntityModel)
  // return qom
  // }
}
