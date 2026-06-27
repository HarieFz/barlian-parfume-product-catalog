export const formatPrice = (price: number | string) => {
  if (typeof price === "string") return price;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(price);
};
