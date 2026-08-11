import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Variant, VariantDocument } from './schemas/variant.schema';

@Injectable()
export class VariantsService {
  constructor(
    @InjectModel(Variant.name)
    private readonly variantModel: Model<VariantDocument>,
  ) {}

  async findAll(): Promise<Variant[]> {
    return this.variantModel.find().exec();
  }
}
