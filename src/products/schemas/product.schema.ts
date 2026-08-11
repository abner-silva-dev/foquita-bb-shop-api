import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type ProductDocument = HydratedDocument<Product>;

@Schema({ timestamps: true })
export class Product {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  })
  category!: mongoose.Types.ObjectId;

  @Prop({ required: true })
  name!: string;

  @Prop()
  description?: string;

  @Prop({ required: true })
  image!: string;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Variant' }],
    default: [],
  })
  variants!: mongoose.Types.ObjectId[];
}

export const ProductSchema = SchemaFactory.createForClass(Product);
