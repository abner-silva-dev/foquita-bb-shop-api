import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Category, CategorySchema } from '../categories/schemas/category.schema';
import { Variant, VariantSchema } from '../variants/schemas/variant.schema';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.services';
import { Product, ProductSchema } from './schemas/product.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: Variant.name, schema: VariantSchema },
      { name: Category.name, schema: CategorySchema },
    ]),
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
