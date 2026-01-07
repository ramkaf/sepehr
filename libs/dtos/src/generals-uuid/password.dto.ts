import { Matches, IsNotEmpty } from 'class-validator';

export class PasswordDto {
  @IsNotEmpty()
  @Matches(/^(?=.*\d)[A-Za-z\d]{8,}$/, {
    message:
      'Password must be at least 8 characters long and contain at least one number',
  })
  password: string;
}
