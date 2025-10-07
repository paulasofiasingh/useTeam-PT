import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ExportService } from './export.service';
import { ExportBacklogDto } from './dto/export-backlog.dto';

@Controller('export')
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Post('backlog')
  @HttpCode(HttpStatus.OK)
  async exportBacklog(@Body() exportBacklogDto: ExportBacklogDto) {
    return this.exportService.exportBacklog(exportBacklogDto);
  }
}
