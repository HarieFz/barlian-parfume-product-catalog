import { create } from "zustand";

export interface CartItem {
  id: number;
  name: string;
  price: string;
  numericPrice: number;
  size: string;
  image: any;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">, quantity: number) => void;
  removeFromCart: (id: number, size: string) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  updateQuantity: (id: number, size: string, delta: number) => void;
}

// Helper untuk mengubah string "Rp150.000" menjadi angka 150000
export const parsePrice = (priceStr: string): number => {
  return parseInt(priceStr.replace(/[^\d]/g, ""), 10);
};

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  addToCart: (newItem, quantity) => {
    set((state) => {
      // Cek apakah produk dengan ID dan UKURAN yang sama sudah ada di keranjang
      const existingItemIndex = state.items.findIndex((item) => item.id === newItem.id && item.size === newItem.size);

      if (existingItemIndex > -1) {
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex].quantity += quantity;
        return { items: updatedItems };
      }

      return { items: [...state.items, { ...newItem, quantity }] };
    });
  },

  removeFromCart: (id, size) => {
    set((state) => ({
      items: state.items.filter((item) => !(item.id === id && item.size === size)),
    }));
  },

  clearCart: () => set({ items: [] }),

  getTotalItems: () => {
    return get().items.reduce((total, item) => total + item.quantity, 0);
  },

  updateQuantity: (id, size, delta) => {
    set((state) => ({
      items: state.items
        .map((item) => {
          if (item.id === id && item.size === size) {
            const newQty = item.quantity + delta;
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0), // Jika kuantitas 0, otomatis terhapus
    }));
  },
}));
