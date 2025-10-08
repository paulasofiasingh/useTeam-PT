import { Injectable, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BoardsService } from '../boards/boards.service';
import { ExportBacklogDto } from './dto/export-backlog.dto';

@Injectable()
export class ExportService {
  private readonly n8nWebhookUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly boardsService: BoardsService,
  ) {
    this.n8nWebhookUrl = this.configService.get<string>('N8N_WEBHOOK_URL') || 'http://localhost:5678/webhook/kanban-export';
  }

  async exportBacklog(exportBacklogDto: ExportBacklogDto): Promise<any> {
    try {
      // Obtener datos del tablero
      const board = await this.boardsService.findOne(exportBacklogDto.boardId);
      
      if (!board) {
        throw new NotFoundException(`Board with ID ${exportBacklogDto.boardId} not found`);
      }

      // Preparar datos para N8N
      const exportData = {
        boardId: exportBacklogDto.boardId,
        boardName: exportBacklogDto.boardName || board.name,
        emailTo: exportBacklogDto.emailTo,
        includeArchived: exportBacklogDto.includeArchived || false,
        boardData: {
          name: board.name,
          description: board.description,
          createdAt: (board as any).createdAt,
          updatedAt: (board as any).updatedAt,
          columns: board.columns.map((column: any) => ({
            id: column._id,
            name: column.name,
            description: column.description,
            position: column.position,
            color: column.color,
            cards: column.cards.map((card: any) => ({
              id: card._id,
              title: card.title,
              description: card.description,
              priority: card.priority,
              assignedTo: card.assignedTo,
              dueDate: card.dueDate,
              tags: card.tags,
              position: card.position,
              createdAt: (card as any).createdAt,
              updatedAt: (card as any).updatedAt,
            }))
          }))
        }
      };

      // Enviar datos a N8N
      const response = await fetch(this.n8nWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(exportData),
      });

      if (!response.ok) {
        throw new HttpException(
          'Error al procesar la exportación en N8N',
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }

      const result = await response.json();

      return {
        success: true,
        message: 'Exportación iniciada exitosamente',
        data: {
          boardId: exportBacklogDto.boardId,
          boardName: exportBacklogDto.boardName || board.name,
          emailTo: exportBacklogDto.emailTo,
          totalCards: board.columns.reduce((total, column: any) => total + column.cards.length, 0),
          totalColumns: board.columns.length,
          exportDate: new Date().toISOString(),
          n8nResponse: result
        }
      };

    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new HttpException(
        `Error al exportar backlog: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
