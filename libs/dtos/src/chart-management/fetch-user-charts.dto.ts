import { IntersectionType } from '@nestjs/swagger';
import { PlantUuidDto } from '../generals-uuid';
import { UserUuidDto } from '../generals-uuid/user-uuid.dto';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class FetchPlantUserDependencyDto extends IntersectionType(
  PlantUuidDto,
  UserUuidDto,
) {
  //       @ApiProperty({
  //     example: '88c49867-d730-46f2-8831-8d9a89a34f9f',
  //     description: 'UUID of the plant',
  //   })
  //   @IsUUID()
  //   @IsNotEmpty()
  //   plantUuid: string;
  //       @IsString()
  //       @IsNotEmpty()
  //       @Matches(/^\S*$/, { message: 'key should not contain spaces' })
  //       userUuid: string;
}
