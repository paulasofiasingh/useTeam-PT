import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BoardDocument = Board & Document;

@Schema({ timestamps: true })
export class Board {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ trim: true })
  description: string;

  @Prop({ type: [{ type: String, ref: 'Column' }], default: [] })
  columns: string[];

  @Prop({ default: '#3B82F6' })
  color: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const BoardSchema = SchemaFactory.createForClass(Board);
