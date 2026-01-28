import { FieldTagDto, UniqueCompositeFields } from '../generals';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsUUID, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class InitPlantNonComputationalParametersDto {
  @ApiProperty({
    example: '88c49867-d730-46f2-8831-8d9a89a34f9f',
    description: 'UUID of the plant',
  })
  @IsUUID()
  @IsNotEmpty()
  plantUuid: string;

  @ApiProperty({
    description: 'UUID of the Entity Type',
    example: 'a6232f52-793b-4848-b7ec-7842de60789f',
  })
  @IsUUID()
  @IsNotEmpty()
  etUuid: string;

  @ApiProperty({
    description:
      'List of plant entities with their names, tags, and entity type UUIDs',
    type: [FieldTagDto],
    example: [
      {
        fieldTag: 'Peak_active_power_of_current_day',
      },
      {
        fieldTag: 'Phase_A_current',
      },
      {
        fieldTag: 'Phase_A_voltage',
      },
      {
        fieldTag: 'Phase_B_current',
      },
      {
        fieldTag: 'Phase_B_voltage',
      },
      {
        fieldTag: 'Phase_C_current',
      },
      {
        fieldTag: 'Phase_C_voltage',
      },
      {
        fieldTag: 'Power_factor',
      },
      {
        fieldTag: 'PV1_current',
      },
      {
        fieldTag: 'PV1_voltage',
      },
      {
        fieldTag: 'PV2_current',
      },
      {
        fieldTag: 'PV2_voltage',
      },
      {
        fieldTag: 'PV3_current',
      },
      {
        fieldTag: 'PV3_voltage',
      },
      {
        fieldTag: 'PV4_current',
      },
      {
        fieldTag: 'PV4_voltage',
      },
      {
        fieldTag: 'PV5_current',
      },
      {
        fieldTag: 'PV5_voltage',
      },
      {
        fieldTag: 'PV6_current',
      },
      {
        fieldTag: 'PV6_voltage',
      },
      {
        fieldTag: 'PV7_current',
      },
      {
        fieldTag: 'PV7_voltage',
      },
      {
        fieldTag: 'PV8_current',
      },
      {
        fieldTag: 'PV8_voltage',
      },
      {
        fieldTag: 'PV9_current',
      },
      {
        fieldTag: 'PV9_voltage',
      },
      {
        fieldTag: 'PV10_current',
      },
      {
        fieldTag: 'PV10_voltage',
      },
      {
        fieldTag: 'PV11_current',
      },
      {
        fieldTag: 'PV11_voltage',
      },
      {
        fieldTag: 'PV12_current',
      },
      {
        fieldTag: 'PV12_voltage',
      },
      {
        fieldTag: 'PV13_current',
      },
      {
        fieldTag: 'PV13_voltage',
      },
      {
        fieldTag: 'PV14_current',
      },
      {
        fieldTag: 'PV14_voltage',
      },
      {
        fieldTag: 'PV15_current',
      },
      {
        fieldTag: 'PV15_voltage',
      },
      {
        fieldTag: 'PV16_current',
      },
      {
        fieldTag: 'PV16_voltage',
      },
      {
        fieldTag: 'PV17_current',
      },
      {
        fieldTag: 'PV17_voltage',
      },
      {
        fieldTag: 'PV18_current',
      },
      {
        fieldTag: 'PV18_voltage',
      },
      {
        fieldTag: 'PV19_current',
      },
      {
        fieldTag: 'PV19_voltage',
      },
      {
        fieldTag: 'PV20_current',
      },
      {
        fieldTag: 'PV20_voltage',
      },
      {
        fieldTag: 'Rated_power_(Pn)',
      },
      {
        fieldTag: 'Reactive_power',
      },
      {
        fieldTag: 'Shutdown_time',
      },
      {
        fieldTag: 'Smart_IV_Curve_Diagnosis_Authorizatio_n_function',
      },
      {
        fieldTag: 'Model_ID2',
      },
      {
        fieldTag: 'Number_of_MPP_trackers',
      },
      {
        fieldTag: 'Number_of_PV_strings',
      },
      {
        fieldTag: 'PN',
      },
      {
        fieldTag: 'Smart_IV_Curve_Diagnosis_License_expiration_time',
      },
      {
        fieldTag: 'Smart_IV_Curve_Diagnosis_License_status',
      },
      {
        fieldTag: 'SN',
      },
      {
        fieldTag: 'Startup_time',
      },
      {
        fieldTag: 'Total_number_of_ptimizers',
      },
      {
        fieldTag: 'Accumulate_d_energy_yield',
      },
      {
        fieldTag: 'Active_power',
      },
      {
        fieldTag: 'Daily_energy_yield',
      },
      {
        fieldTag: 'Efficiency',
      },
      {
        fieldTag: 'Grid_frequency',
      },
      {
        fieldTag: 'Input_power',
      },
      {
        fieldTag: 'Insulation_resistance',
      },
      {
        fieldTag: 'Internal_temperature',
      },
      {
        fieldTag: 'Line_voltage_AB',
      },
      {
        fieldTag: 'Line_voltage_BC',
      },
      {
        fieldTag: 'Line_voltage_CA',
      },
      {
        fieldTag: 'Maximum_active_power_Pmax',
      },
      {
        fieldTag: 'Maximum_apparent_power_Smax',
      },
      {
        fieldTag: 'Maximum_reactive_power_(Qmax,_absorbed_from_the_power_grid)',
      },
      {
        fieldTag: 'Maximum_reactive_power_Qmax_fed_to_the_power_grid',
      },
      {
        fieldTag: 'DateTime',
      },
      {
        fieldTag: 'DeviceName',
      },
      {
        fieldTag: 'Alarm_1',
      },
      {
        fieldTag: 'Model_ID',
      },
      {
        fieldTag: 'Alarm_2',
      },
      {
        fieldTag: 'Device_status',
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FieldTagDto)
  @UniqueCompositeFields(['fieldTag'])
  data: FieldTagDto[];
}
