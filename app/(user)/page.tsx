"use client";

import Image from "next/image";
import Link from "next/link";
import Logo from "@/public/logos/logo.webp";

import { Button } from "@/components/ui/button";
import { CATEGORIES, PRODUCTS } from "./_constants";
import { ShoppingBasketIcon } from "lucide-react";
import { useCartStore } from "./_store/useCartStore";
import { useState, useEffect, useRef, useCallback } from "react";
import { formatPrice } from "./_utils/formatPrice";

const ITEMS_PER_PAGE = 4; // Jumlah produk yang dimuat per sesi/halaman

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [visibleItems, setVisibleItems] = useState(ITEMS_PER_PAGE);
  const observerTarget = useRef<HTMLDivElement | null>(null);

  // Zustand selector yang lebih optimal
  const totalItems = useCartStore((state) => state.getTotalItems());

  // Filter logika produk
  const filteredProducts =
    selectedCategory === "Semua" ? PRODUCTS : PRODUCTS.filter((product) => product.category === selectedCategory);

  // Potong produk yang tampil berdasarkan pagination
  const paginatedProducts = filteredProducts.slice(0, visibleItems);
  const hasMore = visibleItems < filteredProducts.length;

  // Reset pagination setiap kali kategori berubah
  useEffect(() => {
    setVisibleItems(ITEMS_PER_PAGE);
  }, [selectedCategory]);

  // Fungsi untuk memuat produk lebih banyak saat scroll
  const loadMoreItems = useCallback(() => {
    if (hasMore) {
      setVisibleItems((prev) => prev + ITEMS_PER_PAGE);
    }
  }, [hasMore]);

  // Setup Intersection Observer untuk infinite scroll
  useEffect(() => {
    const target = observerTarget.current;
    if (!target || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreItems();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(target);

    return () => {
      if (target) observer.unobserve(target);
    };
  }, [loadMoreItems, hasMore]);

  return (
    <div className="flex flex-col justify-between bg-white px-6 py-8 space-y-8">
      {/* Header */}
      <header className="flex items-center justify-between gap-3">
        <div className="relative h-14 w-32">
          <Image
            src={Logo}
            alt="Barlian Parfume Logo"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 128px"
            className="object-contain"
          />
        </div>

        <Link href="/cart" className="relative group" aria-label="Keranjang Belanja">
          <Button variant="outline" size="icon-lg" className="rounded-full">
            <ShoppingBasketIcon />
          </Button>
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 bg-amber-500 text-black text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white animate-in zoom-in duration-300">
              {totalItems}
            </span>
          )}
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 space-y-6">
        {/* Hero / Copywriting */}
        <div className="space-y-1">
          <h1 className="font-bold text-2xl tracking-wide text-zinc-900">Barlian Parfume</h1>
          <p className="text-xs italic text-zinc-500 font-serif">
            &ldquo;Bau adalah sebuah kata, parfum adalah sastra&rdquo;
          </p>
        </div>

        {/* Filter Kategori */}
        <nav className="flex flex-wrap items-center gap-2" aria-label="Filter Kategori">
          {CATEGORIES.map((category) => {
            const isActive = selectedCategory === category;
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer text-nowrap border ${
                  isActive
                    ? "bg-zinc-900 border-zinc-900 text-white shadow-sm shadow-zinc-900/10"
                    : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                }`}
              >
                {category}
              </button>
            );
          })}
        </nav>

        {/* Grid Produk */}
        {paginatedProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-2 gap-x-4 gap-y-8">
              {paginatedProducts.map((product) => (
                <Link href={`/product/${product.id}`} key={product.id} className="group flex flex-col gap-3.5">
                  {/* Wrapper Gambar dengan Efek Hover Premium */}
                  <div className="w-full aspect-square rounded-2xl overflow-hidden bg-zinc-100 relative shadow-sm border border-zinc-100">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 200px"
                      className="object-cover object-[50%_40%] transition-transform duration-500 ease-out group-hover:scale-105"
                      loading="eager"
                    />
                  </div>

                  {/* Detail Informasi */}
                  <div className="space-y-1 px-1">
                    {/* Badge Kategori Produk */}
                    <span className="inline-block text-[10px] font-semibold tracking-wider uppercase text-zinc-400">
                      {product.category}
                    </span>
                    <h2 className="text-xs font-medium text-zinc-800 line-clamp-1 group-hover:text-zinc-600 transition-colors">
                      {product.name}
                    </h2>
                    <p className="font-semibold text-sm text-amber-500">{formatPrice(product.variants[0].price)}</p>
                  </div>
                </Link>
              ))}
            </div>

            {/* Indikator Pemicu Scroll Pagination (Invisible Trigger) */}
            {hasMore && (
              <div ref={observerTarget} className="flex justify-center py-6 text-zinc-400 text-xs animate-pulse">
                Memuat produk lainnya...
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 text-zinc-400 text-xs border border-dashed border-zinc-200 rounded-2xl">
            Tidak ada produk di kategori ini.
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-100 pt-6 pb-2">
        <p className="text-center text-[11px] text-zinc-400 tracking-wide">
          &copy; 2026 Barlian Parfume. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
