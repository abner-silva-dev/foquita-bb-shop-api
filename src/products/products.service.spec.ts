import { Types } from 'mongoose';
import { ProductsService } from './products.services';

describe('ProductsService', () => {
  it('resolves the category by name when creating a product', async () => {
    const categoryId = new Types.ObjectId();
    const productId = new Types.ObjectId();
    const productDoc = {
      _id: productId,
      save: jest.fn().mockResolvedValue(undefined),
      variants: [],
    };

    const productModel = {
      create: jest.fn().mockResolvedValue(productDoc),
    };

    const variantModel = {
      insertMany: jest.fn().mockResolvedValue([]),
    };

    const categoryModel = {
      findOne: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({ _id: categoryId, name: 'Ropa' }),
      }),
    };

    const service = new ProductsService(
      productModel as any,
      variantModel as any,
      categoryModel as any,
    );

    const result = await service.create({
      name: 'Camiseta',
      description: 'Camiseta básica',
      category: 'ropa',
      image: 'product.jpg',
      variants: [{ price: 12000, stock: 10, image: 'variant.jpg' }],
    });

    expect(categoryModel.findOne).toHaveBeenCalledWith({
      name: { $regex: '^ropa$', $options: 'i' },
    });
    expect(productModel.create).toHaveBeenCalledWith({
      name: 'Camiseta',
      description: 'Camiseta básica',
      category: categoryId,
      image: 'product.jpg',
    });
    expect(result).toBe(productDoc);
  });
});
