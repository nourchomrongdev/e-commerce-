export type ProductStatus = "Published" | "Draft" | "Archived";

export type Product = {
  name: string;
  description: string;
  price: string;
  discount: number;
  status: ProductStatus;
  sales: number;
  createdAt: string;
  icon: string;
};

export type ProductFormValues = Pick<Product, "name" | "description" | "price" | "discount" | "status">;
