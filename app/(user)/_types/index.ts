export interface ProductVariant {
  size: string;
  price: string;
}

export interface Product {
  id: number;
  name: string;
  image: any;
  category: string;
  description: string;
  variants: ProductVariant[];
}

export interface ProductActionDrawerProps {
  product: Product;
  mode: "buy" | "cart";
}
