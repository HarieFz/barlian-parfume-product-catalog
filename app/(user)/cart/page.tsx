"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronLeftIcon, MinusIcon, PlusIcon, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCartStore } from "../_store/useCartStore";
import { sendToWhatsApp } from "../_utils/whatsapp";
import { formatPrice } from "../_utils/formatPrice";

export default function Cart() {
  const router = useRouter();

  // Mengambil state dan aksi dari Zustand
  const { items, removeFromCart, updateQuantity } = useCartStore();

  // Kalkulasi total harga belanjaan
  const totalPrice = items.reduce((sum, item) => sum + item.numericPrice * item.quantity, 0);

  const handleCheckout = () => {
    if (items.length === 0) return;
    sendToWhatsApp(items, totalPrice);
  };

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col justify-between bg-white relative">
      {/* Header */}
      <header className="px-6 pt-8 flex items-center justify-between">
        <Button
          size="icon-lg"
          variant="outline"
          onClick={() => router.back()}
          className="rounded-full"
          aria-label="Kembali"
        >
          <ChevronLeftIcon />
        </Button>
        <h1 className="text-base font-semibold tracking-wide text-zinc-900">Keranjang</h1>
        <div className="w-10" /> {/* Spacer penyeimbang layout */}
      </header>

      {/* Main Content / List Produk */}
      <main className="flex-1 px-6 pt-6 pb-24">
        {items.length > 0 ? (
          <div className="space-y-4">
            {items.map((item, index) => (
              <div
                key={`${item.id}-${item.size}-${index}`}
                className="flex items-center gap-4 py-3 border-b border-zinc-100 last:border-none"
              >
                {/* Wrapper Gambar Produk */}
                <div className="relative w-20 h-20 aspect-square bg-zinc-50 border border-zinc-100 rounded-xl overflow-hidden shrink-0">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="80px"
                    className="object-cover object-[50%_40%]"
                    loading="eager"
                  />
                </div>

                {/* Detail Informasi & Kontrol Kuantitas */}
                <div className="flex-1 flex flex-col justify-between h-20 py-0.5">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="text-sm font-medium text-zinc-900 line-clamp-1">{item.name}</h2>

                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-zinc-400 hover:text-red-500 hover:bg-red-50/50 rounded-full transition-colors flex items-center justify-center"
                        onClick={() => removeFromCart(item.id, item.size)}
                        aria-label={`Hapus ${item.name}`}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider mt-0.5">
                      Ukuran: {item.size}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <p className="font-bold text-base text-amber-500 tracking-tight">
                      {formatPrice(item.numericPrice * item.quantity)}
                    </p>

                    {/* Pengatur Jumlah Kuantitas */}
                    <div className="flex items-center gap-3 bg-zinc-50 border border-zinc-100 rounded-full p-0.5">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 rounded-full text-zinc-500 hover:bg-white hover:text-zinc-900 shadow-none transition-all"
                        onClick={() => updateQuantity(item.id, item.size, -1)}
                        disabled={item.quantity <= 1}
                      >
                        <MinusIcon className="w-3 h-3" />
                      </Button>
                      <span className="text-xs font-semibold text-zinc-900 min-w-4 text-center">{item.quantity}</span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 rounded-full text-zinc-500 hover:bg-white hover:text-zinc-900 shadow-none transition-all"
                        onClick={() => updateQuantity(item.id, item.size, 1)}
                      >
                        <PlusIcon className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Tampilan Jika Keranjang Kosong (Empty State) */
          <div className="h-[60vh] flex flex-col items-center justify-center text-center p-6 gap-4">
            <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center border border-zinc-100">
              <svg className="w-6 h-6 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </div>
            <div className="space-y-1">
              <p className="text-zinc-900 font-medium text-sm">Keranjang Belanja Kosong</p>
              <p className="text-zinc-400 text-xs max-w-50">Semua sastra parfum terbaik menantimu untuk dijelajahi.</p>
            </div>
            <Button
              size="sm"
              onClick={() => router.push("/")}
              className="rounded-full bg-zinc-900 text-white hover:bg-zinc-800 text-xs px-5 h-9 mt-2 tracking-wide transition-colors"
            >
              Mulai Belanja
            </Button>
          </div>
        )}
      </main>

      {/* Sticky Bottom Bar Summary & Checkout */}
      <footer className="sticky bottom-0 w-full max-w-md h-20 px-6 border-t border-zinc-100 bg-white/90 backdrop-blur-lg flex items-center justify-between z-10">
        <div className="space-y-0.5">
          <p className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400">Total Pembayaran</p>
          <p className="font-bold text-xl text-amber-500 tracking-tight">{formatPrice(totalPrice)}</p>
        </div>

        <Button
          className="h-12 px-6 rounded-full font-medium text-xs tracking-wide bg-zinc-900 text-white hover:bg-zinc-800 transition-colors shadow-sm disabled:bg-zinc-200 disabled:text-zinc-400"
          disabled={items.length === 0}
          onClick={handleCheckout}
        >
          Pesan Sekarang
        </Button>
      </footer>
    </div>
  );
}
