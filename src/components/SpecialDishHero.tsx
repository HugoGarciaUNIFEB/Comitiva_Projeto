"use client";

import { useState } from "react";
import { useCartStore } from "@/lib/store/useCartStore";
import SafeImage from "@/components/SafeImage";
import { Flame, Star, ShoppingBag, Check } from "lucide-react";

interface DishSize {
  id: string;
  size: string;
  price: number;
  weight: string;
}

interface DishSide {
  id: string;
  name: string;
  type: string;
  price: number;
  isPaused: boolean;
}

interface SpecialDishHeroProps {
  specialDish: {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    isDailySpecial: boolean;
    isPaused: boolean;
    fireTime?: string | null;
    sizes: DishSize[];
    sides: DishSide[];
  };
  onAddedToCart?: () => void;
}

export default function SpecialDishHero({
  specialDish,
  onAddedToCart,
}: SpecialDishHeroProps) {
  const addItem = useCartStore((state) => state.addItem);

  const defaultSize =
    specialDish.sizes.find((s) => s.size === "M") || specialDish.sizes[0] || {
      id: "def",
      size: "M",
      price: 27.0,
      weight: "550 g",
    };
  const [selectedSize, setSelectedSize] = useState<DishSize>(defaultSize);
  const [quantity, setQuantity] = useState(1);
  const [addedNotice, setAddedNotice] = useState(false);

  const includedSides = specialDish.sides
    .filter((s) => s.type === "INCLUDED" && !s.isPaused)
    .map((s) => s.name);

  const handleAddToCart = () => {
    if (specialDish.isPaused) return;

    addItem({
      productId: specialDish.id,
      name: specialDish.name,
      imageUrl: specialDish.imageUrl,
      size: selectedSize.size,
      weight: selectedSize.weight,
      unitPrice: selectedSize.price,
      quantity,
      includedSides,
      addedSides: [],
    });

    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2000);
    if (onAddedToCart) onAddedToCart();
  };

  const subtotal = selectedSize.price * quantity;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-4 sm:-mt-8 relative z-20 w-full mb-8 sm:mb-12">
      <div className="bg-surface-container-lowest rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden p-4 sm:p-6 md:p-8 border border-outline-variant/30">
        <div className="flex flex-col lg:flex-row gap-6 md:gap-8 items-center">
          {/* Imagem do Prato Especial com Selo */}
          <div className="w-full lg:w-5/12 shrink-0">
            <div className="relative rounded-2xl overflow-hidden aspect-[16/10] bg-surface-container shadow-md">
              <SafeImage
                src={specialDish.imageUrl}
                alt={specialDish.name}
                fallbackSrc="/images/banners/prato_dia_hero.jpg"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 bg-tertiary text-on-tertiary px-3 py-1.5 rounded-full text-xs sm:text-sm shadow-md flex items-center gap-1.5 font-bold">
                <Flame className="w-4 h-4 text-tertiary-fixed-dim" />
                <span>Mais Pedido de Hoje</span>
              </div>
            </div>
          </div>

          {/* Conteúdo & Ação do Prato do Dia */}
          <div className="w-full lg:w-7/12 space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs text-primary font-bold uppercase tracking-wider bg-primary/10 px-2.5 py-1 rounded-full">
                  Especial do Dia • Fogão a Lenha
                </span>
                <span className="flex items-center gap-1 text-tertiary text-xs sm:text-sm font-bold">
                  <Star className="w-4 h-4 fill-current text-tertiary" />
                  4.9 (380+ avaliações)
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl md:text-3xl text-on-surface font-serif font-bold">
                {specialDish.name}
              </h2>

              <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed">
                {specialDish.description}
              </p>
            </div>

            {/* Seleção de Tamanhos do Especial (Responsivo) */}
            <div className="bg-surface-container-low p-3 sm:p-4 rounded-xl sm:rounded-2xl space-y-2 border border-outline-variant/20">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm text-on-surface font-bold">
                  Escolha a porção:
                </span>
                <span className="text-xs text-primary font-semibold hidden sm:inline">
                  Preço ajustado automaticamente
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {specialDish.sizes.map((s) => {
                  const isActive = selectedSize.size === s.size;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSelectedSize(s)}
                      className={`flex flex-col items-center justify-center py-2 px-1 sm:px-3 rounded-xl transition-all min-h-[52px] ${
                        isActive
                          ? "bg-primary text-on-primary shadow-md scale-[1.02] font-bold"
                          : "bg-surface-container text-on-surface hover:bg-surface-container-highest"
                      }`}
                    >
                      <span className="text-xs sm:text-sm font-bold leading-tight">
                        {s.size} ({s.weight.replace(" ", "")})
                      </span>
                      <span
                        className={`text-[11px] sm:text-xs leading-tight hidden xs:inline ${
                          isActive ? "text-primary-fixed" : "text-on-surface-variant"
                        }`}
                      >
                        {s.size === "P"
                          ? "Individual"
                          : s.size === "M"
                          ? "Fartura"
                          : "Para dois"}
                      </span>
                      <span className="text-xs sm:text-base font-extrabold mt-0.5 leading-tight">
                        R$ {s.price.toFixed(0)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Ação: Quantidade e Botão Sacola */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
              <div className="flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto">
                <div className="flex items-center bg-surface-container rounded-xl p-1 border border-outline-variant/30">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-surface-container-highest text-on-surface font-bold text-lg min-h-[40px] min-w-[40px]"
                    aria-label="Diminuir quantidade"
                  >
                    -
                  </button>
                  <span className="w-10 text-center font-bold text-on-surface text-base">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-surface-container-highest text-on-surface font-bold text-lg min-h-[40px] min-w-[40px]"
                    aria-label="Aumentar quantidade"
                  >
                    +
                  </button>
                </div>

                <div className="flex flex-col text-right sm:text-left">
                  <span className="text-xs text-on-surface-variant leading-none">
                    Subtotal
                  </span>
                  <span className="text-lg sm:text-xl text-primary font-bold font-serif">
                    R$ {subtotal.toFixed(2).replace(".", ",")}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={specialDish.isPaused}
                className={`w-full sm:w-auto px-6 py-3 min-h-[48px] rounded-xl text-sm sm:text-base shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 font-bold cursor-pointer ${
                  specialDish.isPaused
                    ? "bg-surface-container-highest text-on-surface-variant cursor-not-allowed"
                    : addedNotice
                    ? "bg-tertiary text-on-tertiary"
                    : "bg-primary hover:bg-primary-container text-on-primary"
                }`}
              >
                {addedNotice ? <Check className="w-5 h-5" /> : <ShoppingBag className="w-5 h-5" />}
                <span>
                  {specialDish.isPaused
                    ? "Esgotado no Fogão"
                    : addedNotice
                    ? "Adicionado à Sacola!"
                    : "Adicionar à Sacola"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
