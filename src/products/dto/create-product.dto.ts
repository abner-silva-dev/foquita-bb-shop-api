export class CreateVariantDto {
  sku?: string;
  price!: number;
  stock?: number;
  image?: string;
  attributes?: Record<string, string>;
}

export class CreateProductDto {
  name!: string;
  description?: string;
  category!: string;
  image?: string;
  variants!: CreateVariantDto[];
}
