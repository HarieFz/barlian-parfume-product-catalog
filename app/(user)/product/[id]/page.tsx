"use client";

import Image from "next/image";
import Link from "next/link";
import ProductActionDrawer from "../../_components/ProductActionDrawer";

import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, ShoppingBasketIcon } from "lucide-react";
import { Drawer, DrawerTrigger } from "@/components/ui/drawer";
import { PRODUCTS } from "../../_constants";
import { useCart } from "../../_hooks/useCart";
import { useRouter, useParams } from "next/navigation";
import { formatPrice } from "../../_utils/formatPrice";

export default function Product() {
  const router = useRouter();
  const params = useParams();
  const { totalItems } = useCart();

  // Mengambil id dari URL dan mencari produk yang cocok
  const productId = Number(params?.id);
  const product = PRODUCTS.find((p) => p.id === productId);

  // Proteksi jika produk tidak ditemukan
  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center gap-4">
        <p className="text-zinc-500">Produk tidak ditemukan</p>
        <Button onClick={() => router.push("/")}>Kembali ke Home</Button>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col justify-between space-y-5 pt-8">
      {/* Top Navbar */}
      <div className="px-6 flex items-center justify-between">
        <Button size="icon-lg" variant="outline" className="rounded-full" onClick={() => router.back()}>
          <ChevronLeftIcon />
        </Button>

        <Link href="/cart" id="cart-icon" className="relative inline-block">
          <Button variant="outline" size="icon-lg" className="rounded-full">
            <ShoppingBasketIcon className="shopping-basket-icon" />
          </Button>

          {totalItems > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-black text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white transition-all duration-300 transform scale-100 animate-in zoom-in-50">
              {totalItems}
            </span>
          )}
        </Link>
      </div>

      {/* Main Content */}
      <main className="flex-1 pb-24">
        {/* Product Image Showcase */}
        <section className="flex items-center justify-center">
          <Image
            src={product.variants[3].image}
            alt={product.name}
            width={0}
            height={0}
            priority
            sizes="100vw"
            className="w-full aspect-square object-cover"
            loading="eager"
          />
        </section>

        {/* Product Details */}
        <section className="px-6 pt-6 space-y-4">
          <div className="space-y-1.5">
            <span className="inline-block text-[10px] uppercase tracking-wider bg-zinc-100 text-zinc-600 px-2.5 py-0.5 rounded-full font-semibold">
              {product.category}
            </span>
            <h1 className="font-serif font-bold text-2xl text-zinc-950 tracking-wide leading-tight">{product.name}</h1>
          </div>

          <div className="w-8 h-0.5 bg-zinc-200 rounded-full" />

          <div className="space-y-2">
            <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Deskripsi</h2>
            <p className="text-sm text-zinc-600 leading-relaxed font-light whitespace-pre-line">
              {product.description}
            </p>
          </div>
        </section>
      </main>

      {/* Sticky Bottom Action Bar */}
      <footer className="sticky bottom-0 w-full max-w-md h-20 px-6 border-t border-zinc-100 bg-white/90 backdrop-blur-lg flex items-center justify-between z-10">
        <div className="space-y-0.5">
          <p className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400">Harga mulai</p>
          <p className="font-bold text-xl text-amber-500 tracking-tight">{formatPrice(product.variants[0].price)}</p>
        </div>

        <div className="flex items-center justify-center gap-2">
          <Drawer>
            <DrawerTrigger asChild>
              <Button size="default" variant="secondary" className="w-14 h-11 rounded-full">
                <ShoppingBasketIcon />
              </Button>
            </DrawerTrigger>

            <ProductActionDrawer product={product} mode="cart" />
          </Drawer>

          <Drawer>
            <DrawerTrigger asChild>
              <Button className="h-11 px-6 rounded-full font-medium">Pesan Sekarang</Button>
            </DrawerTrigger>

            <ProductActionDrawer product={product} mode="buy" />
          </Drawer>
        </div>
      </footer>
    </div>
  );
}
