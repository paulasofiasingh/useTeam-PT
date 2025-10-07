import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Card, CardDocument } from './schemas/card.schema';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { MoveCardDto } from './dto/move-card.dto';

@Injectable()
export class CardsService {
  constructor(
    @InjectModel(Card.name) private cardModel: Model<CardDocument>,
  ) {}

  async create(createCardDto: CreateCardDto): Promise<Card> {
    const createdCard = new this.cardModel(createCardDto);
    return createdCard.save();
  }

  async findAll(): Promise<Card[]> {
    return this.cardModel
      .find({ isActive: true })
      .sort({ position: 1 })
      .exec();
  }

  async findByColumn(columnId: string): Promise<Card[]> {
    return this.cardModel
      .find({ columnId, isActive: true })
      .sort({ position: 1 })
      .exec();
  }

  async findByBoard(boardId: string): Promise<Card[]> {
    return this.cardModel
      .find({ boardId, isActive: true })
      .sort({ position: 1 })
      .exec();
  }

  async findOne(id: string): Promise<Card> {
    const card = await this.cardModel.findById(id).exec();

    if (!card) {
      throw new NotFoundException(`Card with ID ${id} not found`);
    }

    return card;
  }

  async update(id: string, updateCardDto: UpdateCardDto): Promise<Card> {
    const updatedCard = await this.cardModel
      .findByIdAndUpdate(id, updateCardDto, { new: true })
      .exec();

    if (!updatedCard) {
      throw new NotFoundException(`Card with ID ${id} not found`);
    }

    return updatedCard;
  }

  async move(id: string, moveCardDto: MoveCardDto): Promise<Card> {
    const { targetColumnId, newPosition } = moveCardDto;
    
    const card = await this.cardModel.findById(id).exec();
    if (!card) {
      throw new NotFoundException(`Card with ID ${id} not found`);
    }

    // Actualizar la tarjeta con la nueva columna y posición
    const updatedCard = await this.cardModel
      .findByIdAndUpdate(
        id,
        {
          columnId: targetColumnId,
          position: newPosition || 0,
        },
        { new: true }
      )
      .exec();

    if (!updatedCard) {
      throw new NotFoundException(`Card with ID ${id} not found`);
    }

    return updatedCard;
  }

  async remove(id: string): Promise<void> {
    const result = await this.cardModel.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    ).exec();

    if (!result) {
      throw new NotFoundException(`Card with ID ${id} not found`);
    }
  }
}
