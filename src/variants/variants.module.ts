import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Variant, VariantSchema } from './schemas/variant.schema';
import { VariantsController } from './variants.controller';
import { VariantsService } from './variants.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Variant.name, schema: VariantSchema }]),
  ],
  controllers: [VariantsController],
  providers: [VariantsService],
})
export class VariantsModule {}
