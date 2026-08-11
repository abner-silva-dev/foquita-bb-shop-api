import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Product } from '../../products/schemas/product.schema';

export type VariantDocument = HydratedDocument<Variant>;

@Schema({ timestamps: true })
export class Variant {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  })
  product!: Product;

  @Prop({ required: true })
  price!: number;

  @Prop({ default: 0 })
  stock!: number;

  @Prop({ required: true })
  image!: string;

  @Prop({ type: Map, of: String, default: {} })
  attributes!: Record<string, string>;
}

export const VariantSchema = SchemaFactory.createForClass(Variant);
