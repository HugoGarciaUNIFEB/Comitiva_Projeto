"use client";

import { useState } from "react";
import { useCartStore } from "@/lib/store/useCartStore";
import SafeImage from "@/components/SafeImage";
import { Flame, Check, Plus, CookingPot } from "lucide-react";

interface ProductSize {
  id: string;
  size: string;
  price: number;
  weight: string;
}

interface ProductSide {
  id: string;
  name: string;
  type: string;
  price: number;
  isPaused: boolean;
}

interface DishCardProps {
  dish: {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    isDailySpecial: boolean;
    isPaused: boolean;
    fireTime?: string | null;
    sizes: ProductSize[];
    sides: ProductSide[];
  };
  onAddedToCart?: () => void;
}

export default function DishCard({ dish, onAddedToCart }: DishCardProps) {
  const addItem = useCartStore((state) => state.addItem);

  // Ordenação dos tamanhos P, M, G ou tamanho único
  const sortedSizes = [...dish.sizes].sort((a, b) => {
    const order: Record<string, number> = { P: 1, M: 2, G: 3, UNICO: 4 };
    return (order[a.size] || 99) - (order[b.size] || 99);
  });

  // Tamanho padrão: seleciona 'M' se existir, ou o primeiro
  const defaultSize = sortedSizes.find((s) => s.size === "M") || sortedSizes[0] || {
    id: "default",
    size: "UNICO",
    price: 25.0,
    weight: "400 g",
  };

  const [selectedSize, setSelectedSize] = useState<ProductSize>(defaultSize);

  // Guarnições inclusas marcadas (por padrão todas ativas)
  const includedSides = dish.sides.filter((s) => s.type === "INCLUDED" && !s.isPaused);
  const [checkedSides, setCheckedSides] = useState<string[]>(
    includedSides.map((s) => s.name)
  );

  const [addedNotice, setAddedNotice] = useState(false);

  const toggleSide = (sideName: string) => {
    if (checkedSides.includes(sideName)) {
      setCheckedSides(checkedSides.filter((s) => s !== sideName));
    } else {
      setCheckedSides([...checkedSides, sideName]);
    }
  };

  const handleAddToCart = () => {
    if (dish.isPaused) return;

    addItem({
      productId: dish.id,
      name: dish.name,
      imageUrl: dish.imageUrl,
      size: selectedSize.size,
      weight: selectedSize.weight,
      unitPrice: selectedSize.price,
      quantity: 1,
      includedSides: checkedSides,
      addedSides: [],
    });

    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2000);
    if (onAddedToCart) onAddedToCart();
  };

  return (
    <div
      className={`dish-card flex flex-col bg-surface-container-lowest rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden group border border-outline-variant/30 ${
        dish.isPaused ? "opacity-60 grayscale-[40%]" : ""
      }`}
    >
      {/* Imagem do Prato com Badge */}
      <div className="relative aspect-[16/10] overflow-hidden bg-surface-container">
        <SafeImage
          src={dish.imageUrl}
          alt={dish.name}
          fallbackSrc="/images/pratos/costela_fogo_chao.jpg"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {dish.isPaused ? (
          <div className="absolute top-2.5 right-2.5 bg-error text-on-error px-2.5 py-1 rounded-full text-xs font-bold shadow-sm">
            Esgotado no Fogão
          </div>
        ) : dish.fireTime ? (
          <div className="absolute top-2.5 right-2.5 bg-secondary text-on-secondary px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm">
            <Flame className="w-3.5 h-3.5 text-tertiary-fixed-dim" />
            <span>{dish.fireTime}</span>
          </div>
        ) : null}
      </div>

      {/* Conteúdo do Card */}
      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
        <div className="space-y-1.5">
          <div className="flex items-center gap-1 text-primary">
            <CookingPot className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">
              {dish.isDailySpecial ? "Especial do Dia" : "Marmita Caipira"}
            </span>
          </div>

          <h3 className="text-base sm:text-lg text-on-surface font-serif font-bold leading-snug">
            {dish.name}
          </h3>

          <p className="text-sm text-on-surface-variant line-clamp-2 leading-relaxed">
            {dish.description}
          </p>
        </div>

        {/* Guarnições Inclusas para Personalizar */}
        {includedSides.length > 0 && (
          <div className="space-y-1 pt-1 border-t border-outline-variant/15">
            <span className="text-xs text-on-surface-variant font-bold block">
              Guarnições inclusas (toque para retirar):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {includedSides.map((side) => {
                const isChecked = checkedSides.includes(side.name);
                return (
                  <button
                    key={side.id}
                    type="button"
                    onClick={() => toggleSide(side.name)}
                    className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg cursor-pointer select-none transition-colors border min-h-[32px] ${
                      isChecked
                        ? "bg-primary/10 border-primary/30 text-on-surface font-semibold"
                        : "bg-surface-container border-transparent text-on-surface-variant line-through opacity-70"
                    }`}
                  >
                    <span
                      className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[10px] ${
                        isChecked ? "bg-primary text-on-primary" : "border border-outline-variant"
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3" />}
                    </span>
                    <span>{side.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Seletor de Tamanhos (P, M, G) - Responsivo e sem quebrar em 360px */}
        {dish.sizes.length > 1 && (
          <div className="bg-surface-container-low p-1.5 rounded-xl border border-outline-variant/20">
            <div className="grid grid-cols-3 gap-1">
              {dish.sizes.map((s) => {
                const isSelected = selectedSize.size === s.size;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedSize(s)}
                    disabled={dish.isPaused}
                    className={`min-h-[46px] py-1.5 px-1 rounded-lg text-center transition-all flex flex-col items-center justify-center ${
                      isSelected
                        ? "bg-primary text-on-primary font-bold shadow-xs scale-[1.02]"
                        : "bg-surface text-on-surface hover:bg-surface-container-high"
                    }`}
                  >
                    <span className="text-xs font-bold leading-tight truncate max-w-full">
                      {s.size} <span className="opacity-80 text-[11px]">({s.weight.replace(" ", "")})</span>
                    </span>
                    <span
                      className={`text-xs font-extrabold leading-tight ${
                        isSelected ? "text-on-primary" : "text-primary"
                      }`}
                    >
                      R$ {s.price.toFixed(0)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Rodapé do Card: Preço e Botão de Adição */}
        <div className="flex items-center justify-between pt-2 border-t border-outline-variant/20 mt-auto">
          <div>
            <span className="text-xs text-on-surface-variant block leading-none">
              Preço
            </span>
            <span className="text-lg sm:text-xl text-primary font-bold font-serif">
              R$ {selectedSize.price.toFixed(2).replace(".", ",")}
            </span>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={dish.isPaused}
            className={`px-4 py-2.5 min-h-[44px] min-w-[120px] rounded-xl text-sm transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 font-bold cursor-pointer ${
              dish.isPaused
                ? "bg-surface-container-highest text-on-surface-variant cursor-not-allowed"
                : addedNotice
                ? "bg-tertiary text-on-tertiary"
                : "bg-primary hover:bg-primary-container text-on-primary"
            }`}
          >
            {addedNotice ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{addedNotice ? "Adicionado!" : "Adicionar"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
