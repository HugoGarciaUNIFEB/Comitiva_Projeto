"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import SafeImage from "@/components/SafeImage";
import { useCartStore } from "@/lib/store/useCartStore";
import {
  ChevronRight,
  Award,
  User,
  CheckCircle2,
  MapPin,
  Mail,
  Phone,
  Sparkles,
  Gift,
  Ticket,
  Percent,
  Copy,
  Dices,
  Receipt,
  Eye,
  RotateCcw,
  Plus,
  Home,
  Edit2,
  Trash2,
  MapPinOff,
  X,
  Clock,
  CookingPot,
  Bike,
  XCircle,
  Info,
  LogOut,
} from "lucide-react";
import {
  getOrderStatusConfig,
  formatCurrency,
  formatPaymentMethod,
} from "@/lib/orderStatus";

interface OrderItem {
  id: string;
  productName: string;
  size?: string;
  sizeName?: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  sidesSelected?: string | null;
  sideAddons?: string | null;
}

interface Order {
  id: string;
  orderNumber: number;
  status: string;
  total: number;
  deliveryType: string;
  paymentMethod: string;
  pointsEarned: number;
  createdAt: string;
  items: OrderItem[];
}

interface Address {
  id: string;
  street: string;
  number: string;
  neighborhood: string;
  complement?: string | null;
  reference?: string | null;
  isDefault: boolean;
}

interface Coupon {
  id: string;
  code: string;
  discountType: string;
  discountValue: number;
  validUntil: string;
}

interface UserProfile {
  id: string;
  name: string;
  email?: string | null;
  whatsapp: string;
  points: number;
  coupons: Coupon[];
  orders: Order[];
  addresses: Address[];
}

export default function ContaPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"pedidos" | "enderecos">("pedidos");

  // Edição de perfil
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [saveStatus, setSaveStatus] = useState("");

  // Modal de endereço
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [complement, setComplement] = useState("");
  const [reference, setReference] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [addressError, setAddressError] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [copiedCouponId, setCopiedCouponId] = useState<string | null>(null);

  // Carrinho Zustand
  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);

  const loadProfile = async () => {
    try {
      const res = await fetch("/api/user/profile");
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setEditName(data.name);
        setEditEmail(data.email || "");
      }
    } catch (err) {
      console.error("Erro ao carregar perfil:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  // Salvar perfil
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus("Salvando...");

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, email: editEmail }),
      });

      if (res.ok) {
        setSaveStatus("Dados atualizados com sucesso!");
        loadProfile();
      } else {
        const err = await res.json();
        setSaveStatus(err.error || "Erro ao salvar.");
      }
    } catch {
      setSaveStatus("Erro de conexão ao salvar dados.");
    }

    setTimeout(() => setSaveStatus(""), 4000);
  };

  // Abrir modal de novo endereço
  const handleOpenNewAddress = () => {
    setEditingAddressId(null);
    setStreet("");
    setNumber("");
    setNeighborhood("");
    setComplement("");
    setReference("");
    setIsDefault(false);
    setAddressError("");
    setIsAddressModalOpen(true);
  };

  // Abrir modal de edição de endereço
  const handleEditAddress = (addr: Address) => {
    setEditingAddressId(addr.id);
    setStreet(addr.street);
    setNumber(addr.number);
    setNeighborhood(addr.neighborhood);
    setComplement(addr.complement || "");
    setReference(addr.reference || "");
    setIsDefault(addr.isDefault);
    setAddressError("");
    setIsAddressModalOpen(true);
  };

  // Salvar endereço (POST ou PUT)
  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddressError("");

    if (!street || !number || !neighborhood) {
      setAddressError("Preencha rua, número e bairro.");
      return;
    }

    try {
      const url = editingAddressId
        ? `/api/user/addresses/${editingAddressId}`
        : "/api/user/addresses";
      const method = editingAddressId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          street,
          number,
          neighborhood,
          complement,
          reference,
          isDefault,
        }),
      });

      if (res.ok) {
        setIsAddressModalOpen(false);
        loadProfile();
      } else {
        const err = await res.json();
        setAddressError(err.error || "Erro ao salvar endereço.");
      }
    } catch {
      setAddressError("Erro ao comunicar com o servidor.");
    }
  };

  // Excluir endereço com confirmação visual (sem confirm do navegador)
  const handleDeleteAddress = async (id: string) => {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id);
      return;
    }
    setConfirmDeleteId(null);
    try {
      const res = await fetch(`/api/user/addresses/${id}`, { method: "DELETE" });
      if (res.ok) loadProfile();
    } catch (err) {
      console.error("Erro ao deletar endereço:", err);
    }
  };

  // "Pedir Novamente": joga itens no carrinho Zustand e abre o Drawer
  const handleReorder = (order: Order) => {
    order.items.forEach((item) => {
      let sides: string[] = [];
      let addons: { name: string; price: number }[] = [];

      try {
        if (item.sidesSelected) sides = JSON.parse(item.sidesSelected);
        if (item.sideAddons) addons = JSON.parse(item.sideAddons);
      } catch {
        // ignora se parse falhar
      }

      addItem({
        productId: item.id,
        name: item.productName,
        imageUrl: "/images/pratos/costela_fogo_chao.jpg",
        size: item.sizeName || "M",
        weight: "550 g",
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        includedSides: sides,
        addedSides: addons,
      });
    });

    openCart();
  };

  // Formata status do pedido usando a fonte única do sistema
  const getStatusBadge = (status: string) => {
    const config = getOrderStatusConfig(status);
    const upper = (status || "").toUpperCase();
    return {
      label: config.label,
      bg: config.badgeClass,
      icon:
        upper === "NO_FOGAO" ? (
          <CookingPot className="w-4 h-4" />
        ) : upper === "PRONTO" || upper === "EM_ROTA" ? (
          <Bike className="w-4 h-4" />
        ) : upper === "ENTREGUE" ? (
          <CheckCircle2 className="w-4 h-4 text-primary" />
        ) : upper === "CANCELADO" ? (
          <XCircle className="w-4 h-4" />
        ) : (
          <Clock className="w-4 h-4" />
        ),
    };
  };

  return (
    <div className="min-h-screen bg-surface font-body-md text-on-surface antialiased flex flex-col">
      <Header />
      <CartDrawer />

      <main className="w-full pt-28 bg-surface flex-1">
        <div className="flex flex-col w-full max-w-7xl mx-auto px-gutter-lg pb-space-xl">
          {/* Top Welcome Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md mb-space-lg">
            <div>
              <div className="flex items-center gap-space-xs font-label-md text-label-md text-secondary mb-space-xs">
                <span>Painel do Comensal</span>
                <ChevronRight className="w-3.5 h-3.5 text-on-surface-variant" />
                <span className="text-primary font-bold">Minha Conta &amp; Histórico</span>
              </div>
              <h1 className="font-headline-lg text-headline-lg text-on-surface">
                Minha Conta &amp; Comitiva
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Gerencie seus pedidos no fogão a lenha, pontuação de tropeiro e locais de entrega.
              </p>
            </div>

            {/* Quick Status Counter */}
            <div className="flex items-center gap-space-sm bg-surface-container-low px-space-md py-space-sm rounded-2xl border border-outline-variant/30">
              <div className="w-10 h-10 rounded-full bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed shadow-sm">
                <Award className="w-5 h-5 text-tertiary" />
              </div>
              <div>
                <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider block">
                  Status Comitiva
                </span>
                <span className="font-label-lg text-label-lg text-on-surface font-bold">
                  Tropeiro Fiel • {profile?.points || 0} pts
                </span>
              </div>
            </div>
          </div>

          {/* Main 2-Column Responsive Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
            {/* Coluna Esquerda: Identificação e Carteira */}
            <div className="lg:col-span-5 flex flex-col gap-space-lg">
              {/* Cartão de Perfil Pessoal */}
              <section className="bg-surface-container-lowest rounded-2xl shadow-md p-space-lg border border-outline-variant/30">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-space-md mb-space-lg pb-space-md border-b border-outline-variant/20">
                  <div className="w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary shrink-0">
                    <User className="w-10 h-10" />
                  </div>
                  <div className="text-center sm:text-left flex-1">
                    <div className="inline-flex items-center gap-space-xs bg-tertiary-fixed text-on-tertiary-fixed px-space-sm py-0.5 rounded-full font-label-sm text-label-sm mb-space-xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-tertiary" />
                      <span>Cliente Autenticado</span>
                    </div>
                    <h2 className="font-headline-sm text-headline-sm text-on-surface">
                      {profile?.name || "Carregando..."}
                    </h2>
                    <div className="flex items-center justify-center sm:justify-start gap-space-md mt-1.5">
                      <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-space-xs">
                        <MapPin className="w-3.5 h-3.5 text-primary" />
                        Jaborandi - SP
                      </p>
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await fetch("/api/auth/logout", { method: "POST" });
                          } catch (err) {
                            console.error(err);
                          } finally {
                            window.location.href = "/";
                          }
                        }}
                        className="text-xs text-error hover:bg-error/10 px-2 py-0.5 rounded-lg font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        title="Sair da Conta"
                      >
                        <LogOut className="w-3 h-3" />
                        <span>Sair</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Formulário de Dados */}
                <form onSubmit={handleSaveProfile} className="space-y-space-md">
                  <div>
                    <label className="block font-label-md text-label-md text-on-surface-variant mb-space-xs" htmlFor="nome">
                      Nome Completo
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-space-sm top-3.5 text-secondary" />
                      <input
                        id="nome"
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        required
                        className="w-full h-11 pl-10 pr-space-md rounded-xl bg-surface-container-low font-body-md text-body-md text-on-surface focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary transition-all border border-outline-variant/30"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-label-md text-label-md text-on-surface-variant mb-space-xs" htmlFor="email">
                      E-mail (opcional)
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-space-sm top-3.5 text-secondary" />
                      <input
                        id="email"
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        placeholder="seu@email.com"
                        className="w-full h-11 pl-10 pr-space-md rounded-xl bg-surface-container-low font-body-md text-body-md text-on-surface focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary transition-all border border-outline-variant/30"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-label-md text-label-md text-on-surface-variant mb-space-xs" htmlFor="whatsapp">
                      WhatsApp (Identificador Único)
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-space-sm top-3.5 text-secondary" />
                      <input
                        id="whatsapp"
                        type="text"
                        disabled
                        value={profile?.whatsapp || ""}
                        className="w-full h-11 pl-10 pr-space-md rounded-xl bg-surface-container-high/60 font-body-md text-body-md text-on-surface-variant cursor-not-allowed border border-outline-variant/20"
                      />
                    </div>
                  </div>

                  {saveStatus && (
                    <p className="text-center font-label-md text-primary">{saveStatus}</p>
                  )}

                  <button
                    type="submit"
                    className="w-full h-12 mt-space-sm bg-primary hover:bg-primary-container text-on-primary rounded-xl font-label-lg text-label-lg flex items-center justify-center gap-space-sm shadow-md transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Salvar Alterações</span>
                  </button>
                </form>
              </section>

              {/* Bloco Carteira & Cupons */}
              <section className="bg-surface-container-lowest rounded-2xl shadow-md p-space-lg flex flex-col gap-space-md border border-outline-variant/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-space-xs">
                    <Sparkles className="w-5 h-5 text-tertiary" />
                    <h3 className="font-headline-sm text-headline-sm text-on-surface">
                      Carteira &amp; Fidelidade
                    </h3>
                  </div>
                  <Link
                    href="/fidelidade"
                    className="font-label-sm text-primary hover:underline font-bold"
                  >
                    Ver Clube &rarr;
                  </Link>
                </div>

                {/* Card Saldo */}
                <div className="bg-gradient-to-br from-primary via-primary-container to-secondary text-on-primary rounded-2xl p-space-md shadow-sm relative overflow-hidden">
                  <div className="relative z-10">
                    <span className="font-label-sm text-label-sm text-primary-fixed uppercase tracking-wider block mb-space-xs">
                      Saldo de Fidelidade
                    </span>
                    <div className="flex items-baseline gap-space-xs mb-space-xs">
                      <span className="font-display text-display leading-none text-surface-bright font-bold">
                        {profile?.points || 0}
                      </span>
                      <span className="font-label-lg text-label-lg text-primary-fixed">
                        Pontos Comitiva
                      </span>
                    </div>
                    <p className="font-body-sm text-body-sm text-primary-fixed-dim mb-space-md">
                      R$ 1,00 gasto = 1 ponto. Troque por marmitas e sobremesas da roça!
                    </p>
                    <Link
                      href="/fidelidade"
                      className="w-full py-2.5 px-space-md bg-tertiary-fixed text-on-tertiary-fixed font-label-lg text-label-lg rounded-xl shadow-sm hover:bg-tertiary-fixed-dim transition-all text-center flex items-center justify-center gap-space-xs font-bold"
                    >
                      <Gift className="w-4 h-4" />
                      <span>Resgatar na Loja de Prêmios</span>
                    </Link>
                  </div>
                </div>

                {/* Cupons da Roleta Ativos */}
                <div>
                  <div className="flex items-center justify-between mb-space-sm">
                    <h4 className="font-label-lg text-label-lg text-on-surface flex items-center gap-space-xs">
                      <Ticket className="w-4 h-4 text-tertiary" />
                      Cupons Ativos na Carteira
                    </h4>
                    <span className="font-label-sm text-label-sm text-secondary">
                      {profile?.coupons.length || 0} válidos
                    </span>
                  </div>

                  <div className="space-y-space-sm">
                    {profile?.coupons && profile.coupons.length > 0 ? (
                      profile.coupons.map((coupon) => (
                        <div
                          key={coupon.id}
                          className="bg-surface-container-low rounded-xl p-space-sm flex items-center justify-between border border-outline-variant/30"
                        >
                          <div className="flex items-center gap-space-sm">
                            <div className="w-9 h-9 rounded-lg bg-tertiary-container text-on-tertiary-container flex items-center justify-center shrink-0">
                              <Percent className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="font-label-md text-label-md text-on-surface font-bold block">
                                {coupon.code}
                              </span>
                              <span className="font-body-sm text-body-sm text-on-surface-variant">
                                Desconto de{" "}
                                {coupon.discountType === "PERCENTAGE"
                                  ? `${coupon.discountValue}%`
                                  : `R$ ${coupon.discountValue.toFixed(2)}`}{" "}
                                • até 13h
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(coupon.code);
                              setCopiedCouponId(coupon.id);
                              setTimeout(() => setCopiedCouponId(null), 2500);
                            }}
                            className="px-2.5 py-1 text-primary hover:bg-primary-fixed/30 rounded-lg cursor-pointer font-label-sm text-label-sm flex items-center gap-1"
                            title="Copiar cupom"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>{copiedCouponId === coupon.id ? "Copiado!" : "Copiar"}</span>
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 bg-surface-container-low rounded-xl text-on-surface-variant text-body-sm">
                        Nenhum cupom ativo no momento.
                      </div>
                    )}
                  </div>

                  <Link
                    href="/roleta"
                    className="mt-space-md w-full py-2.5 px-space-md bg-surface-container text-on-surface hover:bg-surface-variant rounded-xl font-label-lg text-label-lg flex items-center justify-center gap-space-sm transition-colors"
                  >
                    <Dices className="w-4 h-4 text-tertiary" />
                    <span>Girar Roleta Caipira da Sorte</span>
                  </Link>
                </div>
              </section>
            </div>

            {/* Coluna Direita: Abas de Histórico e Endereços */}
            <div className="lg:col-span-7 flex flex-col gap-space-md">
              {/* Seletor de Abas */}
              <div className="bg-surface-container-lowest rounded-2xl p-1.5 shadow-sm flex items-center gap-space-xs border border-outline-variant/30">
                <button
                  onClick={() => setActiveTab("pedidos")}
                  className={`flex-1 py-2.5 px-space-md rounded-xl font-label-lg text-label-lg text-center transition-all flex items-center justify-center gap-space-xs cursor-pointer ${
                    activeTab === "pedidos"
                      ? "bg-primary text-on-primary shadow-sm"
                      : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
                  }`}
                >
                  <Receipt className="w-4 h-4" />
                  <span>Histórico de Pedidos</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      activeTab === "pedidos"
                        ? "bg-primary-container text-on-primary-container"
                        : "bg-surface-container text-secondary"
                    }`}
                  >
                    {profile?.orders.length || 0}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab("enderecos")}
                  className={`flex-1 py-2.5 px-space-md rounded-xl font-label-lg text-label-lg text-center transition-all flex items-center justify-center gap-space-xs cursor-pointer ${
                    activeTab === "enderecos"
                      ? "bg-primary text-on-primary shadow-sm"
                      : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
                  }`}
                >
                  <MapPin className="w-4 h-4" />
                  <span>Meus Endereços</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      activeTab === "enderecos"
                        ? "bg-primary-container text-on-primary-container"
                        : "bg-surface-container text-secondary"
                    }`}
                  >
                    {profile?.addresses.length || 0}
                  </span>
                </button>
              </div>

              {/* Conteúdo da Aba Pedidos */}
              {activeTab === "pedidos" && (
                <div className="flex flex-col gap-space-md">
                  {profile?.orders && profile.orders.length > 0 ? (
                    profile.orders.map((order) => {
                      const badge = getStatusBadge(order.status);

                      return (
                        <article
                          key={order.id}
                          className="bg-surface-container-lowest rounded-2xl shadow-md p-space-lg relative overflow-hidden border border-outline-variant/30"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs pb-space-sm mb-space-sm border-b border-outline-variant/10">
                            <div className="flex items-center gap-space-sm">
                              <h3 className="font-headline-sm text-headline-sm text-on-surface">
                                Pedido #{order.orderNumber}
                              </h3>
                              <span className="font-body-sm text-body-sm text-secondary">
                                {new Date(order.createdAt).toLocaleDateString("pt-BR", {
                                  day: "2-digit",
                                  month: "2-digit",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                            <span
                              className={`inline-flex items-center gap-space-xs px-space-sm py-1 rounded-full font-label-sm text-label-sm w-max ${badge.bg}`}
                            >
                              {badge.icon}
                              <span>{badge.label}</span>
                            </span>
                          </div>

                          {/* Itens do Pedido */}
                          <div className="space-y-space-xs mb-space-md">
                            {order.items.map((item) => {
                              const itemSize = item.size || item.sizeName;
                              return (
                                <div
                                  key={item.id}
                                  className="flex items-start justify-between font-body-md text-body-md text-on-surface"
                                >
                                  <div className="flex-1 pr-space-sm">
                                    <span className="font-bold text-primary">
                                      {item.quantity}x
                                    </span>{" "}
                                    {item.productName}
                                    {itemSize && itemSize !== "UNICO" ? ` (${itemSize})` : ""}
                                  </div>
                                  <span className="font-label-md text-label-md font-bold">
                                    {formatCurrency(item.totalPrice)}
                                  </span>
                                </div>
                              );
                            })}
                          </div>

                          {/* Total e Ações */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pt-space-sm border-t border-outline-variant/10">
                            <div>
                              <span className="font-body-sm text-body-sm text-secondary block">
                                Total Pago ({formatPaymentMethod(order.paymentMethod)})
                              </span>
                              <span className="font-headline-sm text-headline-sm text-primary font-bold">
                                {formatCurrency(order.total)}
                              </span>
                            </div>

                            <div className="flex items-center gap-space-xs flex-wrap">
                              <Link
                                href={`/pedidos/${order.id}`}
                                className="py-2 px-space-md bg-surface-container text-on-surface hover:bg-surface-variant rounded-xl font-label-md text-label-md flex items-center gap-space-xs transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                                <span>Acompanhar</span>
                              </Link>

                              <button
                                onClick={() => handleReorder(order)}
                                className="py-2 px-space-md bg-primary hover:bg-primary-container text-on-primary rounded-xl font-label-md text-label-md flex items-center gap-space-xs shadow-sm transition-all cursor-pointer"
                              >
                                <RotateCcw className="w-4 h-4" />
                                <span>Pedir Novamente</span>
                              </button>
                            </div>
                          </div>
                        </article>
                      );
                    })
                  ) : (
                    <div className="text-center py-12 bg-surface-container-lowest rounded-2xl p-8 border border-outline-variant/30 flex flex-col items-center">
                      <div className="w-32 h-32 mb-4">
                        <SafeImage
                          src="/images/vazio/sem_pedidos.svg"
                          alt="Sem pedidos"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <h4 className="font-title-md text-title-md text-on-surface">
                        Nenhum pedido realizado ainda
                      </h4>
                      <p className="font-body-sm text-on-surface-variant mt-1 mb-6">
                        Que tal escolher um delicioso almoço caipira preparado no fogão a lenha?
                      </p>
                      <Link
                        href="/"
                        className="py-3 px-6 bg-primary text-on-primary rounded-xl font-label-lg shadow-sm hover:bg-primary-container"
                      >
                        Ver Cardápio do Dia
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Conteúdo da Aba Endereços */}
              {activeTab === "enderecos" && (
                <div className="flex flex-col gap-space-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-headline-sm text-headline-sm text-on-surface">
                        Locais de Entrega Salvos
                      </h3>
                      <p className="font-body-sm text-on-surface-variant">
                        Sua marmita quentinha entregue no endereço certo em Jaborandi - SP.
                      </p>
                    </div>
                    <button
                      onClick={handleOpenNewAddress}
                      className="py-2.5 px-4 rounded-xl bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Novo Endereço</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                    {profile?.addresses && profile.addresses.length > 0 ? (
                      profile.addresses.map((addr) => (
                        <div
                          key={addr.id}
                          className="bg-surface-container-lowest rounded-2xl shadow-md p-space-md flex flex-col justify-between border border-outline-variant/30"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-space-xs">
                              <div className="flex items-center gap-space-xs">
                                <Home className="w-4 h-4 text-primary" />
                                <h4 className="font-label-lg text-label-lg text-on-surface font-bold">
                                  {addr.street}, {addr.number}
                                </h4>
                              </div>
                              {addr.isDefault && (
                                <span className="bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm px-2.5 py-0.5 rounded-full font-bold">
                                  Principal
                                </span>
                              )}
                            </div>

                            <p className="font-body-sm text-body-sm text-on-surface-variant">
                              Bairro {addr.neighborhood} • Jaborandi - SP
                            </p>
                            {addr.complement && (
                              <p className="font-body-sm text-body-sm text-secondary mt-1">
                                Complemento: {addr.complement}
                              </p>
                            )}
                            {addr.reference && (
                              <p className="font-body-sm text-body-sm text-on-surface-variant italic mt-0.5">
                                Ref.: {addr.reference}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center justify-end gap-space-xs mt-space-md pt-space-xs border-t border-outline-variant/10">
                            <button
                              onClick={() => handleEditAddress(addr)}
                              className="py-1 px-space-sm text-secondary hover:bg-surface-container rounded-lg font-label-md text-label-md flex items-center gap-space-xs cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              <span>Editar</span>
                            </button>
                            <button
                              onClick={() => handleDeleteAddress(addr.id)}
                              className={`py-1 px-space-sm rounded-lg font-label-md text-label-md flex items-center gap-space-xs cursor-pointer transition-colors ${
                                confirmDeleteId === addr.id
                                  ? "bg-error text-on-error font-bold"
                                  : "text-error hover:bg-error-container/20"
                              }`}
                              title={confirmDeleteId === addr.id ? "Clique novamente para confirmar exclusão" : "Excluir endereço"}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>{confirmDeleteId === addr.id ? "Confirmar?" : "Excluir"}</span>
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-2 text-center py-8 bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 flex flex-col items-center">
                        <div className="w-28 h-28 mb-3">
                          <SafeImage
                            src="/images/vazio/sem_enderecos.svg"
                            alt="Sem endereços"
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <p className="font-body-md text-on-surface-variant">
                          Você ainda não possui nenhum endereço cadastrado.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Modal de Adicionar / Editar Endereço (Design Stitch) */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-outline-variant/30 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-outline-variant/20 mb-6">
              <h3 className="font-headline-sm text-headline-sm text-on-surface">
                {editingAddressId ? "Editar Endereço" : "Novo Endereço de Entrega"}
              </h3>
              <button
                onClick={() => setIsAddressModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-surface-container-high flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4 text-on-surface-variant" />
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block font-label-md text-on-surface-variant mb-1">
                    Rua / Avenida *
                  </label>
                  <input
                    type="text"
                    required
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="Ex: Rua das Palmeiras"
                    className="w-full h-11 px-3 rounded-xl bg-surface-container-low border border-outline-variant/30 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block font-label-md text-on-surface-variant mb-1">
                    Número *
                  </label>
                  <input
                    type="text"
                    required
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    placeholder="123"
                    className="w-full h-11 px-3 rounded-xl bg-surface-container-low border border-outline-variant/30 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block font-label-md text-on-surface-variant mb-1">
                  Bairro *
                </label>
                <input
                  type="text"
                  required
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  placeholder="Ex: Centro / São Bento"
                  className="w-full h-11 px-3 rounded-xl bg-surface-container-low border border-outline-variant/30 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block font-label-md text-on-surface-variant mb-1">
                  Complemento
                </label>
                <input
                  type="text"
                  value={complement}
                  onChange={(e) => setComplement(e.target.value)}
                  placeholder="Ex: Apto 12, Casa dos Fundos"
                  className="w-full h-11 px-3 rounded-xl bg-surface-container-low border border-outline-variant/30 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block font-label-md text-on-surface-variant mb-1">
                  Ponto de Referência
                </label>
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="Ex: Próximo à praça da matriz"
                  className="w-full h-11 px-3 rounded-xl bg-surface-container-low border border-outline-variant/30 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="w-4 h-4 text-primary rounded"
                />
                <span className="font-label-md text-on-surface">
                  Definir como endereço de entrega principal
                </span>
              </label>

              {addressError && (
                <p className="text-error font-body-sm text-center">{addressError}</p>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant/20">
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-on-surface-variant hover:bg-surface-container font-label-md cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-primary text-on-primary hover:bg-primary-container font-label-md font-bold shadow-md cursor-pointer"
                >
                  Salvar Endereço
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
