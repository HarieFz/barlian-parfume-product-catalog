export interface ProductVariant {
  size: string;
  price: string;
  image: any;
}

export interface Product {
  id: number;
  name: string;
  category: string;
  description: string;
  variants: ProductVariant[];
}

export interface ProductActionDrawerProps {
  product: Product;
  mode: "buy" | "cart";
}
