import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Card, CardDocument } from './schemas/card.schema';
import { Column, ColumnDocument } from '../columns/schemas/column.schema';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { MoveCardDto } from './dto/move-card.dto';
import { WebSocketGateway } from '../websocket/websocket.gateway';

@Injectable()
export class CardsService {
  constructor(
    @InjectModel(Card.name) private cardModel: Model<CardDocument>,
    @InjectModel(Column.name) private columnModel: Model<ColumnDocument>,
    @Inject(forwardRef(() => WebSocketGateway))
    private webSocketGateway: WebSocketGateway,
  ) {}

  async create(createCardDto: CreateCardDto): Promise<Card> {
    console.log('Creating card with data:', createCardDto);
    const createdCard = new this.cardModel(createCardDto);
    const savedCard = await createdCard.save();
    console.log('Card created successfully:', savedCard);
    
    // Agregar la tarjeta al array de cards de la columna
    await this.columnModel.findByIdAndUpdate(
      createCardDto.columnId,
      { $push: { cards: savedCard._id } },
      { new: true }
    );
    console.log('Card added to column array');
    
    // Emitir evento WebSocket para notificar a otros usuarios
    this.webSocketGateway.server.emit('card-created', {
      card: savedCard,
      columnId: createCardDto.columnId,
      boardId: createCardDto.boardId
    });
    
    return savedCard;
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

    // Emitir evento WebSocket para notificar a otros usuarios
    this.webSocketGateway.server.emit('card-updated', {
      cardId: id,
      updates: updateCardDto,
      boardId: updatedCard.boardId
    });

    return updatedCard;
  }

  async move(id: string, moveCardDto: MoveCardDto): Promise<Card> {
    const { targetColumnId, newPosition } = moveCardDto;
    
    const card = await this.cardModel.findById(id).exec();
    if (!card) {
      throw new NotFoundException(`Card with ID ${id} not found`);
    }

    // Si la tarjeta se mueve a una columna diferente
    if (card.columnId !== targetColumnId) {
      // Remover de la columna original
      await this.columnModel.findByIdAndUpdate(
        card.columnId,
        { $pull: { cards: id } },
        { new: true }
      );
      
      // Agregar a la nueva columna
      await this.columnModel.findByIdAndUpdate(
        targetColumnId,
        { $push: { cards: id } },
        { new: true }
      );
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

    // Emitir evento WebSocket para notificar a otros usuarios
    this.webSocketGateway.server.emit('card-moved', {
      cardId: id,
      targetColumnId,
      newPosition: newPosition || 0,
      boardId: updatedCard.boardId
    });

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

    // Remover la tarjeta del array de cards de la columna
    await this.columnModel.findByIdAndUpdate(
      result.columnId,
      { $pull: { cards: id } },
      { new: true }
    );
    console.log('Card removed from column array');

    // Emitir evento WebSocket para notificar a otros usuarios
    this.webSocketGateway.server.emit('card-deleted', {
      cardId: id,
      boardId: result.boardId
    });
  }
}
