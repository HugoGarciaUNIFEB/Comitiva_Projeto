"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import SafeImage from "@/components/SafeImage";
import {
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  Flame,
  Clock,
  Route,
  Check,
  CheckCheck,
  CookingPot,
  Bike,
  Utensils,
  Receipt,
  MapPin,
  Star,
  Phone,
  MessageSquare,
  Thermometer,
  Award,
  UtensilsCrossed,
  PackageCheck,
} from "lucide-react";
import {
  getOrderStatusConfig,
  getOrderStepIndex,
  formatCurrency,
  formatPaymentMethod,
} from "@/lib/orderStatus";

interface OrderItem {
  id: string;
  productName: string;
  sizeName: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  sidesSelected?: string | null;
  sideAddons?: string | null;
  product?: {
    imageUrl: string;
  };
}

interface OrderDetails {
  id: string;
  orderNumber: number;
  status: string;
  total: number;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  deliveryType: "ENTREGA" | "RETIRADA";
  addressStreet?: string | null;
  addressNumber?: string | null;
  neighborhood?: string | null;
  complement?: string | null;
  reference?: string | null;
  customerName: string;
  customerPhone: string;
  paymentMethod: string;
  pointsEarned: number;
  createdAt: string;
  items: OrderItem[];
}

export default function OrderTrackingPage() {
  const params = useParams();
  const orderId = params?.id as string;

  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Função para buscar status do pedido
  const fetchOrder = async () => {
    if (!orderId) return;
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data);
        setLastUpdated(new Date());
      } else {
        const err = await res.json();
        setError(err.error || "Pedido não encontrado.");
      }
    } catch {
      setError("Erro ao atualizar status do pedido.");
    } finally {
      setLoading(false);
    }
  };

  // Polling a cada 5 segundos (Regra da Seção 3 e 6)
  useEffect(() => {
    fetchOrder();
    const interval = setInterval(() => {
      fetchOrder();
    }, 5000);

    return () => clearInterval(interval);
  }, [orderId]);

  const isDelivery = order?.deliveryType === "ENTREGA";
  const statusConfig = getOrderStatusConfig(order?.status, isDelivery);
  const currentStep = getOrderStepIndex(order?.status, isDelivery);
  const isDelivered = (order?.status || "").toUpperCase() === "ENTREGUE";

  return (
    <div className="min-h-screen bg-background font-body-md text-on-surface flex flex-col">
      <Header />
      <CartDrawer />

      <main className="w-full pt-28 bg-background flex-1">
        <div className="flex flex-col w-full">
          <div className="w-full max-w-7xl mx-auto px-margin-lg py-space-md">
            {/* Top Floating Toast */}
            <div className="flex flex-wrap items-center justify-between gap-space-sm mb-space-md">
              <div className="flex items-center gap-space-xs text-on-surface-variant font-label-md text-label-md">
                <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1">
                  <ArrowLeft className="w-4 h-4" />
                  <span>Início</span>
                </Link>
                <span>/</span>
                <Link href="/conta" className="hover:text-primary transition-colors">
                  Meus Pedidos
                </Link>
                <span>/</span>
                <span className="text-on-surface font-bold">Acompanhamento ao Vivo</span>
              </div>

              <div className="flex items-center gap-space-xs bg-surface-container-high px-space-md py-1.5 rounded-full shadow-sm">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
                </span>
                <span className="font-label-sm text-label-sm text-on-surface uppercase tracking-wider font-bold">
                  Atualização em tempo real • Cozinha Jaborandi
                </span>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-20">
                <RefreshCw className="w-12 h-12 text-primary animate-spin mx-auto" />
                <p className="mt-2 text-on-surface-variant">Buscando status do seu almoço...</p>
              </div>
            ) : error || !order ? (
              <div className="text-center py-16 bg-surface-container-lowest rounded-3xl p-8 border border-error/20">
                <AlertCircle className="w-12 h-12 text-error mx-auto" />
                <h2 className="font-headline-md text-headline-md text-on-surface mt-2">
                  Pedido não encontrado
                </h2>
                <p className="font-body-md text-on-surface-variant mt-1 mb-6">
                  {error || "Verifique o número do pedido ou acesse o histórico na sua conta."}
                </p>
                <Link
                  href="/"
                  className="py-3 px-6 bg-primary text-on-primary rounded-xl font-label-lg shadow-sm"
                >
                  Voltar ao Cardápio
                </Link>
              </div>
            ) : (
              <>
                {/* Hero Success Banner */}
                <div className="relative overflow-hidden rounded-3xl bg-surface-container shadow-md p-space-lg md:p-space-xl mb-space-lg border border-outline-variant/30">
                  <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
                  <div className="absolute -left-12 -bottom-12 w-64 h-64 rounded-full bg-tertiary-fixed/30 blur-2xl pointer-events-none" />

                  <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-space-lg">
                    <div className="flex items-start gap-space-md">
                      <div className="relative shrink-0 w-20 h-20 rounded-2xl bg-primary text-on-primary flex items-center justify-center shadow-md">
                        <CookingPot className="w-10 h-10" />
                        <span className="absolute -bottom-1 -right-1 bg-tertiary-fixed-dim text-on-tertiary-fixed text-[12px] font-bold p-1 rounded-full shadow-sm">
                          <Flame className="w-4 h-4 block" />
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-space-sm">
                          <span className="font-headline-lg text-headline-lg text-primary font-display">
                            Pedido #{order.orderNumber}
                          </span>
                          <span className={`px-3 py-1 rounded-full font-label-sm text-label-sm uppercase tracking-wide shadow-sm font-bold ${statusConfig.badgeClass}`}>
                            {statusConfig.label}
                          </span>
                        </div>
                        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
                          {statusConfig.description}
                        </p>
                      </div>
                    </div>

                    {/* Previsão de Entrega */}
                    <div className="w-full lg:w-auto bg-surface-container-lowest p-space-md rounded-2xl shadow-sm flex items-center gap-space-md shrink-0 border border-outline-variant/30">
                      <div className="w-12 h-12 rounded-xl bg-primary-fixed flex items-center justify-center text-primary">
                        <Clock className="w-7 h-7" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                          Previsão Horário de Pico
                        </span>
                        <span className="font-title-md text-title-md text-on-surface font-bold">
                          10h30 às 13h00
                        </span>
                        <span className="font-label-md text-label-md text-primary font-bold flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Entrega quente garantida
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Horizontal Stepper Timeline */}
                <div className="bg-surface-container-lowest rounded-3xl shadow-md p-space-lg mb-space-lg border border-outline-variant/30">
                  <div className="flex items-center justify-between mb-space-lg">
                    <div className="flex items-center gap-space-xs">
                      <Route className="w-6 h-6 text-primary" />
                      <h2 className="font-headline-sm text-headline-sm text-on-surface">
                        Rastreio da Marmita ao Vivo
                      </h2>
                    </div>
                    <span className="font-label-md text-label-md text-on-surface-variant">
                      Código Único:{" "}
                      <strong className="text-on-surface">JBD-#{order.orderNumber}-LENHA</strong>
                    </span>
                  </div>

                  {/* Horizontal Stepper Timeline (Desktop / Tablet) */}
                  <div className="hidden md:block relative w-full py-space-md">
                    {/* Linha de Conexão Fundo */}
                    <div className="absolute top-10 left-8 right-8 h-1.5 bg-surface-container-highest -translate-y-1/2 z-0 rounded-full" />

                    {/* Linha Ativa com base na etapa */}
                    <div
                      className="absolute top-10 left-8 h-1.5 bg-primary -translate-y-1/2 z-0 rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: isDelivered
                          ? "100%"
                          : isDelivery
                          ? `${Math.min(100, Math.max(0, (currentStep / 4) * 88 + 6))}%`
                          : `${Math.min(100, Math.max(0, (currentStep / 3) * 88 + 6))}%`,
                      }}
                    />

                    {/* Steps Grid (5 etapas para Entrega, 4 etapas para Retirada) */}
                    {isDelivery ? (
                      <div className="relative z-10 grid grid-cols-5 gap-2 text-center">
                        {/* Step 1: Aprovado */}
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md mb-space-sm transition-all ${
                              isDelivered || currentStep >= 0
                                ? "bg-primary text-on-primary"
                                : "bg-surface-container-high text-on-surface-variant"
                            }`}
                          >
                            <Check className="w-6 h-6" />
                          </div>
                          <span className="font-title-md text-title-md text-on-surface font-bold">
                            Aprovado
                          </span>
                          <span className="font-label-sm text-label-sm text-on-surface-variant">
                            {formatPaymentMethod(order.paymentMethod)}
                          </span>
                          <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-tertiary uppercase">
                            <CheckCheck className="w-3.5 h-3.5" /> Recebido
                          </span>
                        </div>

                        {/* Step 2: No Fogão */}
                        <div className="flex flex-col items-center">
                          <div className="relative mb-space-sm">
                            {!isDelivered && currentStep === 1 && (
                              <div className="absolute -inset-2 rounded-full bg-primary/25 animate-ping" />
                            )}
                            <div
                              className={`relative w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all ${
                                isDelivered || currentStep >= 1
                                  ? "bg-primary text-on-primary"
                                  : "bg-surface-container-high text-on-surface-variant"
                              }`}
                            >
                              <CookingPot className="w-6 h-6" />
                            </div>
                          </div>
                          <span
                            className={`font-title-md text-title-md ${
                              !isDelivered && currentStep === 1
                                ? "text-primary font-bold"
                                : "text-on-surface"
                            }`}
                          >
                            No Fogão
                          </span>
                          <span className="font-label-sm text-label-sm text-on-surface-variant">
                            Panelas de ferro
                          </span>
                          {isDelivered || currentStep > 1 ? (
                            <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-tertiary uppercase">
                              <Check className="w-3.5 h-3.5" /> Concluído
                            </span>
                          ) : !isDelivered && currentStep === 1 ? (
                            <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-primary uppercase">
                              Em andamento
                            </span>
                          ) : null}
                        </div>

                        {/* Step 3: Pronto na Bancada */}
                        <div className="flex flex-col items-center">
                          <div className="relative mb-space-sm">
                            {!isDelivered && currentStep === 2 && (
                              <div className="absolute -inset-2 rounded-full bg-primary/25 animate-ping" />
                            )}
                            <div
                              className={`relative w-12 h-12 rounded-full flex items-center justify-center shadow-sm transition-all ${
                                isDelivered || currentStep >= 2
                                  ? "bg-primary text-on-primary"
                                  : "bg-surface-container-high text-on-surface-variant"
                              }`}
                            >
                              <PackageCheck className="w-6 h-6" />
                            </div>
                          </div>
                          <span
                            className={`font-title-md text-title-md ${
                              !isDelivered && currentStep === 2
                                ? "text-primary font-bold"
                                : "text-on-surface"
                            }`}
                          >
                            Pronto
                          </span>
                          <span className="font-label-sm text-label-sm text-on-surface-variant">
                            Embalado quente
                          </span>
                          {isDelivered || currentStep > 2 ? (
                            <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-tertiary uppercase">
                              <Check className="w-3.5 h-3.5" /> Concluído
                            </span>
                          ) : !isDelivered && currentStep === 2 ? (
                            <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-primary uppercase">
                              Em andamento
                            </span>
                          ) : null}
                        </div>

                        {/* Step 4: A Caminho (EM_ROTA) */}
                        <div className="flex flex-col items-center">
                          <div className="relative mb-space-sm">
                            {!isDelivered && currentStep === 3 && (
                              <div className="absolute -inset-2 rounded-full bg-primary/25 animate-ping" />
                            )}
                            <div
                              className={`relative w-12 h-12 rounded-full flex items-center justify-center shadow-sm transition-all ${
                                isDelivered || currentStep >= 3
                                  ? "bg-primary text-on-primary"
                                  : "bg-surface-container-high text-on-surface-variant"
                              }`}
                            >
                              <Bike className="w-6 h-6" />
                            </div>
                          </div>
                          <span
                            className={`font-title-md text-title-md ${
                              !isDelivered && currentStep === 3
                                ? "text-primary font-bold animate-pulse"
                                : "text-on-surface"
                            }`}
                          >
                            A Caminho
                          </span>
                          <span className="font-label-sm text-label-sm text-on-surface-variant">
                            Caixa selada
                          </span>
                          {isDelivered || currentStep > 3 ? (
                            <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-tertiary uppercase">
                              <Check className="w-3.5 h-3.5" /> Concluído
                            </span>
                          ) : !isDelivered && currentStep === 3 ? (
                            <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-primary uppercase">
                              Em andamento
                            </span>
                          ) : null}
                        </div>

                        {/* Step 5: Entregue */}
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm mb-space-sm transition-all ${
                              isDelivered
                                ? "bg-primary text-on-primary"
                                : "bg-surface-container-high text-on-surface-variant"
                            }`}
                          >
                            {isDelivered ? <CheckCheck className="w-6 h-6" /> : <Utensils className="w-6 h-6" />}
                          </div>
                          <span
                            className={`font-title-md text-title-md ${
                              isDelivered
                                ? "text-primary font-bold"
                                : "text-on-surface"
                            }`}
                          >
                            Entregue
                          </span>
                          <span className="font-label-sm text-label-sm text-on-surface-variant">
                            Na sua mesa
                          </span>
                          {isDelivered && (
                            <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-tertiary uppercase">
                              <CheckCheck className="w-3.5 h-3.5" /> Concluído
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="relative z-10 grid grid-cols-4 gap-2 text-center">
                        {/* Step 1: Aprovado */}
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md mb-space-sm transition-all ${
                              isDelivered || currentStep >= 0
                                ? "bg-primary text-on-primary"
                                : "bg-surface-container-high text-on-surface-variant"
                            }`}
                          >
                            <Check className="w-6 h-6" />
                          </div>
                          <span className="font-title-md text-title-md text-on-surface font-bold">
                            Aprovado
                          </span>
                          <span className="font-label-sm text-label-sm text-on-surface-variant">
                            {formatPaymentMethod(order.paymentMethod)}
                          </span>
                          <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-tertiary uppercase">
                            <CheckCheck className="w-3.5 h-3.5" /> Recebido
                          </span>
                        </div>

                        {/* Step 2: No Fogão a Lenha */}
                        <div className="flex flex-col items-center">
                          <div className="relative mb-space-sm">
                            {!isDelivered && currentStep === 1 && (
                              <div className="absolute -inset-2 rounded-full bg-primary/25 animate-ping" />
                            )}
                            <div
                              className={`relative w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all ${
                                isDelivered || currentStep >= 1
                                  ? "bg-primary text-on-primary"
                                  : "bg-surface-container-high text-on-surface-variant"
                              }`}
                            >
                              <CookingPot className="w-6 h-6" />
                            </div>
                          </div>
                          <span
                            className={`font-title-md text-title-md ${
                              !isDelivered && currentStep === 1
                                ? "text-primary font-bold"
                                : "text-on-surface"
                            }`}
                          >
                            No Fogão
                          </span>
                          <span className="font-label-sm text-label-sm text-on-surface-variant">
                            Panelas de ferro
                          </span>
                          {isDelivered || currentStep > 1 ? (
                            <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-tertiary uppercase">
                              <Check className="w-3.5 h-3.5" /> Concluído
                            </span>
                          ) : !isDelivered && currentStep === 1 ? (
                            <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-primary uppercase">
                              Em andamento
                            </span>
                          ) : null}
                        </div>

                        {/* Step 3: Pronto no Balcão */}
                        <div className="flex flex-col items-center">
                          <div className="relative mb-space-sm">
                            {!isDelivered && currentStep === 2 && (
                              <div className="absolute -inset-2 rounded-full bg-primary/25 animate-ping" />
                            )}
                            <div
                              className={`relative w-12 h-12 rounded-full flex items-center justify-center shadow-sm transition-all ${
                                isDelivered || currentStep >= 2
                                  ? "bg-primary text-on-primary"
                                  : "bg-surface-container-high text-on-surface-variant"
                              }`}
                            >
                              <PackageCheck className="w-6 h-6" />
                            </div>
                          </div>
                          <span
                            className={`font-title-md text-title-md ${
                              !isDelivered && currentStep === 2
                                ? "text-primary font-bold"
                                : "text-on-surface"
                            }`}
                          >
                            Pronto no Balcão
                          </span>
                          <span className="font-label-sm text-label-sm text-on-surface-variant">
                            Pode retirar!
                          </span>
                          {isDelivered || currentStep > 2 ? (
                            <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-tertiary uppercase">
                              <Check className="w-3.5 h-3.5" /> Concluído
                            </span>
                          ) : !isDelivered && currentStep === 2 ? (
                            <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-primary uppercase">
                              Em andamento
                            </span>
                          ) : null}
                        </div>

                        {/* Step 4: Retirado */}
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm mb-space-sm transition-all ${
                              isDelivered
                                ? "bg-primary text-on-primary"
                                : "bg-surface-container-high text-on-surface-variant"
                            }`}
                          >
                            {isDelivered ? <CheckCheck className="w-6 h-6" /> : <Utensils className="w-6 h-6" />}
                          </div>
                          <span
                            className={`font-title-md text-title-md ${
                              isDelivered
                                ? "text-primary font-bold"
                                : "text-on-surface"
                            }`}
                          >
                            Retirado
                          </span>
                          <span className="font-label-sm text-label-sm text-on-surface-variant">
                            Retirado no balcão
                          </span>
                          {isDelivered && (
                            <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-tertiary uppercase">
                              <CheckCheck className="w-3.5 h-3.5" /> Concluído
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Vertical Stepper no Celular (≤767px) */}
                  <div className="md:hidden py-2 space-y-4">
                    {(isDelivery
                      ? [
                          {
                            step: 0,
                            title: "Aprovado",
                            desc: `Recebido via ${formatPaymentMethod(order.paymentMethod)}`,
                            icon: Check,
                          },
                          {
                            step: 1,
                            title: "No Fogão a Lenha",
                            desc: "Cozinhando em tachos e panelas de ferro",
                            icon: CookingPot,
                          },
                          {
                            step: 2,
                            title: "Pronto na Bancada",
                            desc: "Marmita artesanal embalada e quentinha",
                            icon: PackageCheck,
                          },
                          {
                            step: 3,
                            title: "A Caminho",
                            desc: "Entregador da comitiva em rota de entrega",
                            icon: Bike,
                          },
                          {
                            step: 4,
                            title: "Entregue",
                            desc: "Bom almoço caipira!",
                            icon: isDelivered ? CheckCheck : Utensils,
                          },
                        ]
                      : [
                          {
                            step: 0,
                            title: "Aprovado",
                            desc: `Recebido via ${formatPaymentMethod(order.paymentMethod)}`,
                            icon: Check,
                          },
                          {
                            step: 1,
                            title: "No Fogão a Lenha",
                            desc: "Cozinhando em panelas de ferro",
                            icon: CookingPot,
                          },
                          {
                            step: 2,
                            title: "Pronto no Balcão",
                            desc: "Pode retirar seu almoço quentinho!",
                            icon: PackageCheck,
                          },
                          {
                            step: 3,
                            title: "Retirado",
                            desc: "Retirado no balcão • Bom apetite!",
                            icon: isDelivered ? CheckCheck : Utensils,
                          },
                        ]
                    ).map((item, idx, arr) => {
                      const Icon = item.icon;
                      const isDone = isDelivered || currentStep > item.step;
                      const isCurrent = !isDelivered && currentStep === item.step;
                      const isLast = idx === arr.length - 1;

                      return (
                        <div key={item.step} className="flex items-start gap-3.5 relative">
                          {/* Linha vertical conectora */}
                          {!isLast && (
                            <div
                              className={`absolute left-5 top-10 bottom-0 w-0.5 -mb-4 transition-colors ${
                                isDone ? "bg-primary" : "bg-surface-container-highest"
                              }`}
                            />
                          )}

                          {/* Ícone da etapa */}
                          <div className="relative shrink-0">
                            {isCurrent && (
                              <div className="absolute -inset-1 rounded-full bg-primary/25 animate-ping" />
                            )}
                            <div
                              className={`relative w-10 h-10 rounded-full flex items-center justify-center shadow-sm transition-all ${
                                isDone || isCurrent
                                  ? "bg-primary text-on-primary"
                                  : "bg-surface-container-high text-on-surface-variant"
                              }`}
                            >
                              <Icon className="w-5 h-5" />
                            </div>
                          </div>

                          {/* Conteúdo textual da etapa */}
                          <div className="flex-1 min-w-0 pt-0.5 pb-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`text-base font-bold leading-tight ${
                                  isCurrent
                                    ? "text-primary"
                                    : isDone
                                    ? "text-on-surface"
                                    : "text-on-surface-variant"
                                }`}
                              >
                                {item.title}
                              </span>
                              {isCurrent && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary">
                                  Em andamento
                                </span>
                              )}
                              {isDone && (
                                <span className="text-tertiary text-xs font-semibold flex items-center gap-0.5">
                                  <Check className="w-3.5 h-3.5" /> Concluído
                                </span>
                              )}
                            </div>
                            <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
                              {item.desc}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Two-Column Master Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-lg items-start">
                  {/* Coluna 1: Itens, Endereço e Valores */}
                  <div className="lg:col-span-7 space-y-space-md">
                    {/* Itens do Pedido */}
                    <div className="bg-surface-container-lowest rounded-3xl shadow-md p-space-lg border border-outline-variant/30">
                      <div className="flex items-center justify-between pb-space-sm mb-space-md border-b border-outline-variant/10">
                        <div className="flex items-center gap-space-xs">
                          <Receipt className="w-5 h-5 text-primary" />
                          <h3 className="font-headline-sm text-headline-sm text-on-surface">
                            Itens Selecionados
                          </h3>
                        </div>
                        <span className="font-label-md text-label-md bg-surface-container px-3 py-1 rounded-full text-on-surface-variant font-bold">
                          {order.items.length} item(ns)
                        </span>
                      </div>

                      <div className="space-y-space-md">
                        {order.items.map((item) => {
                          let sides: string[] = [];
                          let addons: { name: string; price: number }[] = [];
                          try {
                            if (item.sidesSelected) sides = JSON.parse(item.sidesSelected);
                            if (item.sideAddons) addons = JSON.parse(item.sideAddons);
                          } catch {
                            // ignora
                          }

                          return (
                            <div
                              key={item.id}
                              className="flex items-start gap-space-md p-space-sm rounded-2xl hover:bg-surface-container transition-colors"
                            >
                              <div className="w-16 h-16 rounded-xl bg-surface-container-high overflow-hidden shrink-0">
                                <SafeImage
                                  src={item.product?.imageUrl || "/images/pratos/costela_fogo_chao.jpg"}
                                  alt={item.productName}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-space-xs">
                                  <h4 className="font-title-md text-title-md text-on-surface truncate">
                                    {item.quantity}x {item.productName}
                                  </h4>
                                  <span className="font-title-md text-title-md text-primary font-bold shrink-0">
                                    {formatCurrency(item.totalPrice)}
                                  </span>
                                </div>
                                <span className="font-label-sm text-label-sm bg-primary-fixed text-on-primary-fixed px-2 py-0.5 rounded-md font-semibold inline-block mt-1">
                                  Tamanho {item.sizeName}
                                </span>
                                {sides.length > 0 && (
                                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                                    Guarnições: {sides.join(", ")}
                                  </p>
                                )}
                                {addons.length > 0 && (
                                  <p className="font-body-sm text-body-sm text-secondary mt-0.5">
                                    Adicionais: {addons.map((a) => a.name).join(", ")}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Total Financeiro */}
                      <div className="mt-space-md p-space-md rounded-2xl bg-surface-container space-y-space-xs border border-outline-variant/20">
                        <div className="flex justify-between font-body-md text-body-md text-on-surface-variant">
                          <span>Subtotal dos itens</span>
                          <span>{formatCurrency(order.subtotal)}</span>
                        </div>
                        {order.discount > 0 && (
                          <div className="flex justify-between font-body-md text-body-md text-primary">
                            <span>Desconto de Cupom</span>
                            <span>- {formatCurrency(order.discount)}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-body-md text-body-md text-on-surface-variant">
                          <span>Taxa de Entrega (Jaborandi - SP)</span>
                          <span>
                            {order.deliveryFee === 0 ? (
                              <strong className="text-tertiary">GRÁTIS</strong>
                            ) : (
                              formatCurrency(order.deliveryFee)
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between items-center pt-space-xs text-on-surface border-t border-outline-variant/20">
                          <span className="font-title-md text-title-md">Valor Total Pago</span>
                          <div className="text-right">
                            <span className="font-headline-sm text-headline-sm text-primary font-bold">
                              {formatCurrency(order.total)}
                            </span>
                            <span className="block font-label-sm text-label-sm text-on-surface-variant font-bold">
                              {formatPaymentMethod(order.paymentMethod)} • Confirmado
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Local de Entrega */}
                    {order.deliveryType === "ENTREGA" && (
                      <div className="bg-surface-container-lowest rounded-3xl shadow-md p-space-lg flex items-start gap-space-md border border-outline-variant/30">
                        <div className="w-12 h-12 rounded-2xl bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center shrink-0 shadow-sm">
                          <MapPin className="w-6 h-6" />
                        </div>
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-title-md text-title-md text-on-surface">
                              Endereço de Entrega
                            </h3>
                            <span className="bg-surface-container text-on-surface font-label-sm text-label-sm px-2.5 py-0.5 rounded-full font-bold">
                              Jaborandi - SP
                            </span>
                          </div>
                          <p className="font-body-md text-body-md text-on-surface font-semibold">
                            {order.addressStreet}
                            {order.addressNumber ? `, ${order.addressNumber}` : ""}
                          </p>
                          {order.neighborhood && (
                            <p className="font-body-sm text-body-sm text-on-surface-variant">
                              Bairro {order.neighborhood}
                              {order.complement ? ` • ${order.complement}` : ""}
                            </p>
                          )}
                          {order.reference && (
                            <p className="font-body-sm text-body-sm text-secondary italic">
                              Referência: {order.reference}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Coluna 2: Entregador e Garantia Térmica */}
                  <div className="lg:col-span-5 space-y-space-md">
                    {/* Card Entregador */}
                    <div className="bg-surface-container-lowest rounded-3xl shadow-md p-space-lg border border-outline-variant/30">
                      <div className="flex items-center justify-between pb-space-sm mb-space-md border-b border-outline-variant/10">
                        <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-bold">
                          Entregador da Comitiva
                        </span>
                        <span className="inline-flex items-center gap-1 font-label-sm text-label-sm bg-tertiary-fixed text-on-tertiary-fixed px-2 py-0.5 rounded font-bold">
                          <Star className="w-3.5 h-3.5 text-tertiary" /> 4.9 (1.240 entregas)
                        </span>
                      </div>

                      <div className="flex items-center gap-space-md mb-space-md">
                        <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary shrink-0">
                          <Bike className="w-8 h-8" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-headline-sm text-headline-sm text-on-surface truncate">
                            Zé da Horta
                          </h4>
                          <p className="font-body-sm text-body-sm text-on-surface-variant">
                            Motoqueiro Oficial da Comitiva
                          </p>
                          <span className="font-label-sm text-label-sm text-primary font-bold flex items-center gap-1 mt-0.5">
                            <Bike className="w-3.5 h-3.5" />
                            Honda CG 160 • Jaborandi
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-space-sm">
                        <a
                          href="https://wa.me/5517997425580"
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-center gap-space-xs py-2.5 px-3 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface transition-colors font-label-md text-label-md font-bold shadow-sm"
                        >
                          <MessageSquare className="w-4 h-4 text-primary" />
                          <span>Msg Zé</span>
                        </a>
                        <a
                          href="tel:17997425580"
                          className="flex items-center justify-center gap-space-xs py-2.5 px-3 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface transition-colors font-label-md text-label-md font-bold shadow-sm cursor-pointer"
                        >
                          <Phone className="w-4 h-4 text-tertiary" />
                          <span>Ligar Cozinha</span>
                        </a>
                      </div>
                    </div>

                    {/* Garantia Térmica */}
                    <div className="bg-primary text-on-primary rounded-3xl shadow-md p-space-lg relative overflow-hidden">
                      <div className="relative z-10 flex items-start gap-space-md">
                        <div className="w-12 h-12 rounded-2xl bg-on-primary/20 backdrop-blur-sm flex items-center justify-center shrink-0">
                          <Thermometer className="w-7 h-7 text-tertiary-fixed-dim" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-title-md text-title-md text-on-primary">
                            Garantia Comitiva: Chega Pelando!
                          </h4>
                          <p className="font-body-sm text-body-sm text-on-primary-container leading-relaxed">
                            Sua marmita é selada hermeticamente em embalagem térmica multicamadas antes de sair do fogão a lenha. Comida quente na sua mesa!
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Selo Fidelidade */}
                    <div className="bg-surface-container-lowest rounded-3xl shadow-md p-space-lg border border-outline-variant/30 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-space-xs">
                          <Award className="w-5 h-5 text-tertiary" />
                          <span className="font-title-md text-title-md text-on-surface font-bold">
                            Pontos Deste Pedido
                          </span>
                        </div>
                        <span className="font-label-sm text-label-sm text-primary font-bold">
                          +{order.pointsEarned} Pontos
                        </span>
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Os pontos serão creditados automaticamente na sua carteira assim que o pedido for marcado como <strong>Entregue</strong>.
                      </p>
                    </div>

                    {/* Ações */}
                    <div className="space-y-space-sm pt-2">
                      <Link
                        href="/"
                        className="w-full flex items-center justify-center gap-space-xs py-3 px-4 rounded-xl bg-surface-container-lowest hover:bg-surface-container text-on-surface transition-colors font-label-md text-label-md font-bold shadow-sm border border-outline-variant/30"
                      >
                        <UtensilsCrossed className="w-4 h-4 text-primary" />
                        <span>Voltar ao Cardápio</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
