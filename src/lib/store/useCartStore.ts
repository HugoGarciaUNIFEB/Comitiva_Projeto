import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string; // ID único do item na sacola
  productId: string;
  name: string;
  imageUrl: string;
  size: string; // "P" | "M" | "G" | "UNICO"
  weight: string;
  unitPrice: number;
  quantity: number;
  includedSides: string[];
  addedSides: { name: string; price: number }[];
  observations?: string;
}

export interface AppliedCoupon {
  code: string;
  discountType: string;
  discountValue: number;
  description?: string;
}

interface CartStore {
  items: CartItem[];
  coupon: AppliedCoupon | null;
  deliveryType: "DELIVERY" | "PICKUP";
  deliveryFee: number; // Taxa fixa padrão R$ 5,00
  isCartOpen: boolean;

  // Ações
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  applyCoupon: (coupon: AppliedCoupon) => void;
  removeCoupon: () => void;
  setDeliveryType: (type: "DELIVERY" | "PICKUP") => void;

  // Cálculos financeiros
  getSubtotal: () => number;
  getDiscount: () => number;
  getEffectiveDeliveryFee: () => number;
  getTotal: () => number;
  getEstimatedPoints: () => number;
  getTotalItemsCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      coupon: null,
      deliveryType: "DELIVERY",
      deliveryFee: 5.0, // Taxa fixa definida no prompt
      isCartOpen: false,

      openCart: () => set({ isCartOpen: true }),
      closeCart: () => set({ isCartOpen: false }),

      addItem: (newItem) => {
        const id = `${newItem.productId}-${newItem.size}-${(newItem.includedSides || [])
          .slice()
          .sort()
          .join(",")}-${(newItem.addedSides || [])
          .map((s) => s.name)
          .sort()
          .join(",")}`;

        set((state) => {
          const existingIndex = state.items.findIndex((item) => item.id === id);
          if (existingIndex > -1) {
            const updated = [...state.items];
            updated[existingIndex].quantity += newItem.quantity;
            return { items: updated };
          }
          return { items: [...state.items, { ...newItem, id }] };
        });
      },

      removeItem: (id) => {
        set((state) => ({ items: state.items.filter((item) => item.id !== id) }));
      },

      updateQuantity: (id, delta) => {
        set((state) => {
          const updated = state.items
            .map((item) => {
              if (item.id === id) {
                const newQty = item.quantity + delta;
                return newQty > 0 ? { ...item, quantity: newQty } : null;
              }
              return item;
            })
            .filter(Boolean) as CartItem[];
          return { items: updated };
        });
      },

      clearCart: () => {
        set({ items: [], coupon: null });
      },

      applyCoupon: (coupon) => {
        set({ coupon });
      },

      removeCoupon: () => {
        set({ coupon: null });
      },

      setDeliveryType: (deliveryType) => {
        set({ deliveryType });
      },

      getSubtotal: () => {
        const { items } = get();
        return items.reduce((acc, item) => {
          const extraSidesPrice = (item.addedSides || []).reduce(
            (sum, side) => sum + side.price,
            0
          );
          return acc + (item.unitPrice + extraSidesPrice) * item.quantity;
        }, 0);
      },

      getDiscount: () => {
        const { coupon } = get();
        const subtotal = get().getSubtotal();
        if (!coupon) return 0;

        const type = (coupon.discountType || "").toUpperCase();

        // Desconto Percentual (ex: "PERCENT", "PERCENTAGE")
        if (type === "PERCENT" || type === "PERCENTAGE") {
          return (subtotal * coupon.discountValue) / 100;
        }

        // Desconto Fixo em Reais (ex: "FIXED", "FIXED_MEAL_P", "FREE_MEAL_P", "FIXED_MEAL_G", "FIXED_DESSERT", "FIXED_BEVERAGE")
        if (
          type === "FIXED" ||
          type.startsWith("FIXED_") ||
          type === "FREE_MEAL_P"
        ) {
          return Math.min(coupon.discountValue, subtotal);
        }

        return 0;
      },

      getEffectiveDeliveryFee: () => {
        const { deliveryType, deliveryFee, coupon } = get();
        if (deliveryType === "PICKUP") return 0;
        const type = (coupon?.discountType || "").toUpperCase();
        if (type === "FREE_SHIPPING" || type === "FIXED_FREE_SHIPPING") return 0;
        return deliveryFee;
      },

      getTotal: () => {
        const subtotal = get().getSubtotal();
        const discount = get().getDiscount();
        const fee = get().getEffectiveDeliveryFee();
        return Math.max(0, subtotal - discount + fee);
      },

      getEstimatedPoints: () => {
        // R$ 1,00 = 1 ponto conforme regra de negócio
        return Math.floor(get().getTotal());
      },

      getTotalItemsCount: () => {
        return get().items.reduce((acc, item) => acc + item.quantity, 0);
      },
    }),
    {
      name: "comitiva_cart_storage",
    }
  )
);
