"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useCartStore } from "@/lib/store/useCartStore";
import SafeImage from "@/components/SafeImage";
import { ShoppingBag, X, Trash2, Plus, Minus, ArrowRight, Award } from "lucide-react";

interface CartDrawerProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function CartDrawer({ isOpen: propIsOpen, onClose: propOnClose }: CartDrawerProps = {}) {
  const {
    items,
    removeItem,
    updateQuantity,
    getSubtotal,
    getDiscount,
    getEffectiveDeliveryFee,
    getTotal,
    getEstimatedPoints,
    coupon,
    deliveryType,
    isCartOpen,
    closeCart,
  } = useCartStore();

  const isOpen = propIsOpen !== undefined ? propIsOpen : isCartOpen;
  const onClose = propOnClose || closeCart;

  // Fecha o drawer ao pressionar ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop com blur suave */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10 w-full sm:w-auto">
        <div className="w-full sm:w-screen sm:max-w-md bg-surface-container-lowest shadow-2xl flex flex-col border-l border-outline-variant/30 animate-slide-left">
          {/* Header do Drawer */}
          <div className="h-16 px-4 sm:px-6 bg-surface-container-low flex items-center justify-between border-b border-outline-variant/20">
            <div className="flex items-center gap-2 text-primary font-serif">
              <ShoppingBag className="w-5 h-5 text-primary shrink-0" />
              <h2 className="text-lg sm:text-xl font-bold text-on-surface">
                Sua Sacola de Almoço
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 min-h-[44px] min-w-[44px] rounded-full bg-surface-container-high hover:bg-surface-container-highest text-on-surface flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Fechar sacola"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Lista de Itens */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-on-surface-variant">
                <SafeImage
                  src="/images/vazio/carrinho_vazio.svg"
                  alt="Carrinho vazio"
                  className="w-32 h-32 mb-3 opacity-80"
                />
                <p className="text-base sm:text-lg text-on-surface font-bold">Sua sacola está vazia</p>
                <p className="text-sm text-on-surface-variant mt-1">
                  Escolha uma marmita quentinha no cardápio para pedir agora!
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-4 px-6 py-3 min-h-[44px] bg-primary text-on-primary rounded-xl font-bold text-sm shadow-sm hover:bg-primary-container transition-colors"
                >
                  Ver Cardápio do Dia
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-surface-container-low rounded-2xl border border-outline-variant/30 flex flex-col gap-2"
                >
                  <div className="flex gap-3 items-start">
                    <SafeImage
                      src={item.imageUrl}
                      alt={item.name}
                      fallbackSrc="/images/pratos/costela_fogo_chao.jpg"
                      className="w-16 h-16 rounded-xl object-cover bg-surface-container shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <h3 className="text-sm font-bold text-on-surface truncate">
                          {item.name}
                        </h3>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="text-error hover:opacity-80 p-1 min-h-[36px] min-w-[36px] flex items-center justify-center"
                          title="Remover"
                          aria-label={`Remover ${item.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        {item.size !== "UNICO" && (
                          <span className="bg-primary-fixed text-on-primary-fixed text-[11px] font-bold px-1.5 py-0.5 rounded">
                            Tam {item.size} • {item.weight}
                          </span>
                        )}
                        <span className="text-sm text-primary font-bold">
                          R$ {item.unitPrice.toFixed(2).replace(".", ",")}
                        </span>
                      </div>

                      {item.includedSides && item.includedSides.length > 0 && (
                        <p className="text-xs text-on-surface-variant line-clamp-1 mt-0.5">
                          Guarnições: {item.includedSides.join(", ")}
                        </p>
                      )}

                      {item.addedSides && item.addedSides.length > 0 && (
                        <p className="text-xs text-tertiary-container line-clamp-1">
                          Adicionais: {item.addedSides.map((s) => s.name).join(", ")}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Controle de Quantidade e Subtotal */}
                  <div className="flex items-center justify-between pt-1 border-t border-outline-variant/20">
                    <div className="flex items-center bg-surface-container-lowest rounded-xl border border-outline-variant/30">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-9 h-9 min-h-[36px] min-w-[36px] flex items-center justify-center hover:bg-surface-container-high text-on-surface font-bold text-base"
                        aria-label="Diminuir"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center font-bold text-sm text-on-surface">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-9 h-9 min-h-[36px] min-w-[36px] flex items-center justify-center hover:bg-surface-container-high text-on-surface font-bold text-base"
                        aria-label="Aumentar"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <span className="text-base text-on-surface font-bold font-serif">
                      R${" "}
                      {(
                        (item.unitPrice +
                          (item.addedSides || []).reduce((sum, s) => sum + s.price, 0)) *
                        item.quantity
                      )
                        .toFixed(2)
                        .replace(".", ",")}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Rodapé Financeiro e Botão Checkout */}
          {items.length > 0 && (
            <div className="p-4 bg-surface-container border-t border-outline-variant/20 space-y-3">
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-on-surface-variant">
                  <span>Subtotal</span>
                  <span className="font-semibold text-on-surface">
                    R$ {getSubtotal().toFixed(2).replace(".", ",")}
                  </span>
                </div>

                {coupon && (
                  <div className="flex justify-between text-tertiary font-semibold">
                    <span>Cupom ({coupon.code})</span>
                    <span>- R$ {getDiscount().toFixed(2).replace(".", ",")}</span>
                  </div>
                )}

                <div className="flex justify-between text-on-surface-variant">
                  <span>Entrega ({deliveryType === "PICKUP" ? "Balcão" : "Jaborandi"})</span>
                  <span className="font-semibold text-on-surface">
                    {getEffectiveDeliveryFee() === 0
                      ? "Grátis"
                      : `R$ ${getEffectiveDeliveryFee().toFixed(2).replace(".", ",")}`}
                  </span>
                </div>

                <div className="flex justify-between text-base font-bold text-on-surface pt-2 border-t border-outline-variant/30">
                  <span>Total</span>
                  <span className="text-xl text-primary font-bold font-serif">
                    R$ {getTotal().toFixed(2).replace(".", ",")}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-secondary font-semibold bg-tertiary-fixed/30 p-2 rounded-xl">
                  <Award className="w-4 h-4 text-tertiary shrink-0" />
                  <span>
                    Você acumula <strong>{getEstimatedPoints()} pontos</strong> neste pedido!
                  </span>
                </div>
              </div>

              <Link
                href="/checkout"
                onClick={onClose}
                className="w-full h-12 min-h-[48px] bg-primary hover:bg-primary-container text-on-primary font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-transform active:scale-95 text-base"
              >
                <span>Finalizar Pedido no Checkout</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
