"use client";

import React, { useState, useEffect, useTransition } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import SafeImage from "@/components/SafeImage";
import {
  Utensils,
  Clock,
  CheckCircle2,
  RefreshCw,
  CookingPot,
  PlusCircle,
  Flame,
  Sparkles,
  Ban,
  Timer,
  Save,
  Edit3,
  PlayCircle,
  PauseCircle,
  X,
  Upload,
} from "lucide-react";

interface ProductSize {
  id?: string;
  size: string;
  price: number;
  weight: string;
}

interface SideItem {
  id?: string;
  name: string;
  type: string;
  price: number;
  isPaused: boolean;
}

interface Product {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  category: string;
  isDailySpecial: boolean;
  isPaused: boolean;
  fireTime?: string;
  servingsLeft?: number;
  sizes: ProductSize[];
  sides: SideItem[];
}

export default function AdminCardapioPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  // Estados do Modal de Criação / Edição
  const [dishName, setDishName] = useState("");
  const [dishDescription, setDishDescription] = useState("");
  const [dishCategory, setDishCategory] = useState("marmita");
  const [dishImageUrl, setDishImageUrl] = useState("");
  const [dishFireTime, setDishFireTime] = useState("6h de brasa lenta");
  const [dishServingsLeft, setDishServingsLeft] = useState(25);
  const [dishIsDailySpecial, setDishIsDailySpecial] = useState(false);
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>("todas");
  
  // Preços e pesos P, M, G no modal
  const [priceP, setPriceP] = useState("22.00");
  const [weightP, setWeightP] = useState("400 g");
  const [priceM, setPriceM] = useState("27.00");
  const [weightM, setWeightM] = useState("550 g");
  const [priceG, setPriceG] = useState("32.00");
  const [weightG, setWeightG] = useState("700 g");
  
  // Guarnições no modal (separadas por vírgula)
  const [sidesInput, setSidesInput] = useState("Arroz branco, Feijão tropeiro, Couve refogada, Farofa");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [savingDish, setSavingDish] = useState(false);

  // 1. Busca pratos da API Admin
  const loadProducts = async () => {
    try {
      const res = await fetch("/api/admin/products");
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error("Erro ao carregar cardápio admin:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // 2. Acionar Pausa Emergencial de Prato (reflete no app do cliente em 5s)
  const toggleProductPause = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/products/${id}/pause`, {
        method: "PATCH",
      });
      if (res.ok) {
        const result = await res.json();
        startTransition(() => {
          setProducts((prev) =>
            prev.map((p) => (p.id === id ? { ...p, isPaused: result.isPaused } : p))
          );
        });
        showFeedback(result.isPaused ? "Prato pausado emergencialmente!" : "Prato reativado no cardápio!");
      }
    } catch (err) {
      console.error("Erro ao pausar prato:", err);
    }
  };

  // 3. Acionar Pausa Emergencial de Guarnição no Fogão
  const toggleSidePause = async (sideId: string) => {
    try {
      const res = await fetch(`/api/admin/sides/${sideId}/pause`, {
        method: "PATCH",
      });
      if (res.ok) {
        const result = await res.json();
        startTransition(() => {
          setProducts((prev) =>
            prev.map((p) => ({
              ...p,
              sides: p.sides.map((s) => (s.id === sideId ? { ...s, isPaused: result.isPaused } : s)),
            }))
          );
        });
        showFeedback(result.isPaused ? "Guarnição pausada no fogão!" : "Guarnição reativada!");
      }
    } catch (err) {
      console.error("Erro ao pausar guarnição:", err);
    }
  };

  // 4. Salvar preços editados inline
  const handleInlinePriceChange = (productId: string, sizeName: string, newPriceStr: string) => {
    const val = parseFloat(newPriceStr.replace(",", "."));
    if (isNaN(val)) return;

    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        return {
          ...p,
          sizes: p.sizes.map((s) => (s.size === sizeName ? { ...s, price: val } : s)),
        };
      })
    );
  };

  const saveProductInline = async (prod: Product) => {
    try {
      const res = await fetch(`/api/admin/products/${prod.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sizes: prod.sizes,
        }),
      });
      if (res.ok) {
        showFeedback(`Valores de "${prod.name}" atualizados com sucesso!`);
      }
    } catch (err) {
      console.error("Erro ao salvar preços inline:", err);
    }
  };

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  // 5. Abertura do Modal para Novo ou Edição
  const openNewDishModal = () => {
    setEditingProduct(null);
    setDishName("");
    setDishDescription("");
    setDishCategory("marmita");
    setDishImageUrl("/images/pratos/costela_fogo_chao.jpg");
    setDishFireTime("6h de brasa lenta");
    setDishServingsLeft(25);
    setDishIsDailySpecial(false);
    setPriceP("22.00");
    setWeightP("400 g");
    setPriceM("27.00");
    setWeightM("550 g");
    setPriceG("32.00");
    setWeightG("700 g");
    setSidesInput("Arroz branco, Feijão tropeiro, Couve refogada, Farofa crocante");
    setModalOpen(true);
  };

  const openEditDishModal = (prod: Product) => {
    setEditingProduct(prod);
    setDishName(prod.name);
    setDishDescription(prod.description);
    setDishCategory(prod.category);
    setDishImageUrl(prod.imageUrl);
    setDishFireTime(prod.fireTime || "4h de brasa lenta");
    setDishServingsLeft(prod.servingsLeft || 20);
    setDishIsDailySpecial(prod.isDailySpecial);

    const sP = prod.sizes.find((s) => s.size === "P");
    const sM = prod.sizes.find((s) => s.size === "M");
    const sG = prod.sizes.find((s) => s.size === "G");

    setPriceP(sP ? sP.price.toFixed(2) : "20.00");
    setWeightP(sP ? sP.weight : "400 g");
    setPriceM(sM ? sM.price.toFixed(2) : "25.00");
    setWeightM(sM ? sM.weight : "550 g");
    setPriceG(sG ? sG.price.toFixed(2) : "30.00");
    setWeightG(sG ? sG.weight : "700 g");

    const sidesStr = prod.sides.map((s) => s.name).join(", ");
    setSidesInput(sidesStr || "Arroz branco, Feijão tropeiro");
    setModalOpen(true);
  };

  // 6. Upload de imagem
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setDishImageUrl(data.url);
        showFeedback("Imagem enviada com sucesso!");
      } else {
        alert("Erro no upload da imagem.");
      }
    } catch (err) {
      console.error("Erro no upload:", err);
      alert("Erro ao conectar com o serviço de upload.");
    } finally {
      setUploadingImage(false);
    }
  };

  // 7. Salvar formulário do modal (Criação ou Edição)
  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingDish(true);

    const sizesPayload = [
      { size: "P", price: parseFloat(priceP), weight: weightP },
      { size: "M", price: parseFloat(priceM), weight: weightM },
      { size: "G", price: parseFloat(priceG), weight: weightG },
    ];

    const sidesPayload = sidesInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((name) => ({ name, type: "INCLUDED", price: 0 }));

    try {
      if (editingProduct) {
        // Atualização PUT
        const res = await fetch(`/api/admin/products/${editingProduct.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: dishName,
            description: dishDescription,
            category: dishCategory,
            imageUrl: dishImageUrl,
            fireTime: dishFireTime,
            servingsLeft: dishServingsLeft,
            isDailySpecial: dishIsDailySpecial,
            sizes: sizesPayload,
          }),
        });
        if (res.ok) {
          showFeedback("Prato atualizado com sucesso!");
          setModalOpen(false);
          loadProducts();
        }
      } else {
        // Criação POST
        const res = await fetch("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: dishName,
            description: dishDescription,
            category: dishCategory,
            imageUrl: dishImageUrl,
            fireTime: dishFireTime,
            servingsLeft: dishServingsLeft,
            isDailySpecial: dishIsDailySpecial,
            sizes: sizesPayload,
            sides: sidesPayload,
          }),
        });
        if (res.ok) {
          showFeedback("Novo prato cadastrado com sucesso!");
          setModalOpen(false);
          loadProducts();
        }
      }
    } catch (err) {
      console.error("Erro ao salvar prato:", err);
      alert("Erro ao salvar o prato.");
    } finally {
      setSavingDish(false);
    }
  };

  // Separa prato especial dos pratos comuns
  const specialDish = products.find((p) => p.isDailySpecial) || products[0];
  const filteredDishes = products.filter((p) => {
    if (selectedCategoryTab === "todas") {
      return p.id !== specialDish?.id;
    }
    return p.category === selectedCategoryTab && (selectedCategoryTab !== "marmita" || p.id !== specialDish?.id);
  });

  // Coleta todas as guarnições únicas do fogão
  const allSides: { id: string; name: string; isPaused: boolean }[] = [];
  products.forEach((p) => {
    p.sides.forEach((s) => {
      if (s.id && !allSides.some((item) => item.name.toLowerCase() === s.name.toLowerCase())) {
        allSides.push({ id: s.id, name: s.name, isPaused: s.isPaused });
      }
    });
  });

  return (
    <div className="flex min-h-screen bg-surface">
      <AdminSidebar />

      <div className="pt-16 lg:pt-0 lg:pl-72 flex flex-col flex-1 min-w-0 max-w-full overflow-x-hidden">
        {/* Top Header */}
        <header className="h-16 px-4 sm:px-gutter-lg flex items-center justify-between bg-surface-container-lowest/90 backdrop-blur-xl border-b border-surface-container shadow-sm sticky top-0 z-30">
          <div className="flex items-center gap-space-lg">
            <div className="flex items-center gap-space-xs text-on-surface-variant">
              <Utensils className="w-5 h-5 text-primary" />
              <span className="font-body-sm text-body-sm font-semibold">Cardápio do Dia &amp; Estoque</span>
            </div>
            <div className="hidden md:flex items-center gap-space-xs bg-surface-container-high px-space-sm py-1 rounded-full text-on-surface-variant">
              <Clock className="w-4 h-4" />
              <span className="font-label-md text-label-md">Turno do Almoço</span>
            </div>
          </div>
          <div className="flex items-center gap-space-md">
            <div className="flex items-center gap-2 pl-space-sm">
              <span className="inline-flex h-2.5 w-2.5 rounded-full bg-primary animate-pulse"></span>
              <span className="font-label-sm text-label-sm text-primary font-bold">Pausa Emergencial Ativa</span>
            </div>
          </div>
        </header>

        {/* Notificação flutuante de feedback */}
        {feedbackMsg && (
          <div className="mx-4 sm:mx-gutter-lg mt-space-md p-space-md bg-primary-container text-on-primary-container rounded-xl flex items-center gap-space-sm font-label-md text-label-md shadow-md animate-fade-in">
            <CheckCircle2 className="w-5 h-5" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        <main className="w-full pt-4 bg-surface pb-16">
          <div className="flex flex-col w-full px-4 sm:px-gutter-lg py-space-md gap-space-lg max-w-[1600px]">
            {/* Banner: Modo Almoço em Tempo Real */}
            <div className="w-full bg-surface-container-highest rounded-xl p-space-md flex flex-col md:flex-row items-start md:items-center justify-between gap-space-sm shadow-sm border border-surface-container">
              <div className="flex items-center gap-space-sm">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                  <RefreshCw className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-space-xs">
                    <span className="font-label-lg text-label-lg text-on-surface font-bold">
                      Modo Almoço Ativo em Tempo Real
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-primary text-on-primary font-label-sm text-label-sm uppercase tracking-wider font-bold">
                      Ao Vivo
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Qualquer alteração de valor ou pausa emergencial é refletida no cardápio online do cliente em até 5 segundos.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-space-sm self-end md:self-auto">
                <span className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-tertiary-fixed-dim inline-block animate-pulse"></span>
                  Polling 5s Sincronizado
                </span>
              </div>
            </div>

            {/* Cabeçalho de Ações e Gestão */}
            <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-space-md">
              <div className="flex flex-col gap-space-xs max-w-2xl">
                <div className="flex items-center gap-space-xs text-primary font-label-md text-label-md uppercase tracking-wider font-bold">
                  <CookingPot className="w-4 h-4" />
                  <span>Controle de Estoque &amp; Braseiro</span>
                </div>
                <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold">
                  Gestão do Cardápio do Dia
                </h1>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Configure a disponibilidade imediata, ajuste porções por tamanho e acione a trava rápida de esgotamento das panelas de ferro e espetos.
                </p>
              </div>

              <div className="flex items-center gap-space-sm flex-wrap w-full lg:w-auto">
                <button
                  type="button"
                  onClick={openNewDishModal}
                  className="w-full sm:w-auto min-h-[44px] bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg px-5 py-2.5 rounded-xl flex items-center justify-center gap-space-xs transition-colors shadow-md font-bold cursor-pointer"
                >
                  <PlusCircle className="w-5 h-5" />
                  <span>+ Novo Prato / Item</span>
                </button>
              </div>
            </div>

            {loading ? (
              <div className="py-12 text-center text-on-surface-variant font-body-lg">
                Carregando cardápio...
              </div>
            ) : (
              <>
                {/* 1. Prato Especial do Dia (Destaque Principal) */}
                {specialDish && (
                  <section className="flex flex-col gap-space-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-space-xs">
                        <Flame className="w-5 h-5 text-primary" />
                        <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                          Prato Especial de Hoje • Sugestão da Comitiva
                        </h2>
                      </div>
                      <span className="font-label-sm text-label-sm text-on-surface-variant bg-surface-container-high px-2.5 py-1 rounded-full font-semibold">
                        Exibição no Topo do App
                      </span>
                    </div>

                    <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-md flex flex-col xl:flex-row gap-space-lg items-stretch border border-surface-container">
                      {/* Imagem e Badge de Destaque */}
                      <div className="relative w-full xl:w-96 h-64 xl:h-auto rounded-lg overflow-hidden flex-shrink-0 bg-surface-container">
                        <SafeImage
                          src={specialDish.imageUrl || "/images/banners/prato_dia_hero.jpg"}
                          alt={specialDish.name}
                          className={`w-full h-full object-cover transition-all ${
                            specialDish.isPaused ? "grayscale opacity-60" : ""
                          }`}
                        />
                        <div className="absolute top-3 left-3 bg-tertiary text-on-tertiary font-label-sm text-label-sm px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm font-bold">
                          <Sparkles className="w-3.5 h-3.5" />
                          Estrela da Roça
                        </div>

                        {specialDish.isPaused ? (
                          <div className="absolute inset-0 bg-inverse-surface/60 flex items-center justify-center">
                            <span className="bg-error text-on-error font-label-md text-label-md px-3 py-1 rounded-full font-bold flex items-center gap-1 shadow-lg">
                              <Ban className="w-4 h-4" />
                              PAUSADO (ESGOTADO)
                            </span>
                          </div>
                        ) : (
                          <div className="absolute bottom-3 left-3 right-3 bg-inverse-surface/85 backdrop-blur-md p-space-xs rounded-lg text-inverse-on-surface flex items-center justify-between">
                            <div className="flex items-center gap-space-xs">
                              <Timer className="w-4 h-4 text-tertiary-fixed" />
                              <span className="font-label-sm text-label-sm">{specialDish.fireTime || "6h de braseiro lento"}</span>
                            </div>
                            <span className="font-label-sm text-label-sm text-tertiary-fixed-dim font-bold">100% Artesanal</span>
                          </div>
                        )}
                      </div>

                      {/* Detalhes do Prato e Precificação */}
                      <div className="flex flex-col justify-between flex-1 gap-space-md">
                        <div className="flex flex-col gap-space-xs">
                          <div className="flex flex-wrap items-center justify-between gap-space-xs">
                            <h3 className="font-headline-md text-headline-md text-on-surface font-bold">
                              {specialDish.name}
                            </h3>
                            <div className="flex items-center gap-space-xs">
                              <span className="w-3 h-3 rounded-full bg-tertiary-container"></span>
                              <span className="font-label-md text-label-md text-tertiary-container font-bold">
                                Restam ~{specialDish.servingsLeft || 18} porções no tacho
                              </span>
                            </div>
                          </div>
                          <p className="font-body-md text-body-md text-on-surface-variant">
                            {specialDish.description}
                          </p>
                        </div>

                        {/* Grade de Preços por Tamanho (Editáveis Inline) */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm">
                          {specialDish.sizes.map((s) => (
                            <div key={s.size} className="bg-surface-container-low rounded-lg p-space-sm flex flex-col gap-space-xs shadow-sm">
                              <div className="flex items-center justify-between">
                                <span className="font-label-md text-label-md font-bold text-on-surface">
                                  Tamanho {s.size} {s.size === "M" && "(Padrão)"}
                                </span>
                                <span className="font-label-sm text-label-sm text-on-surface-variant bg-surface-container-high px-1.5 py-0.5 rounded">
                                  {s.weight}
                                </span>
                              </div>
                              <label className="font-body-sm text-body-sm text-on-surface-variant">Preço Venda</label>
                              <div className="flex items-center bg-surface-container-lowest rounded px-2 py-1 shadow-inner border border-surface-container">
                                <span className="font-label-md text-label-md text-on-surface-variant mr-1">R$</span>
                                <input
                                  type="text"
                                  defaultValue={s.price.toFixed(2)}
                                  onBlur={(e) => handleInlinePriceChange(specialDish.id, s.size, e.target.value)}
                                  className="w-full font-label-lg text-label-lg text-on-surface bg-transparent focus:outline-none"
                                />
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Controles de Disponibilidade e Trava Rápida */}
                        <div className="flex flex-wrap items-center justify-between gap-space-sm pt-space-xs border-t border-surface-container">
                          <div className="flex items-center gap-space-sm">
                            <button
                              type="button"
                              onClick={() => saveProductInline(specialDish)}
                              className="bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md px-3.5 py-2 rounded-lg flex items-center gap-1 shadow-sm font-bold transition-all"
                            >
                              <Save className="w-4 h-4" />
                              Salvar Preços
                            </button>
                            <button
                              type="button"
                              onClick={() => openEditDishModal(specialDish)}
                              className="bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md px-3.5 py-2 rounded-lg flex items-center gap-1 transition-colors font-semibold"
                            >
                              <Edit3 className="w-4 h-4" />
                              Editar Dados
                            </button>
                          </div>

                          <div className="flex items-center gap-space-xs">
                            <button
                              type="button"
                              onClick={() => toggleProductPause(specialDish.id)}
                              className={`font-label-md text-label-md px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm font-bold ${
                                specialDish.isPaused
                                  ? "bg-primary text-on-primary hover:bg-primary-container"
                                  : "bg-error-container hover:bg-error text-on-error-container hover:text-on-error"
                              }`}
                            >
                              {specialDish.isPaused ? (
                                <PlayCircle className="w-4 h-4" />
                              ) : (
                                <Ban className="w-4 h-4" />
                              )}
                              <span>
                                {specialDish.isPaused ? "Reativar no Cardápio" : "Pausa Emergencial (Esgotou no Fogão)"}
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>
                )}

                {/* 2. Pratos e Itens da Comitiva */}
                <section className="flex flex-col gap-space-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs">
                    <div>
                      <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                        Itens do Cardápio da Comitiva
                      </h2>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Atualize preços, gerencie tamanhos e pause pratos cujas panelas esvaziaram.
                      </p>
                    </div>
                    {/* Filtros de Categoria */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                      {[
                        { id: "todas", label: "Todos os Itens" },
                        { id: "marmita", label: "Marmitas" },
                        { id: "complemento", label: "Complementos" },
                        { id: "bebida", label: "Bebidas" },
                        { id: "sobremesa", label: "Sobremesas" },
                      ].map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setSelectedCategoryTab(cat.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                            selectedCategoryTab === cat.id
                              ? "bg-primary text-on-primary shadow-xs"
                              : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-space-sm">
                    {filteredDishes.map((dish) => {
                      const pSize = dish.sizes.find((s) => s.size === "P")?.price || 0;
                      const mSize = dish.sizes.find((s) => s.size === "M")?.price || 0;
                      const gSize = dish.sizes.find((s) => s.size === "G")?.price || 0;
                      const hasStandardSizes = dish.sizes.some((s) => ["P", "M", "G"].includes(s.size));

                      return (
                        <div
                          key={dish.id}
                          className={`rounded-xl p-space-md shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-space-md transition-all border border-surface-container ${
                            dish.isPaused
                              ? "bg-surface-container-high/60 opacity-80"
                              : "bg-surface-container-lowest"
                          }`}
                        >
                          <div className="flex items-start gap-space-md flex-1">
                            <div className="w-20 h-20 rounded-lg overflow-hidden bg-surface-container flex-shrink-0 relative">
                              <SafeImage
                                src={dish.imageUrl || "/images/pratos/frango_caipira.jpg"}
                                alt={dish.name}
                                className={`w-full h-full object-cover ${dish.isPaused ? "grayscale" : ""}`}
                              />
                              {dish.isPaused && (
                                <div className="absolute inset-0 bg-inverse-surface/60 flex items-center justify-center">
                                  <Ban className="w-5 h-5 text-white" />
                                </div>
                              )}
                            </div>

                            <div className="flex flex-col gap-space-xs min-w-0">
                              <div className="flex items-center gap-space-xs flex-wrap">
                                <span className="font-label-sm text-[11px] uppercase tracking-wider text-primary font-bold bg-primary-fixed/30 px-2 py-0.5 rounded">
                                  {dish.category}
                                </span>
                                <h3 className={`font-title-md text-title-md font-bold ${dish.isPaused ? "line-through text-on-surface-variant" : "text-on-surface"}`}>
                                  {dish.name}
                                </h3>
                                {dish.isPaused ? (
                                  <span className="bg-error-container text-on-error-container font-label-sm text-label-sm px-2 py-0.5 rounded font-bold flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5" />
                                    Esgotado no Fogão
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1 text-primary font-label-sm text-label-sm font-semibold">
                                    <span className="w-2 h-2 rounded-full bg-primary inline-block"></span>
                                    Disponível
                                  </span>
                                )}
                              </div>
                              <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                                {dish.description}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-space-md w-full lg:w-auto">
                            {/* Valores de Preço */}
                            <div className="flex items-center gap-space-xs bg-surface-container-low p-2 rounded-xl border border-surface-container justify-around">
                              {hasStandardSizes ? (
                                <>
                                  <div className="flex flex-col text-center px-2">
                                    <span className="font-label-sm text-label-sm text-on-surface-variant font-bold">P</span>
                                    <span className="font-label-md text-label-md text-on-surface font-bold">
                                      R$ {pSize.toFixed(2).replace(".", ",")}
                                    </span>
                                  </div>
                                  <div className="h-6 w-px bg-surface-variant"></div>
                                  <div className="flex flex-col text-center px-2">
                                    <span className="font-label-sm text-label-sm text-primary font-bold">M</span>
                                    <span className="font-label-md text-label-md text-primary font-bold">
                                      R$ {mSize.toFixed(2).replace(".", ",")}
                                    </span>
                                  </div>
                                  <div className="h-6 w-px bg-surface-variant"></div>
                                  <div className="flex flex-col text-center px-2">
                                    <span className="font-label-sm text-label-sm text-on-surface-variant font-bold">G</span>
                                    <span className="font-label-md text-label-md text-on-surface font-bold">
                                      R$ {gSize.toFixed(2).replace(".", ",")}
                                    </span>
                                  </div>
                                </>
                              ) : (
                                <div className="flex flex-col text-center px-3">
                                  <span className="font-label-sm text-label-sm text-primary font-bold">
                                    {dish.sizes[0]?.size || "Único"}
                                  </span>
                                  <span className="font-label-md text-label-md text-primary font-bold">
                                    R$ {(dish.sizes[0]?.price || 0).toFixed(2).replace(".", ",")}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Botões de Ação */}
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => openEditDishModal(dish)}
                                className="flex-1 sm:flex-none min-h-[44px] bg-surface-container hover:bg-surface-container-high text-secondary font-label-md text-label-md px-4 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors font-bold cursor-pointer"
                              >
                                <Edit3 className="w-4 h-4" />
                                <span>Editar</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => toggleProductPause(dish.id)}
                                className={`flex-1 sm:flex-none min-h-[44px] font-label-md text-label-md px-4 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors font-bold cursor-pointer ${
                                  dish.isPaused
                                    ? "bg-primary text-on-primary hover:bg-primary-container"
                                    : "bg-surface-container-highest hover:bg-error-container text-on-surface hover:text-on-error-container"
                                }`}
                              >
                                {dish.isPaused ? (
                                  <PlayCircle className="w-4 h-4" />
                                ) : (
                                  <PauseCircle className="w-4 h-4" />
                                )}
                                <span>{dish.isPaused ? "Reativar" : "Pausar Item"}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>

                {/* 3. Guarnições no Fogão a Lenha (Monitor de Panelas) */}
                <section className="flex flex-col gap-space-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                        Guarnições no Fogão a Lenha
                      </h2>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Pausa seletiva de complementos montados na marmita (esgotou na panela de ferro).
                      </p>
                    </div>
                    <span className="font-label-sm text-label-sm text-tertiary-container font-bold bg-tertiary-fixed px-2.5 py-1 rounded-full flex items-center gap-1">
                      <CookingPot className="w-3.5 h-3.5" />
                      Monitor de Panelas
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-sm">
                    {allSides.map((side) => (
                      <div
                        key={side.id}
                        className={`rounded-lg p-space-sm flex flex-col justify-between gap-space-xs shadow-sm border border-surface-container transition-all ${
                          side.isPaused ? "bg-surface-container opacity-70" : "bg-surface-container-lowest"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`font-label-md text-label-md font-bold ${side.isPaused ? "line-through text-on-surface-variant" : "text-on-surface"}`}>
                            {side.name}
                          </span>
                          <span className={`w-2 h-2 rounded-full ${side.isPaused ? "bg-error" : "bg-primary"}`}></span>
                        </div>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          {side.isPaused ? "Panela Esgotada" : "Panela Quente"}
                        </p>
                        <button
                          type="button"
                          onClick={() => toggleSidePause(side.id)}
                          className={`w-full font-label-sm text-label-sm py-1.5 rounded transition-colors font-bold ${
                            side.isPaused
                              ? "bg-primary text-on-primary hover:bg-primary-container"
                              : "bg-surface-container-high hover:bg-error-container text-on-surface hover:text-on-error-container"
                          }`}
                        >
                          {side.isPaused ? "Reativar" : "Pausar"}
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              </>
            )}
          </div>
        </main>
      </div>

      {/* MODAL DE CADASTRO / EDIÇÃO DE PRATO (Tela 9 do Stitch) */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-container-lowest w-full max-w-2xl sm:rounded-2xl rounded-none shadow-2xl overflow-hidden flex flex-col h-full sm:h-auto sm:max-h-[90vh] border border-surface-container">
            {/* Modal Header */}
            <div className="px-4 sm:px-space-lg py-3 sm:py-space-md bg-surface-container-low flex items-center justify-between border-b border-surface-container shrink-0">
              <div className="flex items-center gap-space-xs">
                <Utensils className="w-6 h-6 text-primary" />
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold text-base sm:text-lg">
                  {editingProduct ? "Editar Prato do Fogão" : "Cadastrar Novo Prato da Comitiva"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="w-10 h-10 min-h-[44px] min-w-[44px] rounded-xl bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant cursor-pointer"
                aria-label="Fechar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSaveModal} className="p-4 sm:p-space-lg flex flex-col gap-space-md overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                <div className="flex flex-col gap-1">
                  <label className="font-label-md text-label-md text-on-surface font-bold">Nome do Prato *</label>
                  <input
                    type="text"
                    required
                    value={dishName}
                    onChange={(e) => setDishName(e.target.value)}
                    placeholder="Ex: Rabada c/ Agrião e Polenta"
                    className="w-full h-10 px-3 rounded-lg bg-surface-container-low border-0 ring-1 ring-outline-variant/40 focus:ring-2 focus:ring-primary text-on-surface font-body-md text-body-md outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-label-md text-label-md text-on-surface font-bold">Categoria *</label>
                  <select
                    value={dishCategory}
                    onChange={(e) => setDishCategory(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg bg-surface-container-low border-0 ring-1 ring-outline-variant/40 focus:ring-2 focus:ring-primary text-on-surface font-body-md text-body-md outline-none cursor-pointer"
                  >
                    <option value="marmita">Marmita (Prato Principal)</option>
                    <option value="complemento">Complemento / Guarnição</option>
                    <option value="bebida">Bebida</option>
                    <option value="sobremesa">Sobremesa</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-label-md text-label-md text-on-surface font-bold">Descrição Artesanal *</label>
                <textarea
                  required
                  rows={2}
                  value={dishDescription}
                  onChange={(e) => setDishDescription(e.target.value)}
                  placeholder="Descreva o sabor, ingredientes caipiras e tempo de cozimento..."
                  className="w-full p-2.5 rounded-lg bg-surface-container-low border-0 ring-1 ring-outline-variant/40 focus:ring-2 focus:ring-primary text-on-surface font-body-md text-body-md outline-none resize-none"
                ></textarea>
              </div>

              {/* Imagem (Upload ou URL) */}
              <div className="flex flex-col gap-1">
                <label className="font-label-md text-label-md text-on-surface font-bold">Imagem do Prato</label>
                <div className="flex items-center gap-space-sm">
                  <input
                    type="text"
                    value={dishImageUrl}
                    onChange={(e) => setDishImageUrl(e.target.value)}
                    placeholder="URL da imagem ou faça upload ao lado..."
                    className="flex-1 h-10 px-3 rounded-lg bg-surface-container-low border-0 ring-1 ring-outline-variant/40 focus:ring-2 focus:ring-primary text-on-surface font-body-sm text-body-sm outline-none"
                  />
                  <label className="h-10 px-4 rounded-lg bg-surface-container-highest hover:bg-surface-container text-on-surface font-label-sm text-label-sm flex items-center justify-center gap-1 cursor-pointer transition-colors">
                    <Upload className="w-4 h-4" />
                    <span>{uploadingImage ? "Enviando..." : "Upload"}</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Tempo de Fogo e Porções */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                <div className="flex flex-col gap-1">
                  <label className="font-label-md text-label-md text-on-surface">Tempo de Fogo a Lenha</label>
                  <input
                    type="text"
                    value={dishFireTime}
                    onChange={(e) => setDishFireTime(e.target.value)}
                    placeholder="Ex: 6h de braseiro lento"
                    className="w-full h-10 px-3 rounded-lg bg-surface-container-low border-0 ring-1 ring-outline-variant/40 focus:ring-2 focus:ring-primary text-on-surface font-body-sm text-body-sm outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-label-md text-label-md text-on-surface">Porções no Tacho</label>
                  <input
                    type="number"
                    value={dishServingsLeft}
                    onChange={(e) => setDishServingsLeft(parseInt(e.target.value) || 0)}
                    className="w-full h-10 px-3 rounded-lg bg-surface-container-low border-0 ring-1 ring-outline-variant/40 focus:ring-2 focus:ring-primary text-on-surface font-body-sm text-body-sm outline-none"
                  />
                </div>
              </div>

              {/* Preços P / M / G */}
              <div className="flex flex-col gap-1">
                <label className="font-label-md text-label-md text-on-surface font-bold">
                  Preços e Pesos por Tamanho
                </label>
                <div className="grid grid-cols-3 gap-space-sm">
                  {/* Tamanho P */}
                  <div className="p-space-sm bg-surface-container-low rounded-lg flex flex-col gap-1">
                    <span className="font-label-sm text-label-sm font-bold text-on-surface">Tam P</span>
                    <input
                      type="text"
                      placeholder="Preço R$"
                      value={priceP}
                      onChange={(e) => setPriceP(e.target.value)}
                      className="h-8 px-2 rounded bg-surface-container-lowest text-on-surface text-center font-bold text-sm border-0 ring-1 ring-outline-variant/40"
                    />
                    <input
                      type="text"
                      placeholder="Peso"
                      value={weightP}
                      onChange={(e) => setWeightP(e.target.value)}
                      className="h-7 px-2 rounded bg-surface-container-lowest text-on-surface-variant text-center text-xs border-0 ring-1 ring-outline-variant/40"
                    />
                  </div>

                  {/* Tamanho M */}
                  <div className="p-space-sm bg-surface-container-low rounded-lg flex flex-col gap-1">
                    <span className="font-label-sm text-label-sm font-bold text-primary">Tam M (Padrão)</span>
                    <input
                      type="text"
                      placeholder="Preço R$"
                      value={priceM}
                      onChange={(e) => setPriceM(e.target.value)}
                      className="h-8 px-2 rounded bg-surface-container-lowest text-on-surface text-center font-bold text-sm border-0 ring-1 ring-outline-variant/40"
                    />
                    <input
                      type="text"
                      placeholder="Peso"
                      value={weightM}
                      onChange={(e) => setWeightM(e.target.value)}
                      className="h-7 px-2 rounded bg-surface-container-lowest text-on-surface-variant text-center text-xs border-0 ring-1 ring-outline-variant/40"
                    />
                  </div>

                  {/* Tamanho G */}
                  <div className="p-space-sm bg-surface-container-low rounded-lg flex flex-col gap-1">
                    <span className="font-label-sm text-label-sm font-bold text-on-surface">Tam G</span>
                    <input
                      type="text"
                      placeholder="Preço R$"
                      value={priceG}
                      onChange={(e) => setPriceG(e.target.value)}
                      className="h-8 px-2 rounded bg-surface-container-lowest text-on-surface text-center font-bold text-sm border-0 ring-1 ring-outline-variant/40"
                    />
                    <input
                      type="text"
                      placeholder="Peso"
                      value={weightG}
                      onChange={(e) => setWeightG(e.target.value)}
                      className="h-7 px-2 rounded bg-surface-container-lowest text-on-surface-variant text-center text-xs border-0 ring-1 ring-outline-variant/40"
                    />
                  </div>
                </div>
              </div>

              {/* Guarnições Inclusas Padrão */}
              <div className="flex flex-col gap-1">
                <label className="font-label-md text-label-md text-on-surface font-bold">
                  Guarnições Inclusas (separadas por vírgula)
                </label>
                <input
                  type="text"
                  value={sidesInput}
                  onChange={(e) => setSidesInput(e.target.value)}
                  placeholder="Arroz branco, Feijão tropeiro, Farofa..."
                  className="w-full h-10 px-3 rounded-lg bg-surface-container-low border-0 ring-1 ring-outline-variant/40 focus:ring-2 focus:ring-primary text-on-surface font-body-sm text-body-sm outline-none"
                />
              </div>

              {/* Checkbox Prato do Dia */}
              <label className="flex items-center gap-space-sm pt-space-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={dishIsDailySpecial}
                  onChange={(e) => setDishIsDailySpecial(e.target.checked)}
                  className="w-5 h-5 rounded accent-primary text-primary focus:ring-0"
                />
                <span className="font-label-md text-label-md font-bold text-on-surface">
                  Definir como Prato Especial do Dia (Destaque Principal do App)
                </span>
              </label>

              {/* Botões do Footer */}
              <div className="flex items-center justify-end gap-space-sm pt-space-md border-t border-surface-container shrink-0">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="min-h-[44px] px-5 py-2.5 rounded-xl bg-surface-container text-on-surface hover:bg-surface-container-high font-label-md text-label-md font-bold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingDish}
                  className="min-h-[44px] px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md font-bold shadow-md transition-all disabled:opacity-50 cursor-pointer"
                >
                  {savingDish ? "Salvando..." : editingProduct ? "Salvar Alterações" : "Cadastrar Prato"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
