import { useState, useEffect } from "react";
import { useCartStore } from "../_store/useCartStore";

export function useCart() {
  const [hasMounted, setHasMounted] = useState(false);
  const totalItems = useCartStore((state) => state.getTotalItems());
  const items = useCartStore((state) => state.items);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  return {
    // Jika belum mounted di client, kembalikan 0 / array kosong agar tidak mismatch
    totalItems: hasMounted ? totalItems : 0,
    items: hasMounted ? items : [],
  };
}
