"use client";

import React, { useState, useEffect, useTransition } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import {
  Receipt,
  Clock,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  UserCheck,
  Store,
  MessageSquare,
  Phone,
  User,
  ShoppingBag,
  UtensilsCrossed,
  Bike,
  CookingPot,
  Utensils,
  PlusCircle,
  Plus,
  Check,
  FileText,
  QrCode,
  CreditCard,
  Banknote,
  Flame,
  ArrowRight,
  Printer,
  History,
  MapPin,
} from "lucide-react";
import { getOrderStatusBadgeClass, getOrderStatusShortLabel } from "@/lib/orderStatus";

interface ProductSize {
  id: string;
  sizeName: string;
  weightGrams: number;
  price: number;
}

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  imageUrl: string;
  isDailySpecial: boolean;
  isAvailable: boolean;
  defaultSides: string[];
  sizes: ProductSize[];
}

interface RecentOrder {
  id: string;
  orderNumber: number;
  customerName: string;
  total: number;
  status: string;
  createdAt: string;
  items: {
    productName: string;
    size: string;
    quantity: number;
  }[];
}

export default function AdminPDVPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [, startTransition] = useTransition();

  // Estado do formulário de comanda
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [modality, setModality] = useState<"PICKUP" | "DINE_IN" | "DELIVERY">("PICKUP");
  const [channel, setChannel] = useState<"COUNTER" | "WHATSAPP" | "PHONE">("COUNTER");
  
  // Prato selecionado
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null);
  const [selectedSides, setSelectedSides] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("todas");
  
  // Adicionais de 1 clique
  const [addons, setAddons] = useState<{ id: string; name: string; price: number; quantity: number }[]>([]);
  
  // Notas e pagamento
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"PIX" | "CARD" | "CASH">("CASH");
  const [cashReceived, setCashReceived] = useState<string>("50");
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastCreatedOrderNumber, setLastCreatedOrderNumber] = useState<number | null>(null);

  // Lista padrão de adicionais de conveniência
  const defaultAddonOptions = [
    { id: "addon-orange", name: "Suco Laranja da Roça 500ml", price: 8.0 },
    { id: "addon-soda", name: "Guaraná Antárctica Lata 350ml", price: 6.0 },
    { id: "addon-sweet", name: "Doce de Leite Caipira no Pote", price: 10.0 },
    { id: "addon-pudim", name: "Pudim Tradicional de Leite", price: 7.0 },
  ];

  // 1. Busca todos os produtos ativos do banco (marmitas, complementos, bebidas, sobremesas)
  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch("/api/products");
        if (res.ok) {
          const data = await res.json();
          // Carrega todos os produtos ativos (oculta apenas pausados)
          interface ApiProduct {
            id: string;
            name: string;
            description?: string;
            category: string;
            imageUrl?: string;
            isDailySpecial?: boolean;
            isPaused?: boolean;
            sides?: { id: string; name: string; type: string; isPaused: boolean }[];
            sizes?: { id: string; size: string; weight?: string; price: number }[];
          }
          const activeProducts: Product[] = (data as ApiProduct[])
            .filter((p) => !p.isPaused)
            .map((p) => ({
              id: p.id,
              name: p.name,
              description: p.description || "",
              category: p.category,
              imageUrl: p.imageUrl || "/images/pratos/costela_fogo_chao.jpg",
              isDailySpecial: Boolean(p.isDailySpecial),
              isAvailable: !p.isPaused,
              defaultSides: Array.isArray(p.sides)
                ? p.sides
                    .filter((s) => s.type === "INCLUDED" && !s.isPaused)
                    .map((s) => s.name)
                : [],
              sizes: Array.isArray(p.sizes) && p.sizes.length > 0
                ? p.sizes.map((s) => ({
                    id: s.id,
                    sizeName: s.size,
                    weightGrams: parseInt(String(s.weight || "").replace(/\D/g, "")) || (s.size === "P" ? 400 : s.size === "M" ? 550 : 700),
                    price: s.price,
                  }))
                : [
                    {
                      id: "unico",
                      sizeName: "Único",
                      weightGrams: 0,
                      price: 5.0,
                    },
                  ],
            }));
          setProducts(activeProducts);

          if (activeProducts.length > 0) {
            const initialDish = activeProducts[0];
            setSelectedProduct(initialDish);
            const mSize = initialDish.sizes.find((s) => s.sizeName === "M") || initialDish.sizes[0];
            setSelectedSize(mSize);
            setSelectedSides([...initialDish.defaultSides]);
          }
        }
      } catch (err) {
        console.error("Erro ao carregar cardápio no PDV:", err);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  // 2. Polling de últimos pedidos no balcão a cada 5 segundos
  const fetchRecentOrders = async () => {
    try {
      const res = await fetch("/api/admin/orders");
      if (res.ok) {
        const data = await res.json();
        const ordersList = Array.isArray(data) ? data : data.orders || [];
        setRecentOrders(ordersList.slice(0, 5));
      }
    } catch (err) {
      console.error("Erro ao buscar histórico no PDV:", err);
    }
  };

  useEffect(() => {
    fetchRecentOrders();
    const interval = setInterval(fetchRecentOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  // Quando troca o prato selecionado
  const handleSelectProduct = (prod: Product) => {
    setSelectedProduct(prod);
    const mSize = prod.sizes.find((s) => s.sizeName === "M") || prod.sizes[0];
    setSelectedSize(mSize);
    setSelectedSides([...prod.defaultSides]);
  };

  // Toggle de guarnição inclusa
  const toggleSide = (side: string) => {
    if (selectedSides.includes(side)) {
      setSelectedSides(selectedSides.filter((s) => s !== side));
    } else {
      setSelectedSides([...selectedSides, side]);
    }
  };

  // Toggle de adicional
  const toggleAddon = (item: { id: string; name: string; price: number }) => {
    const existing = addons.find((a) => a.id === item.id);
    if (existing) {
      setAddons(addons.filter((a) => a.id !== item.id));
    } else {
      setAddons([...addons, { ...item, quantity: 1 }]);
    }
  };

  // Cálculos financeiros
  const dishPrice = selectedSize?.price || 0;
  const addonsTotal = addons.reduce((sum, a) => sum + a.price * a.quantity, 0);
  const deliveryFee = modality === "DELIVERY" ? 5.0 : 0.0;
  const totalOrder = dishPrice + addonsTotal + deliveryFee;

  const cashVal = parseFloat(cashReceived) || 0;
  const changeValue = Math.max(0, cashVal - totalOrder);

  // Limpa o formulário
  const resetForm = () => {
    setCustomerName("");
    setCustomerPhone("");
    setDeliveryAddress("");
    setNotes("");
    setAddons([]);
    setPaymentMethod("CASH");
    setCashReceived("50");
    setErrorMessage(null);
    if (products.length > 0) {
      handleSelectProduct(products[0]);
    }
  };

  // Enviar pedido para a cozinha (KDS)
  const handleSendToKDS = async () => {
    setErrorMessage(null);

    if (!selectedProduct || !selectedSize) {
      setErrorMessage("Por favor, selecione um prato e tamanho da marmita.");
      return;
    }

    if (modality === "DELIVERY") {
      if (!customerName.trim()) {
        setErrorMessage("O nome do cliente é obrigatório para pedidos com Entrega.");
        return;
      }
      if (!customerPhone.trim()) {
        setErrorMessage("O telefone/WhatsApp é obrigatório para pedidos com Entrega.");
        return;
      }
      if (!deliveryAddress.trim()) {
        setErrorMessage("O endereço de entrega é obrigatório para pedidos Delivery.");
        return;
      }
    }

    if (paymentMethod === "CASH" && cashVal < totalOrder) {
      setErrorMessage(
        `Valor em dinheiro (R$ ${cashVal.toFixed(2).replace(".", ",")}) é menor que o total do pedido (R$ ${totalOrder.toFixed(2).replace(".", ",")}).`
      );
      return;
    }

    setSubmitting(true);
    setSuccessMessage(null);

    const orderPayload = {
      customerName: customerName.trim() || `Consumidor Balcão`,
      customerPhone: customerPhone.replace(/\D/g, "") || "17999990000",
      orderType: modality,
      channel: channel,
      paymentMethod: paymentMethod,
      paymentStatus: "PAID",
      changeFor: paymentMethod === "CASH" && cashVal >= totalOrder ? cashVal : null,
      deliveryAddress: modality === "DELIVERY" ? deliveryAddress.trim() : null,
      notes: notes.trim() || null,
      items: [
        {
          productId: selectedProduct.id,
          name: selectedProduct.name,
          size: selectedSize.sizeName,
          unitPrice: selectedSize.price,
          quantity: 1,
          includedSides: selectedSides,
          addedSides: addons.map((a) => ({ name: a.name, price: a.price })),
          observations: notes.trim() || null,
        },
      ],
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      if (res.ok) {
        const result = await res.json();
        const orderNum = result.order?.orderNumber || result.orderNumber;
        setLastCreatedOrderNumber(orderNum);
        setSuccessMessage(`Pedido #${orderNum} enviado com sucesso ao KDS!`);
        startTransition(() => {
          fetchRecentOrders();
        });
        resetForm();
        setTimeout(() => setSuccessMessage(null), 5000);
      } else {
        const errorData = await res.json();
        setErrorMessage(`Erro ao lançar pedido: ${errorData.error || "Tente novamente."}`);
      }
    } catch (err) {
      console.error("Erro na requisição ao KDS:", err);
      setErrorMessage("Erro ao conectar com o servidor. Verifique a rede.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-surface">
      <AdminSidebar />

      <div className="pl-72 flex flex-col flex-1 min-w-0">
        {/* Top Header */}
        <header className="h-16 px-gutter-lg flex items-center justify-between bg-surface-container-lowest/90 backdrop-blur-xl border-b border-surface-container shadow-sm sticky top-0 z-30">
          <div className="flex items-center gap-space-lg">
            <div className="flex items-center gap-space-xs text-on-surface-variant">
              <Receipt className="w-5 h-5 text-primary" />
              <span className="font-body-sm text-body-sm font-semibold">Atendimento PDV • Frente de Caixa</span>
            </div>
            <div className="hidden md:flex items-center gap-space-xs bg-surface-container-high px-space-sm py-1 rounded-full text-on-surface-variant">
              <Clock className="w-4 h-4" />
              <span className="font-label-md text-label-md">Turno do Almoço</span>
            </div>
          </div>
          <div className="flex items-center gap-space-md">
            <div className="flex items-center gap-2 pl-space-sm">
              <span className="inline-flex h-2.5 w-2.5 rounded-full bg-primary animate-pulse"></span>
              <span className="font-label-sm text-label-sm text-primary font-bold">KDS Conectado</span>
            </div>
          </div>
        </header>

        {/* Action Bar */}
        <div className="px-gutter-lg py-space-md bg-surface-container-low flex flex-wrap items-center justify-between gap-space-md border-b border-surface-container">
          <div className="flex items-center gap-space-md">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-sm">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-space-xs">
                <h1 className="font-headline-md text-headline-md text-on-surface font-bold">Atendimento de Balcão &amp; PDV</h1>
                <span className="bg-tertiary text-on-tertiary font-label-sm text-label-sm px-2 py-0.5 rounded-full uppercase tracking-wider">Turno Ativo</span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Lançamento ágil de pedidos presenciais, WhatsApp e chamadas telefônicas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-space-sm">
            <button
              type="button"
              onClick={resetForm}
              className="flex items-center gap-1.5 px-space-md py-2 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant transition-colors font-label-md text-label-md"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Limpar Campos</span>
            </button>
          </div>
        </div>

        {/* Mensagens de Sucesso e Erro visuais (sem alert do navegador) */}
        {successMessage && (
          <div className="mx-gutter-lg mt-space-md p-space-md bg-primary-container text-on-primary-container rounded-xl flex items-center gap-space-sm font-label-md text-label-md shadow-md animate-fade-in">
            <CheckCircle2 className="w-5 h-5" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mx-gutter-lg mt-space-md p-space-md bg-error/15 text-error border border-error/30 rounded-xl flex items-center gap-space-sm font-label-md text-label-md shadow-md animate-fade-in">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Main Grid Workspace */}
        <main className="p-gutter-lg grid grid-cols-1 lg:grid-cols-12 gap-gutter-lg max-w-[1600px] w-full">
          {/* LEFT COLUMN: Fast Order Entry Form (Cols 7) */}
          <section className="lg:col-span-7 flex flex-col gap-space-lg">
            {/* Bloco 1: Dados do Comensal e Canal */}
            <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md border border-surface-container">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs text-primary font-title-md text-title-md font-bold">
                  <UserCheck className="w-5 h-5" />
                  <span>Dados do Comensal &amp; Origem</span>
                </div>
                <span className={`font-label-sm text-label-sm px-2 py-0.5 rounded font-bold ${
                  modality === "DELIVERY"
                    ? "bg-primary-fixed text-on-primary-fixed"
                    : "text-on-surface-variant bg-surface-container"
                }`}>
                  {modality === "DELIVERY" ? "Obrigatório para Delivery" : "Opcional para Balcão / Salão"}
                </span>
              </div>

              {/* Canal de Atendimento */}
              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-label-md text-on-surface">Canal de Origem</label>
                <div className="grid grid-cols-3 gap-space-sm">
                  <button
                    type="button"
                    onClick={() => setChannel("COUNTER")}
                    className={`py-2 px-space-sm rounded-lg font-label-md text-label-md flex items-center justify-center gap-1.5 transition-all ${
                      channel === "COUNTER"
                        ? "bg-primary-container text-on-primary-container font-bold shadow-sm"
                        : "bg-surface-container text-on-surface hover:bg-surface-container-high"
                    }`}
                  >
                    <Store className="w-4 h-4" />
                    <span>Balcão</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setChannel("WHATSAPP")}
                    className={`py-2 px-space-sm rounded-lg font-label-md text-label-md flex items-center justify-center gap-1.5 transition-all ${
                      channel === "WHATSAPP"
                        ? "bg-primary-container text-on-primary-container font-bold shadow-sm"
                        : "bg-surface-container text-on-surface hover:bg-surface-container-high"
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setChannel("PHONE")}
                    className={`py-2 px-space-sm rounded-lg font-label-md text-label-md flex items-center justify-center gap-1.5 transition-all ${
                      channel === "PHONE"
                        ? "bg-primary-container text-on-primary-container font-bold shadow-sm"
                        : "bg-surface-container text-on-surface hover:bg-surface-container-high"
                    }`}
                  >
                    <Phone className="w-4 h-4" />
                    <span>Telefone</span>
                  </button>
                </div>
              </div>

              {/* Modalidade de Entrega */}
              <div className="flex flex-col gap-1.5 pt-space-xs">
                <label className="font-label-md text-label-md text-on-surface">Modalidade de Atendimento</label>
                <div className="grid grid-cols-3 gap-space-sm">
                  <button
                    type="button"
                    onClick={() => setModality("PICKUP")}
                    className={`py-2.5 px-space-sm rounded-lg font-label-md text-label-md flex items-center justify-center gap-1.5 shadow-sm transition-all ${
                      modality === "PICKUP"
                        ? "bg-primary-container text-on-primary-container font-bold ring-2 ring-primary"
                        : "bg-surface-container text-on-surface hover:bg-surface-container-high"
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Retirada</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setModality("DINE_IN")}
                    className={`py-2.5 px-space-sm rounded-lg font-label-md text-label-md flex items-center justify-center gap-1.5 transition-all ${
                      modality === "DINE_IN"
                        ? "bg-primary-container text-on-primary-container font-bold ring-2 ring-primary shadow-sm"
                        : "bg-surface-container text-on-surface hover:bg-surface-container-high"
                    }`}
                  >
                    <UtensilsCrossed className="w-4 h-4" />
                    <span>Consumo Salão</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setModality("DELIVERY")}
                    className={`py-2.5 px-space-sm rounded-lg font-label-md text-label-md flex items-center justify-center gap-1.5 transition-all ${
                      modality === "DELIVERY"
                        ? "bg-primary-container text-on-primary-container font-bold ring-2 ring-primary shadow-sm"
                        : "bg-surface-container text-on-surface hover:bg-surface-container-high"
                    }`}
                  >
                    <Bike className="w-4 h-4" />
                    <span>Delivery (+R$ 5)</span>
                  </button>
                </div>
              </div>

              {/* Nome e WhatsApp */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md pt-space-xs">
                <div className="flex flex-col gap-1">
                  <label className="font-label-md text-label-md text-on-surface" htmlFor="client-name">
                    Nome / Identificador {modality === "DELIVERY" ? "*" : "(Opcional)"}
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 w-4 h-4 text-on-surface-variant" />
                    <input
                      id="client-name"
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder={modality === "DELIVERY" ? "Ex: Maria Costa..." : "Consumidor Balcão (Padrão)"}
                      className="w-full h-11 pl-10 pr-3 rounded-lg bg-surface-container-lowest border-0 ring-1 ring-outline-variant/50 focus:ring-2 focus:ring-primary text-on-surface font-body-md text-body-md outline-none transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-label-md text-label-md text-on-surface" htmlFor="client-phone">
                    WhatsApp / Telefone {modality === "DELIVERY" ? "*" : "(Opcional)"}
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 w-4 h-4 text-on-surface-variant" />
                    <input
                      id="client-phone"
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="(17) 99999-9999"
                      className="w-full h-11 pl-10 pr-3 rounded-lg bg-surface-container-lowest border-0 ring-1 ring-outline-variant/50 focus:ring-2 focus:ring-primary text-on-surface font-body-md text-body-md outline-none transition-all shadow-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Endereço de Entrega (Aparece somente quando Delivery selecionado) */}
              {modality === "DELIVERY" && (
                <div className="flex flex-col gap-1 pt-space-xs">
                  <label className="font-label-md text-label-md text-on-surface font-semibold" htmlFor="client-address">
                    Endereço Completo de Entrega (Jaborandi) *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-primary" />
                    <input
                      id="client-address"
                      type="text"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Ex: Rua Quinze de Novembro, 120 - Centro (Ref: Próximo à praça)"
                      className="w-full h-11 pl-10 pr-3 rounded-lg bg-surface-container-lowest border-0 ring-1 ring-primary focus:ring-2 focus:ring-primary text-on-surface font-body-md text-body-md outline-none transition-all shadow-sm"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Bloco 2: Especialidade do Fogão & Tamanho */}
            <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md border border-surface-container">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-space-xs text-primary font-title-md text-title-md font-bold">
                  <CookingPot className="w-5 h-5" />
                  <span>1. Escolha o Prato / Item</span>
                </div>
                {/* Filtro de Categorias no PDV */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  {[
                    { id: "todas", label: "Todos" },
                    { id: "marmita", label: "Marmitas" },
                    { id: "complemento", label: "Complementos" },
                    { id: "bebida", label: "Bebidas" },
                    { id: "sobremesa", label: "Sobremesas" },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                        selectedCategory === cat.id
                          ? "bg-primary text-on-primary shadow-xs"
                          : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {loading ? (
                <div className="py-6 text-center text-on-surface-variant font-body-sm">
                  Carregando pratos do fogão...
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-space-sm">
                  {(selectedCategory === "todas"
                    ? products
                    : products.filter((p) => p.category === selectedCategory)
                  ).map((prod) => {
                    const isSelected = selectedProduct?.id === prod.id;
                    return (
                      <button
                        key={prod.id}
                        type="button"
                        onClick={() => handleSelectProduct(prod)}
                        className={`p-space-sm rounded-xl flex flex-col items-start gap-1 transition-all text-left shadow-sm ${
                          isSelected
                            ? "bg-primary-fixed/50 text-on-primary-fixed ring-2 ring-primary font-bold"
                            : "bg-surface-container text-on-surface hover:bg-surface-container-high"
                        }`}
                      >
                        <span className="font-label-sm text-[11px] uppercase tracking-wider text-primary font-bold">
                          {prod.isDailySpecial ? "Prato do Dia" : prod.category}
                        </span>
                        <span className="font-title-md text-sm leading-snug line-clamp-2 min-h-[2.5rem] font-bold">
                          {prod.name}
                        </span>
                        <span className="font-body-sm text-xs opacity-80 line-clamp-1">
                          {prod.description}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Seletor de Tamanho */}
              {selectedProduct && selectedProduct.sizes.length > 0 && (
                <div className="flex flex-col gap-2 pt-space-xs border-t border-surface-container mt-1">
                  <label className="font-label-md text-label-md text-on-surface flex items-center justify-between">
                    <span>2. Tamanho / Porção ({selectedProduct.name})</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">Preço e porção ajustáveis</span>
                  </label>
                  <div className="grid grid-cols-3 gap-space-sm">
                    {selectedProduct.sizes.map((s) => {
                      const isChosen = selectedSize?.id === s.id;
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setSelectedSize(s)}
                          className={`p-space-md rounded-xl transition-all flex flex-col items-center justify-center gap-0.5 ${
                            isChosen
                              ? "bg-primary-container text-on-primary-container shadow-md ring-2 ring-primary font-bold"
                              : "bg-surface-container text-on-surface hover:bg-surface-container-high"
                          }`}
                        >
                          {s.sizeName === "M" && (
                            <span className="font-label-sm text-label-sm bg-tertiary-fixed text-on-tertiary-fixed px-2 py-0.5 rounded-full uppercase mb-0.5 font-bold">
                              Mais Vendida
                            </span>
                          )}
                          <span className="font-title-md text-title-md font-bold">Tamanho {s.sizeName}</span>
                          {s.weightGrams > 0 && (
                            <span className="font-body-sm text-body-sm opacity-90">{s.weightGrams}g</span>
                          )}
                          <span className="font-headline-sm text-headline-sm font-bold mt-1">
                            R$ {s.price.toFixed(2).replace(".", ",")}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Bloco 3: Guarnições Inclusas */}
            {selectedProduct && selectedProduct.defaultSides.length > 0 && (
              <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md border border-surface-container">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-space-xs text-primary font-title-md text-title-md font-bold">
                    <Utensils className="w-5 h-5" />
                    <span>3. Guarnições Inclusas na Marmita</span>
                  </div>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    Clique para retirar ou repor
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
                  {selectedProduct.defaultSides.map((side) => {
                    const isChecked = selectedSides.includes(side);
                    return (
                      <label
                        key={side}
                        className={`flex items-center justify-between p-space-md rounded-xl cursor-pointer transition-colors ${
                          isChecked ? "bg-surface-container-low" : "bg-surface-container/40 opacity-70"
                        }`}
                      >
                        <div className="flex items-center gap-space-sm">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleSide(side)}
                            className="w-5 h-5 rounded accent-primary text-primary focus:ring-0 cursor-pointer"
                          />
                          <span className={`font-label-lg text-label-lg ${isChecked ? "text-on-surface font-semibold" : "text-on-surface-variant line-through"}`}>
                            {side}
                          </span>
                        </div>
                        <CheckCircle2
                          className={`w-5 h-5 ${isChecked ? "text-primary" : "text-on-surface-variant/40"}`}
                        />
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Bloco 4: Adicionais de 1 Clique */}
            <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md border border-surface-container">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs text-primary font-title-md text-title-md font-bold">
                  <PlusCircle className="w-5 h-5" />
                  <span>4. Adicionais de 1 Clique (Bebidas &amp; Doces)</span>
                </div>
                <span className="font-label-sm text-label-sm text-tertiary font-bold">+ Venda Casada</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-sm">
                {defaultAddonOptions.map((item) => {
                  const isSelected = addons.some((a) => a.id === item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleAddon(item)}
                      className={`p-space-md rounded-xl flex items-center justify-between transition-all ${
                        isSelected
                          ? "bg-primary-container text-on-primary-container ring-2 ring-primary font-bold shadow-sm"
                          : "bg-surface-container text-on-surface hover:bg-surface-container-high"
                      }`}
                    >
                      <div className="flex flex-col text-left">
                        <span className="font-label-md text-label-md line-clamp-1">{item.name}</span>
                        <span className="font-body-sm text-body-sm opacity-80">
                          + R$ {item.price.toFixed(2).replace(".", ",")}
                        </span>
                      </div>
                      {isSelected ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bloco 5: Notas da Cozinha */}
            <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-sm border border-surface-container">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-space-xs text-primary font-title-md text-title-md font-bold" htmlFor="order-notes">
                  <FileText className="w-5 h-5" />
                  <span>Instrução Especial para a Cozinha / Fogão</span>
                </label>
                <span className="font-label-sm text-label-sm text-on-surface-variant">Destaque no KDS</span>
              </div>
              <textarea
                id="order-notes"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: Caprichar no molho; sem cheiro verde; cliente busca em 10 minutos..."
                className="w-full p-space-md rounded-lg bg-surface-container-low border-0 ring-1 ring-outline-variant/40 focus:ring-2 focus:ring-primary text-on-surface font-body-md text-body-md outline-none transition-all resize-none shadow-inner"
              ></textarea>
            </div>
          </section>

          {/* RIGHT COLUMN: Digital Order Ticket & Instant Checkout (Cols 5) */}
          <aside className="lg:col-span-5 flex flex-col gap-space-lg">
            {/* Authentic Comanda Digital Card */}
            <div className="bg-surface-container-lowest rounded-2xl shadow-lg overflow-hidden flex flex-col relative border border-surface-container">
              {/* Parchment Edge Line */}
              <div className="h-2 bg-gradient-to-r from-primary via-primary-container to-tertiary"></div>

              <div className="p-space-lg flex flex-col gap-space-md">
                {/* Ticket Header */}
                <div className="flex items-start justify-between pb-space-sm border-b border-surface-container">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-space-xs">
                      <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary font-bold">
                        Comanda de Balcão
                      </span>
                      <span className="bg-surface-container text-on-surface-variant px-1.5 py-0.5 rounded font-label-sm text-label-sm">
                        {channel === "COUNTER" ? "BALCÃO" : channel === "WHATSAPP" ? "WHATSAPP" : "TELEFONE"}
                      </span>
                    </div>
                    <span className="font-headline-lg text-headline-lg text-on-surface font-extrabold tracking-tight">
                      {lastCreatedOrderNumber ? `Comanda #${lastCreatedOrderNumber}` : "Nova comanda"}
                    </span>
                  </div>

                  <div className="flex flex-col items-end">
                    <span className="font-label-sm text-label-sm text-on-surface-variant">Origem &amp; Tipo</span>
                    <span className="mt-1 bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded font-label-sm text-label-sm font-semibold">
                      {modality === "PICKUP" ? "Retirada" : modality === "DINE_IN" ? "Salão" : "Delivery"}
                    </span>
                  </div>
                </div>

                {/* Identificação do Cliente */}
                <div className="flex flex-col gap-1 p-space-sm bg-surface-container-low rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-space-xs">
                      <User className="w-5 h-5 text-on-surface-variant" />
                      <span className="font-label-md text-label-md font-bold text-on-surface">
                        {customerName.trim() || "Consumidor Balcão"}
                      </span>
                    </div>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      {customerPhone.trim() || "(Sem telefone)"}
                    </span>
                  </div>
                  {modality === "DELIVERY" && (
                    <div className="text-xs text-on-surface-variant flex items-center gap-1 pt-1 border-t border-surface-container">
                      <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="truncate">{deliveryAddress.trim() || "Endereço não informado"}</span>
                    </div>
                  )}
                </div>

                {/* Itens da Comanda */}
                <div className="flex flex-col gap-space-sm max-h-[220px] overflow-y-auto pr-1">
                  {selectedProduct && selectedSize && (
                    <div className="flex items-start justify-between p-space-sm rounded-lg bg-surface-container/50">
                      <div className="flex flex-col">
                        <span className="font-label-lg text-label-lg text-on-surface font-bold">
                          1x {selectedProduct.name} ({selectedSize.sizeName})
                        </span>
                        <span className="font-body-sm text-body-sm text-on-surface-variant leading-snug">
                          {selectedSides.length > 0 ? `+ ${selectedSides.join(", ")}` : "Sem guarnições inclusas"}
                        </span>
                      </div>
                      <span className="font-title-md text-title-md text-primary font-bold whitespace-nowrap">
                        R$ {selectedSize.price.toFixed(2).replace(".", ",")}
                      </span>
                    </div>
                  )}

                  {/* Adicionais selecionados */}
                  {addons.map((a) => (
                    <div key={a.id} className="flex items-center justify-between px-space-sm py-1 rounded bg-surface-container-low">
                      <span className="font-body-md text-body-md text-on-surface">1x {a.name}</span>
                      <span className="font-label-md text-label-md text-on-surface font-semibold">
                        R$ {a.price.toFixed(2).replace(".", ",")}
                      </span>
                    </div>
                  ))}

                  {/* Taxa de entrega se houver */}
                  {modality === "DELIVERY" && (
                    <div className="flex items-center justify-between px-space-sm py-1 rounded bg-surface-container-low text-tertiary">
                      <span className="font-body-md text-body-md font-semibold">Taxa de Entrega (Jaborandi)</span>
                      <span className="font-label-md text-label-md font-bold">R$ 5,00</span>
                    </div>
                  )}
                </div>

                {/* Total Due Container */}
                <div className="p-space-md rounded-xl bg-surface-container-high flex items-center justify-between mt-space-xs">
                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-bold">
                      Valor Total a Pagar
                    </span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">Sem taxa de serviço</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="font-headline-sm text-headline-sm text-on-surface">R$</span>
                    <span className="font-display text-display text-primary font-extrabold leading-none tracking-tight">
                      {totalOrder.toFixed(2).replace(".", ",")}
                    </span>
                  </div>
                </div>

                {/* Forma de Liquidação */}
                <div className="flex flex-col gap-space-xs">
                  <label className="font-label-md text-label-md text-on-surface font-bold">Forma de Liquidação</label>
                  <div className="grid grid-cols-3 gap-space-xs">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("PIX")}
                      className={`pay-btn p-2 rounded-lg flex flex-col items-center justify-center gap-1 transition-colors ${
                        paymentMethod === "PIX"
                          ? "bg-primary-container text-on-primary-container font-bold shadow-sm"
                          : "bg-surface-container text-on-surface hover:bg-surface-container-high"
                      }`}
                    >
                      <QrCode className="w-5 h-5 text-tertiary" />
                      <span className="font-label-sm text-label-sm">PIX</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("CARD")}
                      className={`pay-btn p-2 rounded-lg flex flex-col items-center justify-center gap-1 transition-colors ${
                        paymentMethod === "CARD"
                          ? "bg-primary-container text-on-primary-container font-bold shadow-sm"
                          : "bg-surface-container text-on-surface hover:bg-surface-container-high"
                      }`}
                    >
                      <CreditCard className="w-5 h-5 text-secondary" />
                      <span className="font-label-sm text-label-sm">Maquininha</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("CASH")}
                      className={`pay-btn p-2 rounded-lg flex flex-col items-center justify-center gap-1 transition-colors ${
                        paymentMethod === "CASH"
                          ? "bg-primary-container text-on-primary-container font-bold shadow-sm"
                          : "bg-surface-container text-on-surface hover:bg-surface-container-high"
                      }`}
                    >
                      <Banknote className="w-5 h-5" />
                      <span className="font-label-sm text-label-sm">Dinheiro</span>
                    </button>
                  </div>
                </div>

                {/* Calculadora de Troco Dinâmica (se dinheiro) */}
                {paymentMethod === "CASH" && (
                  <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col gap-space-xs border border-surface-container">
                    <div className="flex items-center justify-between">
                      <span className="font-label-sm text-label-sm text-on-surface-variant font-bold uppercase">
                        Cálculo de Troco no Caixa
                      </span>
                      <span className="font-label-sm text-label-sm text-primary">Troco exato sugerido</span>
                    </div>
                    <div className="grid grid-cols-2 gap-space-sm items-center">
                      <div className="flex flex-col">
                        <label className="font-body-sm text-body-sm text-on-surface-variant" htmlFor="cash-received">
                          Recebido do Cliente:
                        </label>
                        <div className="relative mt-1">
                          <span className="absolute left-2.5 top-2 text-on-surface-variant font-label-md text-label-md">
                            R$
                          </span>
                          <input
                            id="cash-received"
                            type="number"
                            value={cashReceived}
                            onChange={(e) => setCashReceived(e.target.value)}
                            className={`w-full h-9 pl-9 pr-2 rounded bg-surface-container-lowest border-0 ring-1 focus:ring-1 text-on-surface font-title-md text-title-md outline-none ${
                              cashVal < totalOrder
                                ? "ring-error focus:ring-error"
                                : "ring-outline-variant/50 focus:ring-primary"
                            }`}
                          />
                        </div>
                      </div>

                      <div className="flex flex-col items-end">
                        <span className="font-body-sm text-body-sm text-on-surface-variant">Devolver ao Cliente:</span>
                        <span className={`font-headline-md text-headline-md font-extrabold mt-1 ${
                          cashVal < totalOrder ? "text-error" : "text-tertiary-container"
                        }`}>
                          R$ {changeValue.toFixed(2).replace(".", ",")}
                        </span>
                      </div>
                    </div>
                    {cashVal < totalOrder && (
                      <span className="text-xs text-error font-bold mt-1">
                        ⚠️ Valor recebido é menor que o total (mínimo R$ {totalOrder.toFixed(2).replace(".", ",")})
                      </span>
                    )}
                  </div>
                )}

                {/* Big Action Button (Send to KDS) */}
                <button
                  type="button"
                  onClick={handleSendToKDS}
                  disabled={submitting || (paymentMethod === "CASH" && cashVal < totalOrder)}
                  className="w-full h-16 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-headline-sm text-headline-sm font-bold flex items-center justify-center gap-space-sm shadow-xl hover:shadow-2xl transition-all transform active:scale-[0.99] disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                >
                  <Flame className="w-7 h-7 animate-bounce" />
                  <span>
                    {submitting
                      ? "ENVIANDO..."
                      : paymentMethod === "CASH" && cashVal < totalOrder
                      ? "VALOR RECEBIDO INSUFICIENTE"
                      : "ENVIAR PARA A COZINHA (KDS)"}
                  </span>
                  <ArrowRight className="w-6 h-6" />
                </button>

                <div className="flex items-center justify-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm">
                  <Printer className="w-4 h-4 text-tertiary" />
                  <span>Notifica a tela do fogão (KDS) em tempo real</span>
                </div>
              </div>
            </div>

            {/* Recent Orders Feed (Audit & KDS Status) */}
            <div className="bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm flex flex-col gap-space-md border border-surface-container">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs text-on-surface font-title-md text-title-md font-bold">
                  <History className="w-5 h-5 text-primary" />
                  <span>Últimos Pedidos</span>
                </div>
                <span className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                  Tempo real (5s)
                </span>
              </div>

              <div className="flex flex-col gap-space-xs">
                {recentOrders.length === 0 ? (
                  <p className="text-on-surface-variant font-body-sm py-4 text-center">
                    Nenhum pedido recente registrado.
                  </p>
                ) : (
                  recentOrders.map((ord) => {
                    const firstItem = ord.items[0];
                    return (
                      <div
                        key={ord.id}
                        className="p-space-sm rounded-xl bg-surface-container-low flex items-center justify-between hover:bg-surface-container transition-colors"
                      >
                        <div className="flex items-center gap-space-sm">
                          <span className="font-label-lg text-label-lg font-bold text-on-surface">
                            #{ord.orderNumber}
                          </span>
                          <div className="flex flex-col">
                            <span className="font-label-md text-label-md text-on-surface font-semibold">
                              {ord.customerName}
                            </span>
                            <span className="font-body-sm text-body-sm text-on-surface-variant">
                              {firstItem ? `${firstItem.quantity}x ${firstItem.productName} (${firstItem.size})` : "Marmita"} • R$ {ord.total.toFixed(2).replace(".", ",")}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`font-label-sm text-label-sm px-2.5 py-1 rounded-full font-bold flex items-center gap-1 ${getOrderStatusBadgeClass(
                              ord.status
                            )}`}
                          >
                            {getOrderStatusShortLabel(ord.status)}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}
