import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { unlink } from 'fs/promises';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductsService } from './products.services';
import { Product } from './schemas/product.schema';

type ProductUploadFiles = {
  productImage?: Express.Multer.File[];
  variantImages?: Express.Multer.File[];
};

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('catalog/categories')
  getCategories() {
    return this.productsService.getCategories();
  }

  @Get()
  findAll(): Promise<Product[]> {
    return this.productsService.findAll();
  }

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'productImage', maxCount: 1 },
        { name: 'variantImages', maxCount: 50 },
      ],
      {
        storage: diskStorage({
          destination: './uploads/products',
          filename: (_req, file, callback) => {
            const uniqueName = `${Date.now()}-${Math.round(
              Math.random() * 1e9,
            )}${extname(file.originalname)}`;

            callback(null, uniqueName);
          },
        }),
        fileFilter: (_req, file, callback) => {
          if (!file.mimetype.startsWith('image/')) {
            return callback(
              new BadRequestException('Only image files are allowed'),
              false,
            );
          }

          callback(null, true);
        },
      },
    ),
  )
  create(
    @Body('data') data: string,
    @UploadedFiles() files: ProductUploadFiles,
  ) {
    const createProductDto = this.buildCreateProductDto(data, files);

    return this.productsService
      .create(createProductDto)
      .catch(async (error) => {
        await this.removeUploadedFiles(files);
        throw error;
      });
  }

  private buildCreateProductDto(
    data: string,
    files: ProductUploadFiles,
  ): CreateProductDto {
    if (!data) {
      throw new BadRequestException('Product data is required');
    }

    const productImage = files.productImage?.[0];
    const variantImages = files.variantImages ?? [];

    if (!productImage) {
      throw new BadRequestException('Product image is required');
    }

    const createProductDto = this.parseProductData(data);

    if (createProductDto.variants.length !== variantImages.length) {
      throw new BadRequestException('Each variant must have exactly one image');
    }

    return {
      ...createProductDto,
      image: productImage.filename,
      variants: createProductDto.variants.map((variant, index) => ({
        ...variant,
        image: variantImages[index].filename,
      })),
    };
  }

  private parseProductData(data: string): CreateProductDto {
    try {
      const parsedData = JSON.parse(data) as CreateProductDto;

      if (!Array.isArray(parsedData.variants)) {
        throw new BadRequestException('Variants must be an array');
      }

      return parsedData;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException('Invalid product data JSON');
    }
  }

  private async removeUploadedFiles(files: ProductUploadFiles): Promise<void> {
    const uploadedFiles = [
      ...(files.productImage ?? []),
      ...(files.variantImages ?? []),
    ];

    await Promise.all(
      uploadedFiles.map((file) => unlink(file.path).catch(() => undefined)),
    );
  }
}
