// data
import Parfume from "@/public/images/parfume-barlian.jpeg";
import { Product } from "../_types";

const PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Barlian Classic Touch",
    category: "Formal Men",
    image: Parfume,
    description:
      "Aroma maskulin yang elegan dengan perpaduan woody dan sedikit sentuhan citrus. Sangat cocok untuk acara formal, pertemuan bisnis, atau malam hari yang mewah.",
    variants: [
      { size: "10ml", price: "Rp50.000" },
      { size: "30ml", price: "Rp150.000" },
      { size: "50ml", price: "Rp220.000" },
    ],
  },
  {
    id: 2,
    name: "Summer Breeze",
    category: "Casual Women",
    image: Parfume,
    description:
      "Aroma segar dan ceria dari buah-buahan tropis dicampur dengan floral lembut. Memberikan energi positif sepanjang hari untuk aktivitas santaimu.",
    variants: [
      { size: "10ml", price: "Rp45.000" },
      { size: "30ml", price: "Rp135.000" },
      { size: "50ml", price: "Rp195.000" },
      { size: "75ml", price: "Rp225.000" },
      { size: "100ml", price: "Rp250.000" },
    ],
  },
  {
    id: 3,
    name: "Midnight Oud",
    category: "Formal Men",
    image: Parfume,
    description:
      "Parfum premium dengan base note Oud yang bold, smoky, dan tahan lama. Dirancang khusus untuk pria yang ingin meninggalkan kesan mendalam dan karismatik.",
    variants: [
      { size: "10ml", price: "Rp55.000" },
      { size: "30ml", price: "Rp175.000" },
      { size: "50ml", price: "Rp250.000" },
    ],
  },
  {
    id: 4,
    name: "Sweet Vanilla",
    category: "Casual Women",
    image: Parfume,
    description:
      "Kehangatan aroma vanilla manis yang dipadukan dengan sentuhan almond dan susu. Manis, cozy, dan sangat adiktif untuk penggunaan sehari-hari.",
    variants: [
      { size: "10ml", price: "Rp40.000" },
      { size: "30ml", price: "Rp120.000" },
      { size: "50ml", price: "Rp170.000" },
    ],
  },
  {
    id: 5,
    name: "Ocean Fresh",
    category: "Casual Men",
    image: Parfume,
    description:
      "Sensasi kesegaran udara laut yang bersih dan maskulin. Sangat cocok digunakan setelah berolahraga atau saat cuaca panas agar tetap fresh.",
    variants: [
      { size: "10ml", price: "Rp45.000" },
      { size: "30ml", price: "Rp125.000" },
      { size: "50ml", price: "Rp185.000" },
    ],
  },
  {
    id: 6,
    name: "Elegant Rose",
    category: "Formal Women",
    image: Parfume,
    description:
      "Aroma mawar klasik yang dipadukan secara modern dengan white musk. Mencerminkan keanggunan, kemewahan, dan sisi feminin yang berkelas.",
    variants: [
      { size: "10ml", price: "Rp50.000" },
      { size: "30ml", price: "Rp160.000" },
      { size: "50ml", price: "Rp230.000" },
    ],
  },
];

const CATEGORIES = ["Semua", "Casual Women", "Casual Men", "Formal Women", "Formal Men"];

export { PRODUCTS, CATEGORIES };
