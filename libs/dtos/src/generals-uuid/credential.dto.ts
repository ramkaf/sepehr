import { IsString, IsNotEmpty } from 'class-validator';

export class CredentialDto {
  @IsString()
  @IsNotEmpty()
  credential: string;
}
