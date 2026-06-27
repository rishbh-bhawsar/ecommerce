export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  categoryId: number;
  category?: { id: number; name: string } | string;
  image: string | null;
  imageUrl?: string;
  stock: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductResponse {
  products: Product[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
