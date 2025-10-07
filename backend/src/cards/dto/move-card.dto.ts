import { IsString, IsNumber, IsOptional } from 'class-validator';

export class MoveCardDto {
  @IsString()
  targetColumnId: string;

  @IsOptional()
  @IsNumber()
  newPosition?: number;
}
