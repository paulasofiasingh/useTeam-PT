import { IsString, IsOptional, IsHexColor, IsBoolean, IsNumber } from 'class-validator';

export class CreateColumnDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  boardId: string;

  @IsOptional()
  @IsNumber()
  position?: number;

  @IsOptional()
  @IsHexColor()
  color?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
