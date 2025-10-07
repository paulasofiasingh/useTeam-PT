import { IsString, IsOptional, IsEmail, IsBoolean } from 'class-validator';

export class ExportBacklogDto {
  @IsString()
  boardId: string;

  @IsEmail()
  emailTo: string;

  @IsOptional()
  @IsString()
  boardName?: string;

  @IsOptional()
  @IsBoolean()
  includeArchived?: boolean;
}
