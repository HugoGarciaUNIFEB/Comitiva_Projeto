"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import DishCard from "@/components/DishCard";
import SpecialDishHero from "@/components/SpecialDishHero";
import SafeImage from "@/components/SafeImage";
import { useCartStore } from "@/lib/store/useCartStore";
import {
  Flame,
  Clock,
  Truck,
  Sparkles,
  CookingPot,
  Plus,
  Ban,
  Loader2,
  UtensilsCrossed,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";

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

interface Dish {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  category: string;
  isDailySpecial: boolean;
  isPaused: boolean;
  fireTime?: string | null;
  sizes: ProductSize[];
  sides: ProductSide[];
}

export default function HomePage() {
  const [products, setProducts] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("todas");
  const [cartOpen, setCartOpen] = useState(false);

  const addItem = useCartStore((state) => state.addItem);
  const totalItemsCount = useCartStore((state) => state.getTotalItemsCount());
  const getTotal = useCartStore((state) => state.getTotal);

  // Busca inicial dos produtos
  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (e) {
      console.error("Erro no polling de produtos:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();

    // Polling a cada 5 segundos para pausa emergencial de pratos e atualização em tempo real
    const interval = setInterval(fetchProducts, 5000);
    return () => clearInterval(interval);
  }, []);

  // Separação dos pratos
  const specialDish = products.find((p) => p.isDailySpecial) || products[0];
  const marmitas = products.filter((p) => p.category === "marmita");
  const complementos = products.filter((p) => p.category === "complemento");
  const bebidas = products.filter((p) => p.category === "bebida");
  const sobremesas = products.filter((p) => p.category === "sobremesa");

  // Filtro de categorias
  const filteredMarmitas = marmitas.filter((dish) => {
    if (activeCategory === "todas") return true;
    if (activeCategory === "brasa") return dish.name.toLowerCase().includes("costela");
    if (activeCategory === "caipira") return !dish.name.toLowerCase().includes("costela");
    return true;
  });

  // Adição rápida de item simples (sobremesa / bebida / complemento)
  const handleQuickAdd = (product: Dish) => {
    if (product.isPaused) return;
    const size = product.sizes[0] || { size: "UNICO", price: 10, weight: "" };

    addItem({
      productId: product.id,
      name: product.name,
      imageUrl: product.imageUrl,
      size: size.size,
      weight: size.weight,
      unitPrice: size.price,
      quantity: 1,
      includedSides: [],
      addedSides: [],
    });
    setCartOpen(true);
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col font-sans selection:bg-primary-container selection:text-on-primary-container overflow-x-hidden">
      {/* Cabeçalho */}
      <Header onOpenCart={() => setCartOpen(true)} />

      {/* Drawer do Carrinho */}
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      <main className={`flex-1 pt-20 sm:pt-24 ${totalItemsCount > 0 ? "pb-28 lg:pb-16" : "pb-16"}`}>
        {/* HERO SECTION / BANNER PRINCIPAL */}
        <section className="relative overflow-hidden bg-surface-container-low border-b border-outline-variant/30 py-8 sm:py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-center">
              {/* Coluna Esquerda: Textos de Impacto */}
              <div className="lg:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-1.5 bg-tertiary-fixed text-on-tertiary-fixed px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold shadow-xs">
                  <Flame className="w-4 h-4 text-tertiary shrink-0" />
                  <span>Autêntica Comida de Comitiva em Jaborandi - SP</span>
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl text-on-surface leading-[1.15] font-serif font-bold">
                  O calor do fogão a lenha direto na sua marmita.
                </h1>

                <p className="text-base sm:text-lg text-on-surface-variant max-w-xl leading-relaxed">
                  Pratos artesanais fartos, cozidos lentamente na brasa e no tacho de ferro.
                  Arroz de comitiva, feijão tropeiro e carnes nobres com aquele sabor defumado
                  inesquecível.
                </p>

                {/* Métricas e Badges de Operação Rápida */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-2">
                  <div className="flex items-center gap-2 px-3.5 py-2 min-h-[44px] rounded-xl bg-surface-container text-on-surface shadow-xs border border-outline-variant/30">
                    <Clock className="w-5 h-5 text-primary shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-[11px] text-on-surface-variant leading-none">
                        Tempo de Entrega
                      </span>
                      <span className="text-sm font-bold leading-tight">30 a 45 min</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 px-3.5 py-2 min-h-[44px] rounded-xl bg-surface-container text-on-surface shadow-xs border border-outline-variant/30">
                    <CookingPot className="w-5 h-5 text-tertiary shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-[11px] text-on-surface-variant leading-none">
                        Panelas no Fogo
                      </span>
                      <span className="text-sm font-bold leading-tight">
                        10h30 às 13h00
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 px-3.5 py-2 min-h-[44px] rounded-xl bg-primary-fixed text-on-primary-fixed shadow-xs border border-outline-variant/30">
                    <Truck className="w-5 h-5 text-primary shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-[11px] text-on-primary-fixed-variant leading-none">
                        Jaborandi - SP
                      </span>
                      <span className="text-sm font-bold leading-tight">Taxa Fixa R$ 5,00</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Coluna Direita: Imagem de Destaque */}
              <div className="lg:col-span-5 relative mt-4 lg:mt-0">
                <div className="relative rounded-2xl overflow-hidden shadow-xl bg-surface-container-high aspect-[4/3] lg:aspect-square border border-outline-variant/30">
                  <SafeImage
                    className="w-full h-full object-cover"
                    alt="Costelão Fogo de Chão"
                    src="/images/pratos/costela_fogo_chao.jpg"
                    fallbackSrc="/images/banners/banner_home.jpg"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/85 via-transparent to-transparent flex flex-col justify-end p-5 sm:p-6 text-on-primary">
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="w-4 h-4 text-tertiary-fixed-dim" />
                      <span className="text-xs uppercase tracking-wider text-tertiary-fixed-dim font-bold">
                        Tradição Caipira
                      </span>
                    </div>
                    <p className="text-base sm:text-lg leading-tight text-surface-bright font-serif">
                      Costela assada lentamente na brasa do chão com mandioca derretendo
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PRATO ESPECIAL DO DIA (HERO CARD) */}
        {specialDish && (
          <SpecialDishHero
            specialDish={specialDish}
            onAddedToCart={() => setCartOpen(true)}
          />
        )}

        {/* GRADE DE MARMITAS PRINCIPAIS */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 w-full">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-outline-variant/30 pb-4">
            <div>
              <div className="inline-flex items-center gap-1 text-primary text-xs font-bold uppercase tracking-wider">
                <UtensilsCrossed className="w-4 h-4" />
                Almoço Artesanal Completo
              </div>
              <h2 className="text-2xl sm:text-3xl text-on-surface font-serif font-bold">
                Cardápio do Fogo &amp; Panela
              </h2>
              <p className="text-sm text-on-surface-variant">
                Selecione o tamanho da marmita e personalize os acompanhamentos do seu almoço
              </p>
            </div>

            {/* Abas de Categorias */}
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 no-scrollbar">
              <button
                type="button"
                onClick={() => setActiveCategory("todas")}
                className={`shrink-0 px-4 py-2.5 min-h-[44px] rounded-full text-sm transition-all font-bold cursor-pointer ${
                  activeCategory === "todas"
                    ? "bg-primary text-on-primary shadow-sm"
                    : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                }`}
              >
                Todas as Marmitas
              </button>
              <button
                type="button"
                onClick={() => setActiveCategory("brasa")}
                className={`shrink-0 px-4 py-2.5 min-h-[44px] rounded-full text-sm transition-all font-bold cursor-pointer ${
                  activeCategory === "brasa"
                    ? "bg-primary text-on-primary shadow-sm"
                    : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                }`}
              >
                Feitas na Brasa
              </button>
              <button
                type="button"
                onClick={() => setActiveCategory("caipira")}
                className={`shrink-0 px-4 py-2.5 min-h-[44px] rounded-full text-sm transition-all font-bold cursor-pointer ${
                  activeCategory === "caipira"
                    ? "bg-primary text-on-primary shadow-sm"
                    : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                }`}
              >
                Pratos Caipiras
              </button>
            </div>
          </div>

          {/* Grade de Marmitas: 1 col celular, 2 col tablet (md), 4 col desktop (lg) */}
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-on-surface-variant">
              <Loader2 className="w-10 h-10 animate-spin text-primary mb-2" />
              <p className="text-sm">Carregando marmitas do fogão a lenha...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch mt-6">
              {filteredMarmitas.map((dish) => (
                <DishCard
                  key={dish.id}
                  dish={dish}
                  onAddedToCart={() => setCartOpen(true)}
                />
              ))}
            </div>
          )}
        </section>

        {/* SEÇÃO COMPLEMENTOS, SOBREMESAS E BEBIDAS */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-4">
            <div>
              <div className="inline-flex items-center gap-1 text-tertiary text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                Feito no Tacho &amp; Pomar
              </div>
              <h2 className="text-2xl sm:text-3xl text-on-surface font-serif font-bold">
                Adicionais, Sobremesas &amp; Bebidas
              </h2>
            </div>
            <span className="text-xs sm:text-sm text-on-surface-variant">
              Complete seu almoço caipira com o toque doce da roça
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...sobremesas, ...complementos, ...bebidas].map((item) => {
              const price = item.sizes[0]?.price || 5.0;
              return (
                <div
                  key={item.id}
                  className={`bg-surface-container-lowest rounded-2xl p-3.5 sm:p-4 shadow-sm flex items-center gap-3.5 hover:shadow-md transition-shadow border border-outline-variant/30 ${
                    item.isPaused ? "opacity-50" : ""
                  }`}
                >
                  <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-surface-container shadow-xs">
                    <SafeImage
                      src={item.imageUrl}
                      alt={item.name}
                      fallbackSrc="/images/sobremesas/doce_leite.jpg"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm text-on-surface font-bold truncate">
                      {item.name}
                    </h4>
                    <p className="text-xs text-on-surface-variant line-clamp-1">
                      {item.description}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm font-bold text-primary font-serif">
                        R$ {price.toFixed(2).replace(".", ",")}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleQuickAdd(item)}
                        disabled={item.isPaused}
                        className={`w-10 h-10 min-h-[40px] min-w-[40px] rounded-xl flex items-center justify-center transition-colors shadow-xs cursor-pointer ${
                          item.isPaused
                            ? "bg-surface-container-highest text-on-surface-variant cursor-not-allowed"
                            : "bg-surface-container-high hover:bg-primary hover:text-on-primary text-on-surface"
                        }`}
                        title="Adicionar à sacola"
                        aria-label={`Adicionar ${item.name}`}
                      >
                        {item.isPaused ? <Ban className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* BARRA FIXA DA SACOLA NO RODAPÉ NO CELULAR (≤1023px) - Sem cobrir conteúdo */}
      {totalItemsCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-md border-t border-outline-variant/30 p-3 shadow-2xl lg:hidden animate-in slide-in-from-bottom duration-200">
          <div className="max-w-md mx-auto flex items-center justify-between gap-3">
            <div className="flex flex-col">
              <span className="text-xs text-on-surface-variant font-medium">
                {totalItemsCount} {totalItemsCount === 1 ? "marmita na sacola" : "itens na sacola"}
              </span>
              <span className="text-lg font-bold text-primary font-serif leading-tight">
                R$ {getTotal().toFixed(2).replace(".", ",")}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="px-5 py-3 min-h-[44px] bg-primary text-on-primary rounded-xl font-bold text-sm flex items-center gap-2 shadow-md hover:bg-primary-container active:scale-95 transition-all cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Ver Sacola</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Footer Completo */}
      <Footer />
    </div>
  );
}
