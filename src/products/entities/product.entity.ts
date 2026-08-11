export interface Product {
  _id?: string;
  name: string;
  description: string;
  image?: string;
  discount?: number;
  iva: number;
  unitPrice: number;
  total: number;
  createdAt?: Date;
  updatedAt?: Date;
}
