"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeftIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCheckoutStore } from "../../_store/useCheckoutStore";

interface MapArea {
  id: string;
  name: string;
  postal_code: string;
  latitude: number;
  longitude: number;
}

export default function Address() {
  const router = useRouter();

  const { address, setAddress, setSelectedRate } = useCheckoutStore();

  const [name, setName] = useState(address.name);
  const [phone, setPhone] = useState(address.phone);
  const [keyword, setKeyword] = useState(address.address);
  const [detailAddress, setDetailAddress] = useState(address.detailAddress);
  const [detailOther, setDetailOther] = useState(address.detailOther);

  const [isSelectingArea, setIsSelectingArea] = useState(false);

  const [areas, setAreas] = useState<MapArea[]>([]);
  const [loadingArea, setLoadingArea] = useState(false);

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

    router.push("/checkout");
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between space-y-6 px-6 pt-8">
      <header className="flex items-center justify-between">
        <Button size="icon-lg" variant="outline" className="rounded-full" onClick={() => router.back()}>
          <ChevronLeftIcon />
        </Button>
        <h1 className="text-base font-semibold tracking-wide">Alamat Pengiriman</h1>
        <div className="w-10" />
      </header>

      <main className="flex-1 space-y-4 pb-24">
        <div className="space-y-2">
          <Label htmlFor="name">Nama Lengkap</Label>
          <Input id="name" value={name} placeholder="Masukkan nama lengkap" onChange={(e) => setName(e.target.value)} />
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
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">Loading...</div>
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
      </main>

      <footer className="sticky bottom-0 w-full max-w-md h-20 border-t border-zinc-100 bg-white/90 backdrop-blur-lg flex items-center justify-between z-10">
        <Button
          onClick={handleSaveAddress}
          disabled={!name.trim() || !phone.trim() || !keyword.trim() || !detailAddress.trim()}
          className="w-full"
          size="lg"
        >
          Simpan Alamat
        </Button>
      </footer>
    </div>
  );
}
