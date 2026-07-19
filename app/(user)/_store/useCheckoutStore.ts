import { create } from "zustand";

export type ShippingArea = "garut-city" | "outside-garut";

export interface Address {
  shippingArea: ShippingArea | null;

  areaId: string;
  name: string;
  phone: string;

  address: string;
  detailAddress: string;
  detailOther: string;
}

export interface CourierRate {
  company: string;
  courier: string;
  serviceType: string;
  serviceName: string;
  description: string;
  shipmentDurationRange: string;
  shipmentDurationUnit: "days" | "hours";
  price: number;
}

interface CheckoutState {
  address: Address;
  selectedRate: CourierRate | null;

  setAddress: (address: Partial<Address>) => void;
  resetAddress: () => void;

  setSelectedRate: (rate: CourierRate | null) => void;

  reset: () => void;
}

const initialAddress: Address = {
  shippingArea: null,
  areaId: "",
  name: "",
  phone: "",
  address: "",
  detailAddress: "",
  detailOther: "",
};

export const useCheckoutStore = create<CheckoutState>((set) => ({
  address: initialAddress,
  selectedRate: null,

  setAddress: (address) =>
    set((state) => ({
      address: {
        ...state.address,
        ...address,
      },
    })),

  resetAddress: () =>
    set({
      address: initialAddress,
    }),

  setSelectedRate: (selectedRate) =>
    set({
      selectedRate,
    }),

  reset: () =>
    set({
      address: initialAddress,
      selectedRate: null,
    }),
}));
