import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Category,
  CategoryDocument,
} from '../categories/schemas/category.schema';
import { Variant, VariantDocument } from '../variants/schemas/variant.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { Product, ProductDocument } from './schemas/product.schema';

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

type CatalogOption = {
  label: string;
  value: string;
};

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    @InjectModel(Variant.name)
    private readonly variantModel: Model<VariantDocument>,
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
  ) {}

  async findAll(): Promise<Product[]> {
    return this.productModel.find().exec();
  }

  async getCategories(): Promise<CatalogOption[]> {
    return this.productModel
      .aggregate<CatalogOption>([
        {
          $group: {
            _id: '$category',
          },
        },
        {
          $lookup: {
            from: 'categories',
            localField: '_id',
            foreignField: '_id',
            as: 'category',
          },
        },
        { $unwind: '$category' },
        { $match: { 'category.isActive': true } },
        { $sort: { 'category.name': 1 } },
        {
          $project: {
            _id: 0,
            label: '$category.name',
            value: { $toString: '$category._id' },
          },
        },
      ])
      .exec();
  }

  async create(createProductDto: CreateProductDto): Promise<ProductDocument> {
    const categoryId = await this.resolveCategory(createProductDto.category);
    const { variants = [], ...productData } = createProductDto;
    const product = await this.productModel.create({
      ...productData,
      category: categoryId,
    });

    const variantsToCreate = variants.map((variant) => ({
      ...variant,
      product: product._id,
    }));

    const createdVariants =
      variantsToCreate.length > 0
        ? await this.variantModel.insertMany(variantsToCreate)
        : [];

    product.variants = createdVariants.map((variant) => variant._id);
    await product.save();

    return product;
  }

  private async resolveCategory(
    categoryInput: string | Types.ObjectId | undefined,
  ): Promise<Types.ObjectId> {
    if (!categoryInput) {
      throw new BadRequestException('Category is required');
    }

    if (categoryInput instanceof Types.ObjectId) {
      return categoryInput;
    }

    if (Types.ObjectId.isValid(categoryInput)) {
      return new Types.ObjectId(categoryInput);
    }

    const category = await this.categoryModel
      .findOne({
        name: { $regex: `^${escapeRegExp(categoryInput)}$`, $options: 'i' },
      })
      .exec();

    if (!category) {
      throw new BadRequestException(
        `Category "${categoryInput}" was not found`,
      );
    }

    return category._id;
  }
}
