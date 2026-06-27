import { CartItem } from "../_store/useCartStore";

export const sendToWhatsApp = (items: CartItem[], totalPrice: number) => {
  // Ganti dengan nomor WhatsApp tokomu (gunakan kode negara, tanpa tanda +)
  const phoneNumber = "6285167144201";

  // Format rupiah untuk teks di WhatsApp
  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // 1. Susun template pesan pembuka
  let message = `Halo Barlian Parfume, saya ingin memesan produk berikut:\n\n`;

  // 2. Loop isi keranjang untuk dimasukkan ke teks pesan
  items.forEach((item, index) => {
    message += `${index + 1}. *${item.name}*\n`;
    message += `   Ukuran: ${item.size}\n`;
    message += `   Jumlah: ${item.quantity} pcs\n`;
    message += `   Harga: ${formatRupiah(item.numericPrice * item.quantity)}\n\n`;
  });

  // 3. Tambahkan total harga di akhir pesan
  message += `----------------------------------\n`;
  message += `*Total Pembayaran:* ${formatRupiah(totalPrice)}\n\n`;
  message += `Mohon info selanjutnya untuk proses pembayaran dan pengiriman. Terima kasih!`;

  // 4. Encode string teks agar aman dimasukkan ke dalam URL
  const encodedMessage = encodeURIComponent(message);

  // 5. Buka link WhatsApp di tab baru
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
  window.open(whatsappUrl, "_blank");
};
