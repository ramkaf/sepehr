import { IsNotEmpty, IsUUID } from 'class-validator';

export class PlantIdDto {
  @IsNotEmpty()
  @IsUUID()
  plant_id: string;
}
