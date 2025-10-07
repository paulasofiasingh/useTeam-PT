import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ColumnDocument = Column & Document;

@Schema({ timestamps: true })
export class Column {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ trim: true })
  description: string;

  @Prop({ type: String, ref: 'Board', required: true })
  boardId: string;

  @Prop({ type: [{ type: String, ref: 'Card' }], default: [] })
  cards: string[];

  @Prop({ default: 0 })
  position: number;

  @Prop({ default: '#6B7280' })
  color: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const ColumnSchema = SchemaFactory.createForClass(Column);
