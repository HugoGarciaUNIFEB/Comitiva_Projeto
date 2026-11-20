"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SafeImage from "@/components/SafeImage";
import { useCartStore } from "@/lib/store/useCartStore";
import {
  Check,
  Truck,
  CookingPot,
  Home,
  Flame,
  ShieldCheck,
  MapPin,
  Bike,
  Store,
  Signpost,
  ChevronDown,
  Zap,
  ArrowRightLeft,
  CreditCard,
  Banknote,
  RefreshCw,
  Clock,
  Copy,
  CheckCircle2,
  Dices,
  Award,
  UtensilsCrossed,
  AlertCircle,
  X,
} from "lucide-react";

interface SavedAddress {
  id: string;
  street: string;
  number: string;
  neighborhood: string;
  reference?: string;
  isDefault: boolean;
}

export default function CheckoutPage() {
  const router = useRouter();
  const {
    items,
    getSubtotal,
    getDiscount,
    getEffectiveDeliveryFee,
    getTotal,
    getEstimatedPoints,
    deliveryType,
    setDeliveryType,
    coupon,
    applyCoupon,
    removeCoupon,
    clearCart,
  } = useCartStore();

  // Estados do formulário de entrega
  const [street, setStreet] = useState("Rua Quinze de Novembro");
  const [number, setNumber] = useState("382");
  const [neighborhood, setNeighborhood] = useState("Centro Histórico");
  const [reference, setReference] = useState("Próximo à Praça da Matriz");
  const [recipient, setRecipient] = useState("Tiago Silveira");
  const [phone, setPhone] = useState("(17) 99812-4421");

  // Endereços salvos do usuário
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");

  // Pagamento
  const [paymentMethod, setPaymentMethod] = useState<"PIX" | "CARD" | "CASH">("PIX");
  const [isPixSimulatedPaid, setIsPixSimulatedPaid] = useState(false);
  const [pixQrDataUrl, setPixQrDataUrl] = useState<string>("");
  const [changeFor, setChangeFor] = useState("");
  const [noChangeNeeded, setNoChangeNeeded] = useState(false);

  // Cupom
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  // Estado de envio e modal de sucesso
  const [loading, setLoading] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<{ id: string; orderNumber: number } | null>(
    null
  );
  const [copiedPix, setCopiedPix] = useState(false);

  // Código Pix Copia e Cola simulado padrão BACEN
  const pixCode =
    "00020126580014br.gov.bcb.pix0136comitivafogodechao@jaborandi.com5204000053039865405" +
    getTotal().toFixed(2) +
    "5802BR5922COMITIVA FOGO DE CHAO6009JABORANDI62070503***6304D1A4";

  // Gera o QR Code real com a biblioteca qrcode
  useEffect(() => {
    QRCode.toDataURL(pixCode, {
      width: 200,
      margin: 1,
      color: { dark: "#A73400", light: "#FCF9F3" },
    })
      .then((url) => setPixQrDataUrl(url))
      .catch((err) => console.error("Erro gerando QRCode:", err));
  }, [getTotal()]);

  // Carrega dados do usuário e endereços
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.authenticated && data.user) {
          setRecipient(data.user.name);
          setPhone(data.user.whatsapp);
        }
      });

    fetch("/api/user/addresses")
      .then((res) => (res.ok ? res.json() : []))
      .then((list: SavedAddress[]) => {
        if (Array.isArray(list) && list.length > 0) {
          setSavedAddresses(list);
          const def = list.find((a) => a.isDefault) || list[0];
          setSelectedAddressId(def.id);
          setStreet(def.street);
          setNumber(def.number);
          setNeighborhood(def.neighborhood);
          if (def.reference) setReference(def.reference);
        }
      });
  }, []);

  const handleSelectSavedAddress = (addr: SavedAddress) => {
    setSelectedAddressId(addr.id);
    setStreet(addr.street);
    setNumber(addr.number);
    setNeighborhood(addr.neighborhood);
    if (addr.reference) setReference(addr.reference);
  };

  const currentTotal = getTotal();
  const parsedChange = parseFloat(changeFor.replace(",", "."));
  const isChangeInvalid =
    paymentMethod === "CASH" &&
    !noChangeNeeded &&
    (changeFor.trim() === "" || isNaN(parsedChange) || parsedChange < currentTotal);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setCouponError("");
    setApplyingCoupon(true);

    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput }),
      });
      const data = await res.json();

      if (!res.ok) {
        setCouponError(data.error || "Cupom inválido.");
        setApplyingCoupon(false);
        return;
      }

      applyCoupon(data.coupon);
      setCouponInput("");
    } catch {
      setCouponError("Erro ao validar cupom.");
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixCode);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 3000);
  };

  const handleFinalizeOrder = async () => {
    if (items.length === 0) {
      alert("Sua sacola está vazia!");
      return;
    }

    if (isChangeInvalid) {
      alert(
        `Por favor, informe um valor válido para troco maior ou igual a R$ ${currentTotal.toFixed(2).replace(".", ",")}, ou selecione 'Não preciso de troco'.`
      );
      return;
    }

    setLoading(true);

    const fullAddress =
      deliveryType === "DELIVERY"
        ? `${street}, ${number} - ${neighborhood}${reference ? ` (Ref: ${reference})` : ""}`
        : "Retirada no Balcão da Comitiva (Jaborandi - SP)";

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: recipient,
          customerPhone: phone,
          orderType: deliveryType,
          paymentMethod,
          paymentStatus: paymentMethod === "PIX" && isPixSimulatedPaid ? "PAID" : "PENDING",
          changeFor: noChangeNeeded ? null : changeFor ? parseFloat(changeFor) : null,
          deliveryAddress: fullAddress,
          couponCode: coupon?.code || null,
          items,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Erro ao processar pedido.");
        setLoading(false);
        return;
      }

      clearCart();
      setCreatedOrder(data.order);
    } catch (e) {
      console.error(e);
      alert("Erro ao enviar pedido. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background font-body-md text-on-surface">
      <Header />

      <main className="w-full pt-24 sm:pt-28 pb-28 lg:pb-16 flex-1 overflow-x-hidden">
        {/* Barra de Progresso do Pedido */}
        <section className="w-full bg-surface-container-low py-space-md mb-space-lg shadow-sm border-b border-outline-variant/20">
          <div className="max-w-7xl mx-auto px-margin-lg">
            <div className="flex items-center justify-between gap-space-md">
              {/* Etapa 1 */}
              <div className="flex items-center gap-space-sm">
                <div className="w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-sm">
                  <Check className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                    Etapa 1
                  </span>
                  <span className="font-label-lg text-label-lg text-on-surface font-bold">
                    Sacola Escolhida
                  </span>
                </div>
              </div>

              <div className="flex-1 h-1 bg-primary rounded-full mx-space-sm hidden sm:block"></div>

              {/* Etapa 2: Ativa */}
              <div className="flex items-center gap-space-sm">
                <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container ring-4 ring-primary-fixed-dim/40 flex items-center justify-center shadow-md animate-pulse">
                  <Truck className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm text-primary font-bold uppercase tracking-wider">
                    Etapa Atual
                  </span>
                  <span className="font-label-lg text-label-lg text-primary font-bold">
                    Entrega &amp; Pagamento
                  </span>
                </div>
              </div>

              <div className="flex-1 h-1 bg-surface-container-highest rounded-full mx-space-sm hidden sm:block"></div>

              {/* Etapa 3 */}
              <div className="flex items-center gap-space-sm opacity-60">
                <div className="w-7 h-7 rounded-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center">
                  <CookingPot className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                    Etapa 3
                  </span>
                  <span className="font-label-lg text-label-lg text-on-surface">
                    No Fogão a Lenha
                  </span>
                </div>
              </div>

              <div className="flex-1 h-1 bg-surface-container-highest rounded-full mx-space-sm hidden sm:block"></div>

              {/* Etapa 4 */}
              <div className="flex items-center gap-space-sm opacity-60">
                <div className="w-7 h-7 rounded-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center">
                  <Home className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                    Etapa 4
                  </span>
                  <span className="font-label-lg text-label-lg text-on-surface">
                    Entregue Quentinho
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Checkout Grid Container */}
        <div className="max-w-7xl mx-auto px-margin-lg w-full mb-space-xl">
          {/* Context Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-space-lg gap-space-sm">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Flame className="w-5 h-5 text-tertiary" />
                <span className="font-label-sm text-label-sm text-tertiary uppercase tracking-widest font-bold">
                  Finalização de Pedido Caipira
                </span>
              </div>
              <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight font-serif">
                Checkout Rápido &amp; Seguro
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Sua comida caseira preparada com lenha selecionada na Comitiva Fogo de Chão.
              </p>
            </div>

            <div className="flex items-center gap-space-xs bg-surface-container-high px-space-md py-space-xs rounded-full border border-outline-variant/30">
              <ShieldCheck className="w-4 h-4 text-tertiary-container" />
              <span className="font-label-sm text-label-sm text-on-surface font-semibold">
                Ambiente Seguro • Confirmação Imediata
              </span>
            </div>
          </div>

          {/* 2 Equal/Balanced Desktop Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-lg items-start">
            {/* LEFT COLUMN: Dados de Entrega & Pagamento */}
            <div className="lg:col-span-7 flex flex-col gap-space-lg">
              {/* ETAPA 1: ONDE VOCÊ VAI SABOREAR? */}
              <div className="bg-surface-container-lowest rounded-xl shadow-md p-space-lg border border-outline-variant/30">
                <div className="flex items-center justify-between mb-space-md pb-space-sm border-b border-outline-variant/20">
                  <div className="flex items-center gap-space-sm">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold font-title-md">
                      1
                    </div>
                    <div>
                      <h2 className="font-title-md text-title-md text-on-surface font-serif font-bold">
                        Onde você vai saborear?
                      </h2>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        Entregas exclusivas no perímetro urbano de Jaborandi - SP
                      </span>
                    </div>
                  </div>
                  <MapPin className="w-6 h-6 text-primary" />
                </div>

                {/* Seletor: Entrega em Casa vs Retirada no Balcão */}
                <div className="grid grid-cols-2 gap-space-sm mb-space-md bg-surface-container-low p-1.5 rounded-xl border border-outline-variant/20">
                  <button
                    type="button"
                    onClick={() => setDeliveryType("DELIVERY")}
                    className={`flex items-center justify-center gap-space-xs py-3 px-4 rounded-lg font-label-lg text-label-lg transition-all ${
                      deliveryType === "DELIVERY"
                        ? "bg-primary text-on-primary font-bold shadow-sm"
                        : "bg-transparent text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    <Bike className="w-5 h-5" />
                    <span>Entrega em Casa</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryType("PICKUP")}
                    className={`flex items-center justify-center gap-space-xs py-3 px-4 rounded-lg font-label-lg text-label-lg transition-all ${
                      deliveryType === "PICKUP"
                        ? "bg-primary text-on-primary font-bold shadow-sm"
                        : "bg-transparent text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    <Store className="w-5 h-5" />
                    <span>Retirada no Balcão</span>
                  </button>
                </div>

                {/* Informação de Retirada */}
                {deliveryType === "PICKUP" ? (
                  <div className="p-space-md bg-tertiary-fixed/20 rounded-xl space-y-2 border border-tertiary-fixed">
                    <div className="flex items-center gap-2 text-on-tertiary-fixed">
                      <Store className="w-5 h-5 text-tertiary" />
                      <span className="font-label-lg text-label-lg font-bold">
                        Endereço da Comitiva para Retirada
                      </span>
                    </div>
                    <p className="font-body-md text-body-md text-on-surface-variant">
                      Rua Marechal Deodoro, 145 - Centro, Jaborandi - SP. Seu almoço estará
                      embalado em folha térmica a partir das <strong>11h45 pontual</strong>. Taxa
                      de entrega: <strong>Grátis</strong>.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-space-md">
                    {/* Endereços Salvos se houver */}
                    {savedAddresses.length > 0 && (
                      <div className="space-y-2">
                        <label className="block font-label-md text-on-surface font-semibold">
                          Seus Endereços Salvos
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {savedAddresses.map((addr) => (
                            <button
                              key={addr.id}
                              type="button"
                              onClick={() => handleSelectSavedAddress(addr)}
                              className={`p-3 rounded-lg text-left border transition-all text-sm ${
                                selectedAddressId === addr.id
                                  ? "border-primary bg-primary/5 font-bold"
                                  : "border-outline-variant/30 bg-surface hover:bg-surface-container"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-on-surface">
                                  {addr.street}, {addr.number}
                                </span>
                                {addr.isDefault && (
                                  <span className="text-[10px] bg-primary text-on-primary px-1.5 py-0.5 rounded">
                                    Principal
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-on-surface-variant mt-0.5">
                                {addr.neighborhood}
                              </p>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Formulário Manual */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md">
                      <div className="sm:col-span-2">
                        <label className="block font-label-md text-label-md text-on-surface mb-1 font-semibold">
                          Rua / Avenida *
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={street}
                            onChange={(e) => setStreet(e.target.value)}
                            required
                            className="w-full h-11 px-3.5 pl-10 rounded-lg bg-surface text-on-surface font-body-md border border-outline-variant/40 focus:border-primary outline-none"
                          />
                          <Signpost className="w-5 h-5 absolute left-3 top-2.5 text-on-surface-variant" />
                        </div>
                      </div>

                      <div>
                        <label className="block font-label-md text-label-md text-on-surface mb-1 font-semibold">
                          Número *
                        </label>
                        <input
                          type="text"
                          value={number}
                          onChange={(e) => setNumber(e.target.value)}
                          required
                          className="w-full h-11 px-3.5 rounded-lg bg-surface text-on-surface font-body-md border border-outline-variant/40 focus:border-primary outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                      <div>
                        <label className="block font-label-md text-label-md text-on-surface mb-1 font-semibold">
                          Bairro em Jaborandi *
                        </label>
                        <div className="relative">
                          <select
                            value={neighborhood}
                            onChange={(e) => setNeighborhood(e.target.value)}
                            className="w-full h-11 px-3.5 rounded-lg bg-surface text-on-surface font-body-md border border-outline-variant/40 focus:border-primary outline-none appearance-none pr-10"
                          >
                            <option value="Centro Histórico">Centro Histórico</option>
                            <option value="Cohab">Conjunto Habitacional (Cohab)</option>
                            <option value="São Sebastião">São Sebastião</option>
                            <option value="Jardim América">Jardim América</option>
                            <option value="Recanto dos Pássaros">Recanto dos Pássaros</option>
                          </select>
                          <ChevronDown className="w-5 h-5 absolute right-3 top-3 text-on-surface-variant pointer-events-none" />
                        </div>
                      </div>

                      <div>
                        <label className="block font-label-md text-label-md text-on-surface mb-1 font-semibold">
                          Ponto de Referência
                        </label>
                        <input
                          type="text"
                          value={reference}
                          onChange={(e) => setReference(e.target.value)}
                          placeholder="Ex: Próximo à Praça da Matriz"
                          className="w-full h-11 px-3.5 rounded-lg bg-surface text-on-surface font-body-md border border-outline-variant/40 focus:border-primary outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-label-md text-label-md text-on-surface mb-1 font-semibold">
                        Nome de Quem Vai Receber • WhatsApp
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                        <input
                          type="text"
                          value={recipient}
                          onChange={(e) => setRecipient(e.target.value)}
                          placeholder="Nome completo"
                          required
                          className="w-full h-11 px-3.5 rounded-lg bg-surface text-on-surface font-body-md border border-outline-variant/40 focus:border-primary outline-none"
                        />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="(17) 99999-9999"
                          required
                          className="w-full h-11 px-3.5 rounded-lg bg-surface text-on-surface font-body-md border border-outline-variant/40 focus:border-primary outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ETAPA 2: FORMA DE PAGAMENTO COM PIX SIMULADO */}
              <div className="bg-surface-container-lowest rounded-xl shadow-md p-space-lg border border-outline-variant/30">
                <div className="flex items-center justify-between mb-space-md pb-space-sm border-b border-outline-variant/20">
                  <div className="flex items-center gap-space-sm">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold font-title-md">
                      2
                    </div>
                    <div>
                      <h2 className="font-title-md text-title-md text-on-surface font-serif font-bold">
                        Forma de Pagamento Digital
                      </h2>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        Escolha com rapidez e garanta o desconto do fogão
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-tertiary/15 text-tertiary px-2.5 py-1 rounded-full font-label-sm text-label-sm font-bold">
                    <Zap className="w-4 h-4" />
                    <span>Liberação Imediata</span>
                  </div>
                </div>

                {/* Opções de Pagamento */}
                <div className="space-y-space-sm mb-space-md">
                  {/* PIX */}
                  <label
                    onClick={() => setPaymentMethod("PIX")}
                    className={`relative flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-space-md rounded-xl cursor-pointer transition-all border gap-2.5 sm:gap-space-sm ${
                      paymentMethod === "PIX"
                        ? "bg-surface-container border-primary shadow-sm"
                        : "bg-surface-container-low border-transparent hover:bg-surface-container"
                    }`}
                  >
                    <div className="flex items-start gap-space-sm flex-1 min-w-0">
                      <input
                        type="radio"
                        name="payment_method"
                        checked={paymentMethod === "PIX"}
                        onChange={() => setPaymentMethod("PIX")}
                        className="w-4 h-4 text-primary focus:ring-0 mt-1 shrink-0 cursor-pointer"
                      />
                      <div className="flex items-start gap-2.5 flex-1 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-tertiary text-on-tertiary flex items-center justify-center shadow-xs shrink-0 mt-0.5">
                          <ArrowRightLeft className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="font-label-lg text-label-lg text-on-surface block font-bold leading-snug">
                            PIX Instantâneo com Baixa Automática
                          </span>
                          <span className="font-body-sm text-body-sm text-on-surface-variant block mt-0.5 leading-snug">
                            Confirmação em tempo real com QR Code e Copia e Cola
                          </span>
                          {/* Selo no mobile (abaixo do título, ocupando a linha inteira) */}
                          <div className="mt-1.5 sm:hidden">
                            <span className="bg-tertiary text-on-tertiary px-2.5 py-0.5 rounded-full font-label-sm font-bold uppercase tracking-wider text-[11px] inline-block">
                              Recomendado
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Selo no desktop (ao lado) */}
                    <span className="hidden sm:inline-block bg-tertiary text-on-tertiary px-2.5 py-1 rounded-full font-label-sm font-bold uppercase tracking-wider text-xs shrink-0 ml-2">
                      Recomendado
                    </span>
                  </label>

                  {/* CARTÃO */}
                  <label
                    onClick={() => setPaymentMethod("CARD")}
                    className={`relative flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-space-md rounded-xl cursor-pointer transition-all border gap-2.5 sm:gap-space-sm ${
                      paymentMethod === "CARD"
                        ? "bg-surface-container border-primary shadow-sm"
                        : "bg-surface-container-low border-transparent hover:bg-surface-container"
                    }`}
                  >
                    <div className="flex items-start gap-space-sm flex-1 min-w-0">
                      <input
                        type="radio"
                        name="payment_method"
                        checked={paymentMethod === "CARD"}
                        onChange={() => setPaymentMethod("CARD")}
                        className="w-4 h-4 text-primary focus:ring-0 mt-1 shrink-0 cursor-pointer"
                      />
                      <div className="flex items-start gap-2.5 flex-1 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-surface-container-high text-on-surface flex items-center justify-center shrink-0 mt-0.5">
                          <CreditCard className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="font-label-lg text-label-lg text-on-surface block font-bold leading-snug">
                            Cartão de Crédito ou Débito na Entrega
                          </span>
                          <span className="font-body-sm text-body-sm text-on-surface-variant block mt-0.5 leading-snug">
                            Levamos a maquininha sem fio até o seu portão
                          </span>
                          {/* Selo no mobile (abaixo do título, ocupando a linha inteira) */}
                          <div className="mt-1.5 sm:hidden">
                            <span className="font-label-sm text-on-surface-variant text-xs font-semibold block">
                              Visa • Master • Elo
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Selo no desktop (ao lado) */}
                    <span className="hidden sm:inline-block font-label-sm text-on-surface-variant text-xs shrink-0 ml-2">
                      Visa • Master • Elo
                    </span>
                  </label>

                  {/* DINHEIRO */}
                  <label
                    onClick={() => setPaymentMethod("CASH")}
                    className={`relative flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-space-md rounded-xl cursor-pointer transition-all border gap-2.5 sm:gap-space-sm ${
                      paymentMethod === "CASH"
                        ? "bg-surface-container border-primary shadow-sm"
                        : "bg-surface-container-low border-transparent hover:bg-surface-container"
                    }`}
                  >
                    <div className="flex items-start gap-space-sm flex-1 min-w-0">
                      <input
                        type="radio"
                        name="payment_method"
                        checked={paymentMethod === "CASH"}
                        onChange={() => setPaymentMethod("CASH")}
                        className="w-4 h-4 text-primary focus:ring-0 mt-1 shrink-0 cursor-pointer"
                      />
                      <div className="flex items-start gap-2.5 flex-1 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-surface-container-high text-on-surface flex items-center justify-center shrink-0 mt-0.5">
                          <Banknote className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="font-label-lg text-label-lg text-on-surface block font-bold leading-snug">
                            Dinheiro Físico
                          </span>
                          <span className="font-body-sm text-body-sm text-on-surface-variant block mt-0.5 leading-snug">
                            Pagamento em cédulas no ato do recebimento
                          </span>
                          {/* Selo no mobile (abaixo do título, ocupando a linha inteira) */}
                          <div className="mt-1.5 sm:hidden">
                            <span className="font-label-sm text-on-surface-variant text-xs font-semibold block">
                              Com Troco
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Selo no desktop (ao lado) */}
                    <span className="hidden sm:inline-block font-label-sm text-on-surface-variant text-xs shrink-0 ml-2">
                      Com Troco
                    </span>
                  </label>
                </div>

                {/* Box Específico do PIX */}
                {paymentMethod === "PIX" && (
                  <div className="bg-surface-container-low rounded-xl p-space-md shadow-inner space-y-space-md border border-outline-variant/30">
                    <div className="flex flex-col sm:flex-row items-center gap-space-md">
                      {/* Imagem do QR Code Dinâmico */}
                      <div className="bg-surface-container-lowest p-3 rounded-xl shadow-md shrink-0 text-center border border-outline-variant/30">
                        {pixQrDataUrl ? (
                          <img
                            src={pixQrDataUrl}
                            alt="QR Code PIX Simulado"
                            className="w-36 h-36 mx-auto rounded-lg"
                          />
                        ) : (
                          <div className="w-36 h-36 flex items-center justify-center bg-surface-container">
                            <RefreshCw className="w-6 h-6 animate-spin text-primary" />
                          </div>
                        )}
                        <div className="mt-1 flex items-center justify-center gap-1 text-primary font-bold text-[11px] font-label-sm">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Expira em 15:00</span>
                        </div>
                      </div>

                      {/* Instruções do PIX */}
                      <div className="flex-1 space-y-space-sm w-full">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center font-bold text-[11px]">
                              1
                            </span>
                            <p className="font-body-sm text-on-surface font-semibold">
                              Aponte a câmera do seu app de banco para o QR Code acima.
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center font-bold text-[11px]">
                              2
                            </span>
                            <p className="font-body-sm text-on-surface font-semibold">
                              Ou copie o código Copia e Cola abaixo.
                            </p>
                          </div>
                        </div>

                        {/* Copia e Cola Input */}
                        <div className="bg-surface-container-lowest p-2 rounded-xl flex items-center gap-2 shadow-xs border border-outline-variant/20">
                          <input
                            type="text"
                            readOnly
                            value={pixCode}
                            className="w-full text-[12px] font-mono text-on-surface-variant bg-transparent truncate px-2 outline-none select-all"
                          />
                          <button
                            type="button"
                            onClick={handleCopyPix}
                            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md text-xs font-bold transition-all"
                          >
                            {copiedPix ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                            <span>{copiedPix ? "Copiado!" : "Copiar"}</span>
                          </button>
                        </div>

                        {/* Botão de Simulação de Pagamento */}
                        <div className="pt-1">
                          <button
                            type="button"
                            onClick={() => setIsPixSimulatedPaid(true)}
                            className={`w-full py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                              isPixSimulatedPaid
                                ? "bg-tertiary text-on-tertiary"
                                : "bg-surface-container-highest hover:bg-primary/20 text-primary border border-primary/40"
                            }`}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>
                              {isPixSimulatedPaid
                                ? "Pagamento PIX Confirmado!"
                                : "Confirmar Pagamento PIX"}
                            </span>
                          </button>
                          <p className="text-[10px] text-on-surface-variant mt-1 text-center">
                            * Após pagar via chave aleatória ou QR Code acima, confirme aqui.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Box de Dinheiro com Troco */}
                {paymentMethod === "CASH" && (
                  <div className="bg-surface-container-low rounded-xl p-space-md space-y-space-sm mt-space-sm border border-outline-variant/20">
                    <div className="flex items-center justify-between">
                      <span className="font-label-lg font-bold text-on-surface">
                        Precisa de troco para quanto?
                      </span>
                      <span className="font-body-sm text-on-surface-variant">
                        Valor total: R$ {currentTotal.toFixed(2).replace(".", ",")}
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-space-sm">
                      <div className="relative w-44">
                        <span className="absolute left-3 top-2.5 font-bold text-on-surface-variant">
                          R$
                        </span>
                        <input
                          type="text"
                          disabled={noChangeNeeded}
                          value={changeFor}
                          onChange={(e) => setChangeFor(e.target.value)}
                          placeholder={`Ex: ${(Math.ceil(currentTotal / 10) * 10 || 50).toFixed(0)},00`}
                          className={`w-full h-11 pl-9 pr-3 rounded-lg bg-surface text-on-surface font-body-md border outline-none disabled:opacity-40 ${
                            isChangeInvalid && !noChangeNeeded && changeFor.trim() !== ""
                              ? "border-error focus:ring-1 focus:ring-error"
                              : "border-outline-variant/40 focus:border-primary"
                          }`}
                        />
                      </div>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={noChangeNeeded}
                          onChange={(e) => setNoChangeNeeded(e.target.checked)}
                          className="w-4 h-4 rounded text-primary focus:ring-0"
                        />
                        <span className="font-body-sm text-on-surface font-medium">
                          Não preciso de troco (valor exato)
                        </span>
                      </label>
                    </div>

                    {!noChangeNeeded && isChangeInvalid && (
                      <p className="text-xs text-error font-semibold flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {changeFor.trim() === ""
                          ? "Informe o valor em dinheiro para troco ou marque 'Não preciso de troco'."
                          : `O valor para troco deve ser maior ou igual ao total do pedido (mínimo R$ ${currentTotal.toFixed(2).replace(".", ",")}).`}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: Resumo do Almoço e Cupons */}
            <div className="lg:col-span-5 flex flex-col gap-space-md sticky top-28">
              {/* Sacola Resumo Card */}
              <div className="bg-surface-container-lowest rounded-xl shadow-md overflow-hidden border border-outline-variant/30">
                <div className="bg-surface-container px-space-lg py-space-md flex items-center justify-between border-b border-outline-variant/20">
                  <div className="flex items-center gap-2">
                    <UtensilsCrossed className="w-5 h-5 text-primary" />
                    <h2 className="font-title-md text-title-md text-on-surface font-serif font-bold">
                      Resumo do Almoço
                    </h2>
                  </div>
                  <span className="bg-primary text-on-primary font-label-sm px-2.5 py-0.5 rounded-full font-bold">
                    {items.length} {items.length === 1 ? "Item" : "Itens"}
                  </span>
                </div>

                <div className="p-space-lg space-y-space-md">
                  {/* Lista de itens */}
                  <div className="space-y-space-sm max-h-72 overflow-y-auto pr-1">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex gap-space-sm items-start pb-space-sm border-b border-outline-variant/20 last:border-b-0"
                      >
                        <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 shadow-xs">
                          <SafeImage
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-label-lg font-bold text-on-surface text-sm leading-snug line-clamp-2 break-words flex-1 min-w-0">
                              {item.quantity}x {item.name}
                            </h3>
                            <span className="font-label-lg font-bold text-on-surface text-sm whitespace-nowrap shrink-0 text-right">
                              R$ {(item.unitPrice * item.quantity).toFixed(2).replace(".", ",")}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5 mt-1">
                            {item.size !== "UNICO" && (
                              <span className="bg-primary-fixed text-on-primary-fixed text-[10px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap shrink-0 inline-block">
                                Tam {item.size} • {item.weight}
                              </span>
                            )}
                            {item.includedSides && item.includedSides.length > 0 && (
                              <span className="font-body-sm text-[11px] text-on-surface-variant line-clamp-1 break-words">
                                {item.includedSides.join(", ")}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Sessão Perfurada de Cupom (Roleta) */}
                  <div className="pt-space-xs">
                    <div className="relative bg-tertiary-fixed/20 p-space-md rounded-xl overflow-hidden border border-tertiary-fixed/60">
                      <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-surface-container-lowest"></div>
                      <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-surface-container-lowest"></div>

                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5 text-on-tertiary-fixed">
                          <Dices className="w-4 h-4 text-tertiary" />
                          <span className="font-label-md font-bold uppercase tracking-wider text-xs">
                            Cupom da Roleta da Sorte
                          </span>
                        </div>
                        {coupon && (
                          <span className="bg-tertiary text-on-tertiary font-label-sm text-[11px] px-2 py-0.5 rounded-full font-bold">
                            APLICADO
                          </span>
                        )}
                      </div>

                      {coupon ? (
                        <div className="flex items-center justify-between bg-surface-container-lowest p-2 rounded-lg border border-outline-variant/30">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-tertiary" />
                            <span className="font-mono font-bold text-on-surface text-sm">
                              {coupon.code}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={removeCoupon}
                            className="text-xs text-error font-bold hover:underline"
                          >
                            Remover
                          </button>
                        </div>
                      ) : (
                        <form onSubmit={handleApplyCoupon} className="flex gap-2">
                          <input
                            type="text"
                            value={couponInput}
                            onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                            placeholder="Digite o cupom (ex: ROLETA15)"
                            className="flex-1 h-9 px-3 text-xs uppercase font-mono rounded-lg bg-surface-container-lowest border border-outline-variant/30 outline-none focus:border-primary"
                          />
                          <button
                            type="submit"
                            disabled={applyingCoupon}
                            className="h-9 px-4 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-xs font-bold transition-colors"
                          >
                            {applyingCoupon ? "..." : "Aplicar"}
                          </button>
                        </form>
                      )}

                      {couponError && (
                        <p className="text-xs text-error mt-1.5 font-semibold">
                          {couponError}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Resumo Financeiro */}
                  <div className="pt-space-sm space-y-2 text-on-surface-variant font-body-md text-sm border-t border-outline-variant/20">
                    <div className="flex justify-between">
                      <span>Subtotal dos pratos</span>
                      <span className="font-semibold text-on-surface">
                        R$ {getSubtotal().toFixed(2).replace(".", ",")}
                      </span>
                    </div>

                    {coupon && (
                      <div className="flex justify-between text-tertiary font-semibold">
                        <span>Desconto ({coupon.code})</span>
                        <span>- R$ {getDiscount().toFixed(2).replace(".", ",")}</span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span>
                        Taxa de entrega ({deliveryType === "PICKUP" ? "Balcão" : "Jaborandi"})
                      </span>
                      <span className="font-semibold text-on-surface">
                        {getEffectiveDeliveryFee() === 0
                          ? "Grátis"
                          : `R$ ${getEffectiveDeliveryFee().toFixed(2).replace(".", ",")}`}
                      </span>
                    </div>

                    <div className="flex justify-between text-base font-bold text-on-surface pt-2 border-t border-outline-variant/30">
                      <span>Total do Pedido</span>
                      <span className="text-2xl text-primary font-serif">
                        R$ {getTotal().toFixed(2).replace(".", ",")}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 p-2.5 bg-tertiary-fixed/30 rounded-lg text-secondary text-xs font-semibold">
                      <Award className="w-4 h-4 text-tertiary" />
                      <span>
                        Você acumulará <strong>{getEstimatedPoints()} pontos</strong> após a
                        entrega!
                      </span>
                    </div>
                  </div>

                  {/* Botão Finalizar Desktop */}
                  <button
                    type="button"
                    onClick={handleFinalizeOrder}
                    disabled={loading || items.length === 0 || isChangeInvalid}
                    className="hidden lg:flex w-full h-14 bg-primary hover:bg-primary-container text-on-primary font-label-lg rounded-xl shadow-lg items-center justify-center gap-2 transition-transform active:scale-95 font-bold text-base disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>
                      {loading
                        ? "Registrando Pedido..."
                        : isChangeInvalid
                        ? "Informe o valor correto para troco"
                        : "Confirmar e Enviar Pedido"}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Botão Confirmar Fixo no Rodapé no Celular (≤1023px) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-md border-t border-outline-variant/30 p-3 shadow-2xl lg:hidden">
        <div className="max-w-md mx-auto flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-xs text-on-surface-variant font-medium">Total</span>
            <span className="text-lg font-bold text-primary font-serif leading-tight">
              R$ {getTotal().toFixed(2).replace(".", ",")}
            </span>
          </div>
          <button
            type="button"
            onClick={handleFinalizeOrder}
            disabled={loading || items.length === 0 || isChangeInvalid}
            className="flex-1 max-w-[240px] h-12 min-h-[48px] bg-primary hover:bg-primary-container text-on-primary rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="truncate">
              {loading
                ? "Enviando..."
                : isChangeInvalid
                ? "Troco inválido"
                : "Confirmar Pedido"}
            </span>
          </button>
        </div>
      </div>

      {/* Modal de Sucesso do Pedido - Tela Cheia no Celular */}
      {createdOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-secondary/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full h-full sm:h-auto sm:max-w-md bg-surface-container-lowest sm:rounded-2xl shadow-2xl p-6 sm:p-8 text-center border-0 sm:border border-outline-variant/30 space-y-4 flex flex-col justify-center overflow-y-auto relative">
            <button
              type="button"
              onClick={() => setCreatedOrder(null)}
              className="absolute top-4 right-4 p-2 min-h-[44px] min-w-[44px] rounded-full text-on-surface hover:bg-surface-container flex items-center justify-center cursor-pointer"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center shadow-xs">
              <CookingPot className="w-9 h-9" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Pedido Recebido no Fogão a Lenha!
              </span>
              <h2 className="font-headline-md text-headline-md text-on-surface font-serif font-bold">
                Pedido #{createdOrder.orderNumber}
              </h2>
              <p className="font-body-md text-on-surface-variant text-sm">
                Já estamos preparando sua marmita artesanal com todo o carinho caipira!
              </p>
            </div>

            <div className="p-3 bg-surface-container-low rounded-xl text-left text-xs space-y-1 border border-outline-variant/20">
              <p className="flex justify-between">
                <span className="text-on-surface-variant">Status:</span>
                <span className="font-bold text-primary">Aguardando preparo</span>
              </p>
              <p className="flex justify-between">
                <span className="text-on-surface-variant">Tempo estimado:</span>
                <span className="font-bold text-on-surface">30 a 45 minutos</span>
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <Link
                href={`/pedidos/${createdOrder.id}`}
                className="w-full h-12 bg-primary hover:bg-primary-container text-on-primary rounded-lg font-bold flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <Clock className="w-5 h-5" />
                <span>Acompanhar em Tempo Real</span>
              </Link>

              <Link
                href="/"
                className="w-full py-2.5 text-sm text-on-surface-variant hover:text-on-surface font-semibold"
              >
                Voltar ao Cardápio
              </Link>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
