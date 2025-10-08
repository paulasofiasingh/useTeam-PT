import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Board, BoardDocument } from './schemas/board.schema';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';

@Injectable()
export class BoardsService {
  constructor(
    @InjectModel(Board.name) private boardModel: Model<BoardDocument>,
  ) {}

  async create(createBoardDto: CreateBoardDto): Promise<Board> {
    console.log('Creating board with data:', createBoardDto);
    const createdBoard = new this.boardModel(createBoardDto);
    const savedBoard = await createdBoard.save();
    console.log('Board created successfully:', savedBoard);
    return savedBoard;
  }

  async findAll(): Promise<Board[]> {
    console.log('Finding all boards...');
    const boards = await this.boardModel
      .find({ isActive: true })
      .populate({
        path: 'columns',
        match: { isActive: true },
        populate: {
          path: 'cards',
          match: { isActive: true },
          options: { sort: { position: 1 } }
        },
        options: { sort: { position: 1 } }
      })
      .sort({ createdAt: -1 })
      .exec();

    // No need for manual population since we're using populate in the query

    console.log('Found boards:', boards.length, boards);
    return boards;
  }

  async findOne(id: string): Promise<Board> {
    return this.getBoardWithFullData(id);
  }

  async update(id: string, updateBoardDto: UpdateBoardDto): Promise<Board> {
    const updatedBoard = await this.boardModel
      .findByIdAndUpdate(id, updateBoardDto, { new: true })
      .exec();

    if (!updatedBoard) {
      throw new NotFoundException(`Board with ID ${id} not found`);
    }

    return updatedBoard;
  }

  async remove(id: string): Promise<void> {
    const result = await this.boardModel.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    ).exec();

    if (!result) {
      throw new NotFoundException(`Board with ID ${id} not found`);
    }
  }

  async getBoardWithFullData(id: string): Promise<any> {
    const board = await this.boardModel
      .findById(id)
      .populate({
        path: 'columns',
        match: { isActive: true },
        populate: {
          path: 'cards',
          match: { isActive: true },
          options: { sort: { position: 1 } }
        },
        options: { sort: { position: 1 } }
      })
      .exec();

    if (!board) {
      throw new NotFoundException(`Board with ID ${id} not found`);
    }

    return board;
  }
}
