import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Column, ColumnDocument } from './schemas/column.schema';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';

@Injectable()
export class ColumnsService {
  constructor(
    @InjectModel(Column.name) private columnModel: Model<ColumnDocument>,
  ) {}

  async create(createColumnDto: CreateColumnDto): Promise<Column> {
    const createdColumn = new this.columnModel(createColumnDto);
    return createdColumn.save();
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
  }
}
