"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { MinusIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

import { ProductActionDrawerProps, ProductVariant } from "../_types";
import { parsePrice, useCartStore } from "../_store/useCartStore";
import { formatPrice } from "../_utils/formatPrice";

export default function ProductActionDrawer({ product, mode }: Readonly<ProductActionDrawerProps>) {
  const router = useRouter();

  const { addToCart, clearCart } = useCartStore();

  const imgRef = useRef<HTMLImageElement>(null);

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(product.variants[0]);
  const [quantity, setQuantity] = useState<number>(1);

  const increment = () => setQuantity((prev) => prev + 1);
  const decrement = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const cartItem = {
    id: product.id,
    name: product.name,
    price: selectedVariant.price,
    numericPrice: parsePrice(selectedVariant.price),
    size: selectedVariant.size,
    image: selectedVariant.image,
  };

  const executeAddToCart = () => {
    addToCart(cartItem, quantity);
  };

  const handleBuyNow = () => {
    clearCart();

    addToCart(cartItem, quantity);

    router.push("/checkout");
  };

  const runFlyAnimation = () => {
    const cartTarget = document.getElementById("cart-icon") || document.querySelector(".shopping-basket-icon");

    if (!imgRef.current || !cartTarget) {
      executeAddToCart();
      return;
    }

    const imgRect = imgRef.current.getBoundingClientRect();
    const cartRect = cartTarget.getBoundingClientRect();

    const flyingImg = document.createElement("img");
    flyingImg.src = imgRef.current.src;
    flyingImg.className = "animate-fly";

    flyingImg.style.width = `${imgRect.width}px`;
    flyingImg.style.height = `${imgRect.height}px`;
    flyingImg.style.top = `${imgRect.top}px`;
    flyingImg.style.left = `${imgRect.left}px`;
    flyingImg.style.borderRadius = "12px";
    flyingImg.style.objectFit = "cover";
    flyingImg.style.position = "fixed";
    flyingImg.style.zIndex = "9999";
    flyingImg.style.pointerEvents = "none";

    const targetX = cartRect.left - imgRect.left + cartRect.width / 2 - imgRect.width / 2;
    const targetY = cartRect.top - imgRect.top + cartRect.height / 2 - imgRect.height / 2;

    flyingImg.style.setProperty("--target-x", `${targetX}px`);
    flyingImg.style.setProperty("--target-y", `${targetY}px`);

    document.body.appendChild(flyingImg);

    setTimeout(() => {
      if (document.body.contains(flyingImg)) {
        flyingImg.remove();
      }

      executeAddToCart();

      cartTarget.classList.add("scale-110");
      setTimeout(() => cartTarget.classList.remove("scale-110"), 150);
    }, 800);
  };

  const handleAction = () => {
    if (mode === "cart") {
      runFlyAnimation();
    } else {
      handleBuyNow();
    }
  };

  return (
    <DrawerContent className="max-w-md mx-auto rounded-t-[24px]">
      <DrawerHeader className="pb-2">
        <DrawerTitle />
        <DrawerDescription />
      </DrawerHeader>

      <div className="no-scrollbar overflow-y-auto px-6 pb-6 space-y-6">
        <div className="w-full flex gap-4 p-3 rounded-xl border border-zinc-100 bg-zinc-50/50 shadow-sm">
          <div className="relative w-20 h-25 rounded-lg overflow-hidden bg-zinc-100 shrink-0">
            <Image
              ref={imgRef}
              src={selectedVariant.image}
              alt={product.name}
              fill
              sizes="80px"
              className="object-cover object-[50%_40%]"
              loading="eager"
            />
          </div>

          <div className="flex flex-col justify-center space-y-1">
            <h3 className="font-semibold text-base text-zinc-950 line-clamp-1">{product.name}</h3>
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">{selectedVariant.size}</p>
            <p className="font-bold text-lg text-amber-500 tracking-tight">{formatPrice(selectedVariant.price)}</p>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400">
            Ukuran ({product.variants.length})
          </h4>

          <div className="grid grid-cols-3 gap-2.5">
            {product.variants.map((variant) => {
              const isSelected = selectedVariant.size === variant.size;

              return (
                <button
                  key={variant.size}
                  onClick={() => setSelectedVariant(variant)}
                  className={`group w-full flex flex-col border rounded-xl overflow-hidden transition-all ${
                    isSelected
                      ? "border-amber-500 bg-amber-50/10 ring-1 ring-amber-500"
                      : "border-zinc-200 bg-white hover:border-zinc-300"
                  }`}
                >
                  <div className="relative aspect-7/8 w-full bg-zinc-50 border-b border-zinc-100">
                    <Image
                      src={variant.image}
                      alt={variant.size}
                      fill
                      sizes="(max-width:768px)33vw,120px"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>

                  <div className="px-3 py-2 text-center">
                    <p
                      className={isSelected ? "text-xs font-bold text-amber-500" : "text-xs font-medium text-zinc-600"}
                    >
                      {variant.size}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-zinc-100 pt-2">
          <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Jumlah</h4>

          <div className="flex items-center gap-4 rounded-full border border-zinc-100 bg-zinc-50 p-1">
            <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full" onClick={decrement}>
              <MinusIcon className="h-3.5 w-3.5" />
            </Button>

            <span className="min-w-6 text-center text-sm font-semibold">{quantity}</span>

            <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full" onClick={increment}>
              <PlusIcon className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      <DrawerFooter className="border-t border-zinc-100 bg-white pt-4">
        <Button
          size="lg"
          className="h-12 w-full rounded-full bg-zinc-900 font-medium tracking-wide text-white"
          onClick={handleAction}
        >
          {mode === "cart" ? "Tambah ke Keranjang" : "Pesan Sekarang"}
        </Button>
      </DrawerFooter>
    </DrawerContent>
  );
}
