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
    <section className="max-w-7xl mx-auto px-margin-lg -mt-8 relative z-20 w-full mb-space-xl">
      <div className="bg-surface-container-lowest rounded-2xl shadow-xl overflow-hidden p-6 md:p-8 border border-outline-variant/30">
        <div className="flex flex-col lg:flex-row gap-gutter-lg items-center">
          {/* Imagem do Prato Especial com Selo */}
          <div className="w-full lg:w-5/12 shrink-0">
            <div className="relative rounded-xl overflow-hidden aspect-[16/10] bg-surface-container shadow-md">
              <SafeImage
                src={specialDish.imageUrl}
                alt={specialDish.name}
                fallbackSrc="/images/banners/prato_dia_hero.jpg"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 bg-tertiary text-on-tertiary px-3 py-1.5 rounded-full font-label-md text-label-md shadow-md flex items-center gap-1.5 font-bold">
                <Flame className="w-4 h-4 text-tertiary-fixed-dim" />
                <span>Mais Pedido de Hoje</span>
              </div>
            </div>
          </div>

          {/* Conteúdo & Ação do Prato do Dia */}
          <div className="w-full lg:w-7/12 space-y-space-md flex flex-col justify-between">
            <div className="space-y-space-xs">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="font-label-sm text-label-sm text-primary font-bold uppercase tracking-widest bg-primary/10 px-2.5 py-1 rounded-full">
                  Especial do Dia • Fogão a Lenha
                </span>
                <span className="flex items-center gap-1 text-tertiary font-label-md text-label-md font-bold">
                  <Star className="w-4 h-4 fill-current text-tertiary" />
                  4.9 (380+ avaliações)
                </span>
              </div>

              <h2 className="font-headline-lg text-headline-lg text-on-surface font-serif">
                {specialDish.name}
              </h2>

              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                {specialDish.description}
              </p>
            </div>

            {/* Seleção de Tamanhos do Especial */}
            <div className="bg-surface-container-low p-4 rounded-xl space-y-space-xs border border-outline-variant/20">
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md text-on-surface font-bold">
                  Escolha a porção para hoje:
                </span>
                <span className="font-label-sm text-label-sm text-primary font-semibold">
                  Preço ajustado automaticamente
                </span>
              </div>

              <div className="grid grid-cols-3 gap-space-sm">
                {specialDish.sizes.map((s) => {
                  const isActive = selectedSize.size === s.size;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSelectedSize(s)}
                      className={`flex flex-col items-center py-2.5 px-3 rounded-lg transition-all ${
                        isActive
                          ? "bg-primary text-on-primary shadow-md scale-[1.02] font-bold"
                          : "bg-surface-container text-on-surface hover:bg-surface-container-highest"
                      }`}
                    >
                      <span className="font-label-lg text-label-lg">
                        {s.size} ({s.weight})
                      </span>
                      <span
                        className={`font-label-sm text-label-sm ${
                          isActive ? "text-primary-fixed" : "text-on-surface-variant"
                        }`}
                      >
                        {s.size === "P"
                          ? "Individual"
                          : s.size === "M"
                          ? "Fartura caipira"
                          : "Para dois"}
                      </span>
                      <span className="font-title-md text-title-md font-extrabold mt-1">
                        R$ {s.price.toFixed(2).replace(".", ",")}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Ação Direta: Quantidade e Botão Sacola */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-space-md pt-2">
              <div className="flex items-center gap-space-sm w-full sm:w-auto">
                <div className="flex items-center bg-surface-container rounded-lg p-1 border border-outline-variant/30">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-surface-container-highest text-on-surface font-bold text-lg"
                  >
                    -
                  </button>
                  <span className="w-10 text-center font-bold text-on-surface font-title-md text-title-md">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-surface-container-highest text-on-surface font-bold text-lg"
                  >
                    +
                  </button>
                </div>

                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm text-on-surface-variant">
                    Subtotal marmita
                  </span>
                  <span className="font-title-md text-title-md text-primary font-bold font-serif">
                    R$ {subtotal.toFixed(2).replace(".", ",")}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={specialDish.isPaused}
                className={`w-full sm:w-auto px-8 py-3.5 rounded-lg font-label-lg text-label-lg shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 font-bold ${
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
                    : "Adicionar à Sacola de Almoço"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
