import { IsString, IsOptional, MinLength, MaxLength, IsEmail } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(2)
  @MaxLength(20)
  username: string;

  @IsString()
  @MinLength(2)
  @MaxLength(30)
  displayName: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  color?: string;
}
