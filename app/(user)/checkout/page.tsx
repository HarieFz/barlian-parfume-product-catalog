"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronLeftIcon, ChevronRight, MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { useCartStore } from "../_store/useCartStore";
import { CourierRate, useCheckoutStore } from "../_store/useCheckoutStore";
import { formatPrice } from "../_utils/formatPrice";
import { sendToWhatsApp } from "../_utils/whatsapp";
import { ORIGIN_AREA_ID } from "../_constants";

interface MapArea {
  id: string;
  name: string;
  postal_code: string;
  latitude: number;
  longitude: number;
}

interface CourierResponse {
  company: string;
  courier_name: string;
  courier_code: string;
  courier_service_name: string;
  courier_service_code: string;
  price: number;
  shipment_duration_range: string;
  shipment_duration_unit: "days" | "hours";
  description: string;
}

// Helper: bandingkan apakah dua CourierResponse merujuk ke kurir & layanan yang sama
const isSameCourierService = (a: CourierResponse, rate: CourierRate) =>
  a.company === rate.company && a.courier_service_name === rate.serviceName;

const mapCourierResponseToRate = (rate: CourierResponse): CourierRate => ({
  company: rate.company,
  courier: rate.courier_name,
  serviceType: rate.courier_service_code,
  serviceName: rate.courier_service_name,
  description: rate.description,
  shipmentDurationRange: rate.shipment_duration_range,
  shipmentDurationUnit: rate.shipment_duration_unit,
  price: rate.price,
});

export default function CheckoutPage() {
  const router = useRouter();
  const { items } = useCartStore();
  const { address, selectedRate, setAddress, setSelectedRate } = useCheckoutStore();

  const [open, setOpen] = useState(false);

  // Inisialisasi state lokal untuk form alamat
  const [name, setName] = useState(address.name);
  const [phone, setPhone] = useState(address.phone);
  const [keyword, setKeyword] = useState(address.address);
  const [detailAddress, setDetailAddress] = useState(address.detailAddress);
  const [detailOther, setDetailOther] = useState(address.detailOther);

  const [isSelectingArea, setIsSelectingArea] = useState(false);
  const [areas, setAreas] = useState<MapArea[]>([]);
  const [loadingArea, setLoadingArea] = useState(false);

  const [rates, setRates] = useState<CourierResponse[]>([]);
  const [loadingRates, setLoadingRates] = useState(false);

  const isGarutCity = address.shippingArea === "garut-city";

  const totalPrice = useMemo(() => {
    return items.reduce((total, item) => total + item.numericPrice * item.quantity, 0);
  }, [items]);

  const grandTotal = isGarutCity ? totalPrice : totalPrice + (selectedRate?.price ?? 0);

  // Sync state lokal ketika global state 'address' berubah
  useEffect(
    function syncStateAddress() {
      setName(address.name);
      setPhone(address.phone);
      setKeyword(address.address);
      setDetailAddress(address.detailAddress);
      setDetailOther(address.detailOther);
    },
    [address],
  );

  // Efek Debounce untuk pencarian area Biteship Maps API
  useEffect(
    function fetchAreas() {
      if (isSelectingArea) {
        setIsSelectingArea(false);
        return;
      }

      if (!open) return;

      if (keyword.trim().length < 3) {
        setAreas([]);
        return;
      }

      const controller = new AbortController();

      const timer = setTimeout(async () => {
        try {
          setLoadingArea(true);

          const response = await fetch(`/api/biteship/maps?input=${encodeURIComponent(keyword)}`, {
            signal: controller.signal,
            cache: "no-store",
          });

          if (!response.ok) throw new Error("Failed to fetch maps");

          const result = await response.json();
          setAreas(result.areas ?? result.data ?? []);
        } catch (error: any) {
          if (error.name !== "AbortError") {
            console.error(error);
            setAreas([]);
          }
        } finally {
          setLoadingArea(false);
        }
      }, 500);

      return () => {
        clearTimeout(timer);
        controller.abort();
      };
    },
    [keyword, open],
  );

  useEffect(
    function fetchRates() {
      let ignore = false;
      const controller = new AbortController();

      const fetchRates = async () => {
        if (isGarutCity || !address.areaId || items.length === 0) {
          if (!ignore) setRates([]);
          return;
        }

        try {
          setLoadingRates(true);
          const response = await fetch("/api/biteship/rates", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            cache: "no-store",
            signal: controller.signal,
            body: JSON.stringify({
              origin_area_id: ORIGIN_AREA_ID,
              destination_area_id: address.areaId,
              couriers: "jne_reg,jnt",
              items: items.map((item) => ({
                name: item.name,
                value: item.numericPrice,
                quantity: item.quantity,
                weight: 500,
              })),
            }),
          });

          if (!response.ok) throw new Error("Failed to fetch rates");

          const result = await response.json();
          if (ignore) return;

          const newRates: CourierResponse[] = result.pricing ?? [];
          setRates(newRates);

          // Sinkronkan ulang kurir yang sudah dipilih dengan data ongkir terbaru
          const currentSelected = useCheckoutStore.getState().selectedRate;
          if (currentSelected) {
            const stillAvailable = newRates.find((rate) => isSameCourierService(rate, currentSelected));
            setSelectedRate(stillAvailable ? mapCourierResponseToRate(stillAvailable) : null);
          }
        } catch (error: any) {
          if (ignore || error?.name === "AbortError") return;
          console.error(error);
          setRates([]);
          setSelectedRate(null);
        } finally {
          if (!ignore) setLoadingRates(false);
        }
      };

      fetchRates();

      return () => {
        ignore = true;
        controller.abort();
      };
    },
    [address.areaId, items, address.shippingArea, isGarutCity, setSelectedRate],
  );

  const handleSelectArea = (area: MapArea) => {
    setIsSelectingArea(true);
    setKeyword(area.name);
    setSelectedRate(null);

    setAddress({
      ...address,
      areaId: area.id,
      name,
      phone,
      address: area.name,
      detailAddress,
      detailOther,
    });
    setAreas([]);
  };

  const handleSaveAddress = () => {
    setAddress({
      ...address,
      name,
      phone,
      address: keyword,
      detailAddress,
      detailOther,
    });
    setOpen(false);
  };

  const handleCheckout = () => {
    if (items.length === 0) return;

    if (!address.name.trim() || !address.phone.trim() || !address.address.trim() || !address.detailAddress.trim()) {
      setOpen(true);
      return;
    }

    if (!isGarutCity && !selectedRate) return;

    sendToWhatsApp({
      items,
      totalPrice: grandTotal,
      address,
      courier: isGarutCity ? null : selectedRate,
    });
  };

  const handleSelectCourier = (rate: CourierResponse) => {
    setSelectedRate(mapCourierResponseToRate(rate));
  };

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col bg-white">
      <header className="flex items-center justify-between px-6 pt-8">
        <Button size="icon-lg" variant="outline" className="rounded-full" onClick={() => router.back()}>
          <ChevronLeftIcon />
        </Button>
        <h1 className="text-base font-semibold tracking-wide">Checkout</h1>
        <div className="w-10" />
      </header>

      <main className="flex-1 space-y-4 px-6 pb-24 pt-6">
        {/* Pilihan Metode Pengiriman */}
        <Card>
          <CardHeader>
            <CardTitle>Pilih Metode Pengiriman</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <button
              type="button"
              onClick={() => {
                setSelectedRate(null);
                setAddress({
                  ...address,
                  shippingArea: "garut-city",
                });
              }}
              className={`w-full rounded-xl border p-4 text-left transition-all ${
                isGarutCity ? "border-primary bg-primary/5" : "border-zinc-200 hover:border-primary/40"
              }`}
            >
              <p className="font-medium">Pengiriman Instan</p>
              <p className="text-sm text-muted-foreground">Garut Kota & Sekitarnya</p>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedRate(null);
                setAddress({
                  ...address,
                  shippingArea: "outside-garut",
                });
              }}
              className={`w-full rounded-xl border p-4 text-left transition-all ${
                address.shippingArea === "outside-garut"
                  ? "border-primary bg-primary/5"
                  : "border-zinc-200 hover:border-primary/40"
              }`}
            >
              <p className="font-medium">Pengiriman Ekspedisi</p>
              <p className="text-sm text-muted-foreground">Seluruh Indonesia</p>
            </button>
          </CardContent>
        </Card>

        {/* Informasi Alamat Utama */}
        <Card className="cursor-pointer transition-colors hover:bg-muted/50" onClick={() => setOpen(true)}>
          <CardContent className="flex items-start justify-between p-4">
            <div className="flex gap-3">
              <MapPin className="mt-1 h-5 w-5 text-primary" />
              <div className="flex-1">
                <p className="font-semibold">Alamat Pengiriman</p>
                {address.address ? (
                  <div className="mt-2 space-y-1.5">
                    <p className="font-medium">{address.name}</p>
                    <p className="text-sm text-muted-foreground">{address.phone}</p>
                    {address.detailAddress && (
                      <p className="text-sm text-muted-foreground">
                        <span>{address.detailAddress}</span>
                        {address.detailOther && <span>, {address.detailOther}</span>}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">{address.address}</p>
                    {!isGarutCity && selectedRate && (
                      <div className="mt-2 inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                        {selectedRate.courier} • {selectedRate.serviceName}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="mt-1 text-sm text-muted-foreground">Tambahkan alamat pengiriman</p>
                )}
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </CardContent>
        </Card>

        {/* Daftar Barang */}
        <Card>
          <CardHeader>
            <CardTitle>Pesanan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((item) => (
              <div
                key={`${item.id}-${item.size}`}
                className="flex gap-3 border-b border-b-border pb-4 last:border-none last:pb-0"
              >
                <div className="relative h-16 w-16 overflow-hidden rounded-lg border bg-zinc-50">
                  <Image src={item.image} alt={item.name} fill sizes="64px" className="object-cover" />
                </div>
                <div className="flex flex-1 items-center justify-between">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.size} • {item.quantity} pcs
                    </p>
                  </div>
                  <p className="font-semibold">{formatPrice(item.numericPrice * item.quantity)}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Pilihan Ekspedisi Kurir Luar Kota */}
        <div className="space-y-3">
          {isGarutCity ? (
            <Card>
              <CardHeader>
                <CardTitle>Pengiriman Instant</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Ongkir tidak dihitung otomatis. Admin akan menghubungi Anda untuk menginformasikan biaya pengiriman.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Pengiriman</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {!address.address && <p className="text-sm text-muted-foreground">Tambahkan alamat terlebih dahulu.</p>}
                {loadingRates && <p className="text-sm text-muted-foreground">Mengambil ongkir...</p>}
                {!loadingRates && address.address && rates.length === 0 && (
                  <p className="text-sm text-muted-foreground">Ongkir belum tersedia atau area belum dipilih.</p>
                )}
                {!loadingRates &&
                  rates.map((rate) => {
                    const active =
                      selectedRate?.company === rate.company && selectedRate?.serviceName === rate.courier_service_name;
                    return (
                      <button
                        key={`${rate.courier_code}-${rate.courier_service_code}`}
                        type="button"
                        onClick={() => handleSelectCourier(rate)}
                        className={`w-full rounded-xl border p-4 text-left transition-all ${
                          active ? "border-primary bg-primary/5" : "border-zinc-200 hover:border-primary/40"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-medium">{rate.courier_name}</p>
                            <p className="text-sm text-muted-foreground">{rate.courier_service_name}</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              Estimasi {rate.shipment_duration_range}{" "}
                              {rate.shipment_duration_unit === "days" ? "hari" : "jam"}
                            </p>
                          </div>
                          <p className="font-semibold">{formatPrice(rate.price)}</p>
                        </div>
                      </button>
                    );
                  })}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Ringkasan Biaya */}
        <Card>
          <CardHeader>
            <CardTitle>Ringkasan Pesanan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">{formatPrice(totalPrice)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Ongkir</span>
              <span className="font-medium">
                {(() => {
                  if (isGarutCity) return "Dihitung Admin";
                  if (selectedRate) return formatPrice(selectedRate.price);
                  return "-";
                })()}
              </span>
            </div>
            <div className="flex items-center justify-between border-t pt-4">
              <span className="font-semibold">Total Pembayaran</span>
              <span className="text-lg font-bold text-primary">{formatPrice(grandTotal)}</span>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Sticky Bottom Actions */}
      <footer className="sticky bottom-0 w-full max-w-md h-20 px-6 border-t border-zinc-100 bg-white/90 backdrop-blur-lg flex items-center justify-between z-10">
        <Button
          className="w-full"
          size="lg"
          disabled={
            items.length === 0 ||
            !address.name ||
            !address.phone ||
            !address.address ||
            !address.detailAddress ||
            (!isGarutCity && !selectedRate)
          }
          onClick={handleCheckout}
        >
          Pesan Sekarang
        </Button>
      </footer>

      {/* Form Input Alamat (Drawer) */}
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="max-w-md mx-auto">
          <DrawerHeader>
            <DrawerTitle>Alamat Pengiriman</DrawerTitle>
          </DrawerHeader>

          <div className="space-y-4 px-4 pb-4 overflow-y-auto max-h-[70vh]">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input
                id="name"
                value={name}
                placeholder="Masukkan nama lengkap"
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Nomor Telepon</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                placeholder="08xxxxxxxxxx"
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Kecamatan / Kota / Provinsi / Kode Pos</Label>
              <div className="relative">
                <Input
                  id="address"
                  autoComplete="off"
                  value={keyword}
                  placeholder="Cari kecamatan, kelurahan, atau alamat"
                  onChange={(e) => {
                    const value = e.target.value;
                    setKeyword(value);
                    setSelectedRate(null);
                    setAddress({
                      ...address,
                      areaId: "",
                      address: value,
                      name,
                      phone,
                      detailAddress,
                      detailOther,
                    });
                  }}
                />

                {loadingArea && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    Loading...
                  </div>
                )}

                {areas.length > 0 && (
                  <div className="absolute z-50 mt-2 max-h-72 w-full overflow-y-auto rounded-xl border bg-background shadow-lg">
                    {areas.map((area) => (
                      <button
                        key={area.id}
                        type="button"
                        onClick={() => handleSelectArea(area)}
                        className="flex w-full flex-col items-start border-b px-4 py-3 text-left transition hover:bg-muted last:border-none"
                      >
                        <span className="font-medium">{area.name}</span>
                        {area.postal_code && (
                          <span className="mt-1 text-xs text-muted-foreground">Kode Pos: {area.postal_code}</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="detail-address">Detail Alamat</Label>
              <Textarea
                id="detail-address"
                rows={4}
                value={detailAddress}
                placeholder="Cth. Jl. Nama Jalan No. 123, RT 01/RW 02"
                onChange={(e) => setDetailAddress(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="detail-other">Detail Lainnya (Cth: Blok / Unit No., Patokan)</Label>
              <Textarea
                id="detail-other"
                rows={4}
                value={detailOther}
                placeholder="Cth: Blok C No. 12, cat rumah warna krem"
                onChange={(e) => setDetailOther(e.target.value)}
              />
            </div>
          </div>

          <DrawerFooter className="border-t bg-background">
            <Button
              onClick={handleSaveAddress}
              disabled={!name.trim() || !phone.trim() || !keyword.trim() || !detailAddress.trim()}
            >
              Simpan Alamat
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
