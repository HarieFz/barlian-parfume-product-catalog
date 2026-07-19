import { PHONE_NUMBER } from "../_constants";
import { CartItem } from "../_store/useCartStore";
import { Address, CourierRate } from "../_store/useCheckoutStore";

interface SendToWhatsAppParams {
  items: CartItem[];
  totalPrice: number;
  address: Address;
  courier: CourierRate | null;
}

export const sendToWhatsApp = ({ items, totalPrice, address, courier }: SendToWhatsAppParams) => {
  const formatRupiah = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);

  const isGarutCity = address.shippingArea === "garut-city";

  let message = `Halo Barlian Parfume, saya ingin memesan produk berikut:\n\n`;

  items.forEach((item, index) => {
    message += `${index + 1}. *${item.name}*\n`;
    message += `   Ukuran : ${item.size}\n`;
    message += `   Jumlah : ${item.quantity} pcs\n`;
    message += `   Harga  : ${formatRupiah(item.numericPrice * item.quantity)}\n\n`;
  });

  message += `────────────────────\n`;
  message += `*DATA PENERIMA*\n`;
  message += `Nama : ${address.name}\n`;
  message += `No. HP : ${address.phone}\n`;
  message += `Alamat : ${address.address}\n`;
  message += `Detail Alamat : ${address.detailAddress}\n`;
  message += `Detail Lainnya : ${address.detailOther}\n\n`;

  message += `*PENGIRIMAN*\n`;

  if (isGarutCity) {
    message += `Area : Garut Kota\n`;
    message += `Metode : Pengiriman Lokal\n`;
    message += `Ongkir : Dihitung manual oleh admin\n\n`;
  } else if (courier) {
    message += `Area : Luar Garut\n`;
    message += `Kurir : ${courier.courier}\n`;
    message += `Layanan : ${courier.serviceName} - ${courier.description}\n`;
    message += `Estimasi : ${courier.shipmentDurationRange} ${
      courier.shipmentDurationUnit === "days" ? "hari" : "jam"
    }\n`;
    message += `Ongkir : ${formatRupiah(courier.price)}\n\n`;
  }

  message += `────────────────────\n`;
  message += `*Total Pembayaran :* ${formatRupiah(totalPrice)}\n`;

  if (isGarutCity) {
    message += `*Catatan :* Ongkir akan diinformasikan oleh admin setelah pesanan dikonfirmasi.\n\n`;
  } else {
    message += `\n`;
  }

  message += `Mohon info selanjutnya untuk proses pembayaran dan pengiriman. Terima kasih!`;

  const whatsappUrl = `https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(message)}`;

  window.open(whatsappUrl, "_blank");
};
