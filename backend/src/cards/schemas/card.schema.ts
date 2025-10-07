import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CardDocument = Card & Document;

@Schema({ timestamps: true })
export class Card {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ trim: true })
  description: string;

  @Prop({ type: String, ref: 'Column', required: true })
  columnId: string;

  @Prop({ type: String, ref: 'Board', required: true })
  boardId: string;

  @Prop({ default: 0 })
  position: number;

  @Prop({ 
    type: String, 
    enum: ['low', 'medium', 'high', 'urgent'], 
    default: 'medium' 
  })
  priority: string;

  @Prop({ trim: true })
  assignedTo: string;

  @Prop({ default: null })
  dueDate: Date;

  @Prop({ default: [] })
  tags: string[];

  @Prop({ default: true })
  isActive: boolean;
}

export const CardSchema = SchemaFactory.createForClass(Card);
