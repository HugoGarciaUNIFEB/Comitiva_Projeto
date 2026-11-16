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
    <div className="min-h-screen bg-surface flex flex-col font-sans selection:bg-primary-container selection:text-on-primary-container">
      {/* Cabeçalho */}
      <Header onOpenCart={() => setCartOpen(true)} />

      {/* Drawer do Carrinho */}
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      <main className="flex-1 pt-24 pb-16">
        {/* HERO SECTION / BANNER PRINCIPAL */}
        <section className="relative overflow-hidden bg-surface-container-low border-b border-outline-variant/30 py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-margin-lg">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-lg items-center">
              {/* Coluna Esquerda: Textos de Impacto */}
              <div className="lg:col-span-7 space-y-space-md">
                <div className="inline-flex items-center gap-space-xs bg-tertiary-fixed text-on-tertiary-fixed px-3 py-1.5 rounded-full font-label-md text-label-md font-bold shadow-xs">
                  <Flame className="w-4 h-4 text-tertiary" />
                  <span>Autêntica Comida de Comitiva em Jaborandi - SP</span>
                </div>

                <h1 className="font-display text-display text-on-surface leading-[1.1] font-serif">
                  O calor do fogão a lenha direto na sua marmita.
                </h1>

                <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">
                  Pratos artesanais fartos, cozidos lentamente na brasa e no tacho de ferro.
                  Arroz de comitiva, feijão tropeiro e carnes nobres com aquele sabor defumado
                  inesquecível.
                </p>

                {/* Métricas e Badges de Operação Rápida */}
                <div className="flex flex-wrap items-center gap-space-sm pt-2">
                  <div className="flex items-center gap-space-xs px-4 py-2 rounded-xl bg-surface-container text-on-surface shadow-sm border border-outline-variant/30">
                    <Clock className="w-5 h-5 text-primary" />
                    <div className="flex flex-col">
                      <span className="font-label-sm text-label-sm text-on-surface-variant">
                        Tempo de Entrega
                      </span>
                      <span className="font-label-lg text-label-lg font-bold">30 a 45 min</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-space-xs px-4 py-2 rounded-xl bg-surface-container text-on-surface shadow-sm border border-outline-variant/30">
                    <CookingPot className="w-5 h-5 text-tertiary" />
                    <div className="flex flex-col">
                      <span className="font-label-sm text-label-sm text-on-surface-variant">
                        Panelas no Fogo
                      </span>
                      <span className="font-label-lg text-label-lg font-bold">
                        10h30 às 13h00
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-space-xs px-4 py-2 rounded-xl bg-primary-fixed text-on-primary-fixed shadow-sm border border-outline-variant/30">
                    <Truck className="w-5 h-5 text-primary" />
                    <div className="flex flex-col">
                      <span className="font-label-sm text-label-sm text-on-primary-fixed-variant">
                        Jaborandi - SP
                      </span>
                      <span className="font-label-lg text-label-lg font-bold">Taxa Fixa R$ 5,00</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Coluna Direita: Imagem de Destaque */}
              <div className="lg:col-span-5 relative">
                <div className="relative rounded-2xl overflow-hidden shadow-xl bg-surface-container-high aspect-[4/3] lg:aspect-square border border-outline-variant/30">
                  <SafeImage
                    className="w-full h-full object-cover"
                    alt="Costelão Fogo de Chão"
                    src="/images/pratos/costela_fogo_chao.jpg"
                    fallbackSrc="/images/banners/banner_home.jpg"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/85 via-transparent to-transparent flex flex-col justify-end p-6 text-on-primary">
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="w-5 h-5 text-tertiary-fixed-dim" />
                      <span className="font-label-md text-label-md uppercase tracking-wider text-tertiary-fixed-dim font-bold">
                        Tradição Caipira
                      </span>
                    </div>
                    <p className="font-headline-sm text-headline-sm leading-tight text-surface-bright font-serif">
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
        <section className="max-w-7xl mx-auto px-margin-lg py-space-lg w-full">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-space-md border-b border-outline-variant/30 pb-space-md">
            <div>
              <div className="inline-flex items-center gap-1 text-primary font-label-sm text-label-sm font-bold uppercase tracking-wider">
                <UtensilsCrossed className="w-4 h-4" />
                Almoço Artesanal Completo
              </div>
              <h2 className="font-headline-md text-headline-md text-on-surface font-serif">
                Cardápio do Fogo &amp; Panela
              </h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Selecione o tamanho da marmita e personalize os acompanhamentos do seu almoço
              </p>
            </div>

            {/* Abas de Categorias */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
              <button
                type="button"
                onClick={() => setActiveCategory("todas")}
                className={`shrink-0 px-4 py-2 rounded-full font-label-md text-label-md transition-all font-bold ${
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
                className={`shrink-0 px-4 py-2 rounded-full font-label-md text-label-md transition-all font-bold ${
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
                className={`shrink-0 px-4 py-2 rounded-full font-label-md text-label-md transition-all font-bold ${
                  activeCategory === "caipira"
                    ? "bg-primary text-on-primary shadow-sm"
                    : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                }`}
              >
                Pratos Caipiras
              </button>
            </div>
          </div>

          {/* Grade de Marmitas */}
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-on-surface-variant">
              <Loader2 className="w-10 h-10 animate-spin text-primary mb-2" />
              <p>Carregando marmitas do fogão a lenha...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter-lg items-stretch mt-space-lg">
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
        <section className="max-w-7xl mx-auto px-margin-lg py-space-xl w-full">
          <div className="flex items-center justify-between mb-space-md">
            <div>
              <div className="inline-flex items-center gap-1 text-tertiary font-label-sm text-label-sm font-bold uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                Feito no Tacho &amp; Pomar
              </div>
              <h2 className="font-headline-md text-headline-md text-on-surface font-serif">
                Adicionais, Sobremesas &amp; Bebidas
              </h2>
            </div>
            <span className="hidden sm:inline font-body-sm text-body-sm text-on-surface-variant">
              Complete seu almoço caipira com o toque doce da roça
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter-md">
            {[...sobremesas, ...complementos, ...bebidas].map((item) => {
              const price = item.sizes[0]?.price || 5.0;
              return (
                <div
                  key={item.id}
                  className={`bg-surface-container-lowest rounded-xl p-4 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow border border-outline-variant/30 ${
                    item.isPaused ? "opacity-50" : ""
                  }`}
                >
                  <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-surface-container shadow-xs">
                    <SafeImage
                      src={item.imageUrl}
                      alt={item.name}
                      fallbackSrc="/images/sobremesas/doce_leite.jpg"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-title-md text-sm text-on-surface font-bold truncate">
                      {item.name}
                    </h4>
                    <p className="font-body-sm text-xs text-on-surface-variant line-clamp-1">
                      {item.description}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-title-md text-sm font-bold text-primary font-serif">
                        R$ {price.toFixed(2).replace(".", ",")}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleQuickAdd(item)}
                        disabled={item.isPaused}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors shadow-xs ${
                          item.isPaused
                            ? "bg-surface-container-highest text-on-surface-variant cursor-not-allowed"
                            : "bg-surface-container-high hover:bg-primary hover:text-on-primary text-on-surface"
                        }`}
                        title="Adicionar à sacola"
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

      {/* Footer Completo */}
      <Footer />
    </div>
  );
}
