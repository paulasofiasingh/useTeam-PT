import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Column, ColumnDocument } from './schemas/column.schema';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';
import { Board, BoardDocument } from '../boards/schemas/board.schema';
import { WebSocketGateway } from '../websocket/websocket.gateway';

@Injectable()
export class ColumnsService {
  constructor(
    @InjectModel(Column.name) private columnModel: Model<ColumnDocument>,
    @InjectModel(Board.name) private boardModel: Model<BoardDocument>,
    @Inject(forwardRef(() => WebSocketGateway))
    private webSocketGateway: WebSocketGateway,
  ) {
    console.log('🔌 ColumnsService constructor - WebSocketGateway:', !!this.webSocketGateway);
  }

  async create(createColumnDto: CreateColumnDto): Promise<Column> {
    console.log('Creating column with data:', createColumnDto);
    const createdColumn = new this.columnModel(createColumnDto);
    const savedColumn = await createdColumn.save();
    console.log('Column created successfully:', savedColumn);
    
    // Actualizar el tablero para incluir la nueva columna
    await this.boardModel.findByIdAndUpdate(
      createColumnDto.boardId,
      { $push: { columns: savedColumn._id } },
      { new: true }
    );
    console.log('Board updated with new column');
    
    // Emitir evento WebSocket para notificar a otros usuarios
console.log('🔌 WebSocketGateway server:', !!this.webSocketGateway.server);
this.webSocketGateway.server.emit('column-created', {
  column: savedColumn,
  boardId: createColumnDto.boardId
});

    return savedColumn;
  }

  async findAll(): Promise<Column[]> {
    return this.columnModel
      .find({ isActive: true })
      .populate('cards')
      .sort({ position: 1 })
      .exec();
  }

  async findByBoard(boardId: string): Promise<Column[]> {
    return this.columnModel
      .find({ boardId, isActive: true })
      .populate('cards')
      .sort({ position: 1 })
      .exec();
  }

  async findOne(id: string): Promise<Column> {
    const column = await this.columnModel
      .findById(id)
      .populate('cards')
      .exec();

    if (!column) {
      throw new NotFoundException(`Column with ID ${id} not found`);
    }

    return column;
  }

  async update(id: string, updateColumnDto: UpdateColumnDto): Promise<Column> {
    const updatedColumn = await this.columnModel
      .findByIdAndUpdate(id, updateColumnDto, { new: true })
      .exec();

    if (!updatedColumn) {
      throw new NotFoundException(`Column with ID ${id} not found`);
    }

    // Emitir evento WebSocket para notificar a otros usuarios
    this.webSocketGateway.server.emit('column-updated', {
      column: updatedColumn,
      boardId: updatedColumn.boardId
    });

    return updatedColumn;
  }

  async remove(id: string): Promise<void> {
    const result = await this.columnModel.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    ).exec();

    if (!result) {
      throw new NotFoundException(`Column with ID ${id} not found`);
    }

    // Emitir evento WebSocket para notificar a otros usuarios
    this.webSocketGateway.server.emit('column-deleted', {
      columnId: id,
      boardId: result.boardId
    });
  }
}
