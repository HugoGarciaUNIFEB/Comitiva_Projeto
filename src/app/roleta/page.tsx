"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import { useCartStore } from "@/lib/store/useCartStore";
import {
  Sparkles,
  Flame,
  RefreshCw,
  Dices,
  CheckCircle2,
  LogIn,
  ShieldCheck,
  PartyPopper,
  Clock,
  Ticket,
  Copy,
  Check,
  ArrowRight,
  BookOpen,
  Truck,
  Tag,
} from "lucide-react";

interface RouletteStatus {
  authenticated: boolean;
  userName?: string;
  canSpin: boolean;
  hasWelcomeSpin: boolean;
  canDailySpin: boolean;
  spinsLeft: number;
  activeCoupon?: {
    code: string;
    discountType: string;
    discountValue: number;
    validUntil: string;
  } | null;
  todaySpinDone?: boolean;
}

interface SpinResult {
  prize: {
    id: string;
    name: string;
    type: string;
    value: number;
    description: string;
    targetAngle: number;
    spinRotations: number;
  };
  couponCode?: string | null;
  validUntil: string;
  wasWelcomeSpin: boolean;
}

export default function RoletaPage() {
  const [status, setStatus] = useState<RouletteStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [prizeResult, setPrizeResult] = useState<SpinResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const applyCoupon = useCartStore((state) => state.applyCoupon);

  // Carrega status da roleta
  const loadStatus = async () => {
    try {
      const res = await fetch("/api/roleta/status");
      const data = await res.json();
      setStatus(data);
      if (data.activeCoupon) {
        const c = data.activeCoupon;
        const prizeName =
          c.discountType === "PERCENT" || c.discountType === "PERCENTAGE"
            ? `${c.discountValue}% OFF no Almoço`
            : c.discountType === "FIXED_FREE_SHIPPING" || c.discountType === "FREE_SHIPPING"
            ? "Frete Grátis em Jaborandi"
            : c.discountType === "FIXED_MEAL_P" || c.discountType === "MEAL_P"
            ? "Marmita P Caipira Grátis"
            : c.description || `R$ ${Number(c.discountValue).toFixed(2)} de Desconto`;

        setPrizeResult({
          prize: {
            id: "ACTIVE",
            name: prizeName,
            type: c.discountType,
            value: c.discountValue,
            description: c.description || "Você possui um cupom ativo na sua carteira!",
            targetAngle: 0,
            spinRotations: 0,
          },
          couponCode: c.code,
          validUntil: c.validUntil || c.expiresAt,
          wasWelcomeSpin: false,
        });
      }
    } catch (err) {
      console.error("Erro ao obter status da roleta:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  // Executa o giro
  const handleSpin = async () => {
    if (isSpinning || !status?.canSpin) return;

    setIsSpinning(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/roleta/spin", {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Não foi possível realizar o giro.");
        setIsSpinning(false);
        return;
      }

      // Rotação acumulada para girar fluido
      const currentFullTurns = Math.floor(wheelRotation / 360) * 360;
      const nextRotation = currentFullTurns + data.prize.spinRotations;
      setWheelRotation(nextRotation);

      // Aguarda o término da animação (4.5 segundos)
      setTimeout(() => {
        setIsSpinning(false);
        setPrizeResult(data);

        // Dispara confetes comemorativos caipiras
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ["#D9531E", "#F2A900", "#4A2E2B", "#F9F6F0"],
          });
        } catch {
          // ignora se biblioteca falhar em ambiente headless
        }

        // Aplica cupom direto no carrinho se houver
        if (data.couponCode) {
          applyCoupon({
            code: data.couponCode,
            discountType: data.prize.type,
            discountValue: data.prize.value,
          });
        }

        // Atualiza status
        loadStatus();
      }, 4600);
    } catch {
      setErrorMessage("Erro de conexão ao girar a roleta.");
      setIsSpinning(false);
    }
  };

  const copyCoupon = () => {
    if (!prizeResult?.couponCode) return;
    navigator.clipboard.writeText(prizeResult.couponCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="min-h-screen bg-background font-body-md text-on-surface flex flex-col">
      <Header />
      <CartDrawer />

      <main className="w-full pt-28 bg-background flex-1">
        <div className="flex flex-col w-full">
          {/* Hero / Roleta Section */}
          <section className="relative w-full overflow-hidden pb-space-xl">
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-primary/10 via-tertiary-fixed-dim/15 to-transparent rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-7xl mx-auto px-margin-lg">
              {/* Heading Banner */}
              <div className="relative flex flex-col items-center text-center max-w-3xl mx-auto mb-space-lg">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed shadow-sm mb-space-sm">
                  <Sparkles className="w-4 h-4 text-tertiary" />
                  <span className="font-label-lg text-label-lg tracking-wide uppercase">
                    Gamificação Comitiva • 1 Giro por Almoço
                  </span>
                </div>
                <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">
                  Roleta Caipira da Sorte Comitiva
                </h1>
                <p className="font-body-lg text-body-lg text-on-surface-variant mt-space-xs">
                  Gire a roleta 1 vez por dia e ganhe descontos e prêmios imediatos para seu almoço de hoje feito no autêntico fogão a lenha de Jaborandi!
                </p>
                {status?.userName && (
                  <p className="font-label-lg text-primary mt-2">
                    Olá, <strong>{status.userName}</strong>! Você tem{" "}
                    <span className="underline font-bold">
                      {status.spinsLeft} giro(s)
                    </span>{" "}
                    disponíveis hoje.
                  </p>
                )}
              </div>

              {/* Grid: Wheel and Result Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-lg items-start">
                {/* Left: Roleta Wheel Card */}
                <div className="lg:col-span-7 flex flex-col items-center">
                  <div className="relative w-full max-w-[540px] p-6 sm:p-8 rounded-3xl bg-surface-container-lowest shadow-xl flex flex-col items-center border border-outline-variant/30">
                    {/* Pointer Marker */}
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center">
                      <svg
                        className="drop-shadow-lg text-secondary"
                        height="52"
                        viewBox="0 0 44 52"
                        width="44"
                      >
                        <path
                          d="M22 50 L4 10 Q2 4 8 4 L36 4 Q42 4 40 10 Z"
                          fill="currentColor"
                        />
                        <circle cx="22" cy="14" fill="#fcf9f3" r="6" />
                      </svg>
                    </div>

                    {/* Spinning Wheel Container */}
                    <div className="relative w-[320px] h-[320px] sm:w-[420px] sm:h-[420px] rounded-full p-3 bg-surface-container shadow-inner flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full bg-secondary/10" />

                      <div
                        className="relative w-full h-full rounded-full overflow-hidden shadow-2xl transition-transform duration-[4500ms] ease-out"
                        style={{
                          transform: `rotate(${wheelRotation}deg)`,
                          transitionTimingFunction: "cubic-bezier(0.15, 0.9, 0.2, 1)",
                        }}
                      >
                        <svg
                          className="w-full h-full select-none"
                          viewBox="0 0 400 400"
                        >
                          <defs>
                            <clipPath id="wheel-clip">
                              <circle cx="200" cy="200" r="195" />
                            </clipPath>
                          </defs>
                          <g clipPath="url(#wheel-clip)">
                            {/* Slice 1: 15% OFF Almoço (0° - 45°) */}
                            <g transform="rotate(0 200 200)">
                              <path
                                d="M200 200 L200 5 A195 195 0 0 1 337.89 62.11 Z"
                                fill="#a73400"
                              />
                              <text
                                fill="#ffffff"
                                fontFamily="'Plus Jakarta Sans', sans-serif"
                                fontSize="11.5"
                                fontWeight="700"
                                textAnchor="middle"
                                transform="rotate(22.5 240 80)"
                                x="240"
                                y="80"
                              >
                                15% OFF Almoço
                              </text>
                            </g>

                            {/* Slice 2: Marmita P Grátis (45° - 90°) */}
                            <g transform="rotate(45 200 200)">
                              <path
                                d="M200 200 L200 5 A195 195 0 0 1 337.89 62.11 Z"
                                fill="#775652"
                              />
                              <text
                                fill="#ffffff"
                                fontFamily="'Plus Jakarta Sans', sans-serif"
                                fontSize="11"
                                fontWeight="700"
                                textAnchor="middle"
                                transform="rotate(22.5 240 80)"
                                x="240"
                                y="80"
                              >
                                Marmita P Grátis
                              </text>
                            </g>

                            {/* Slice 3: 10% OFF Almoço (90° - 135°) */}
                            <g transform="rotate(90 200 200)">
                              <path
                                d="M200 200 L200 5 A195 195 0 0 1 337.89 62.11 Z"
                                fill="#7c5400"
                              />
                              <text
                                fill="#ffdead"
                                fontFamily="'Plus Jakarta Sans', sans-serif"
                                fontSize="11.5"
                                fontWeight="700"
                                textAnchor="middle"
                                transform="rotate(22.5 240 80)"
                                x="240"
                                y="80"
                              >
                                10% OFF Almoço
                              </text>
                            </g>

                            {/* Slice 4: Frete Grátis (135° - 180°) */}
                            <g transform="rotate(135 200 200)">
                              <path
                                d="M200 200 L200 5 A195 195 0 0 1 337.89 62.11 Z"
                                fill="#f0eee8"
                              />
                              <text
                                fill="#1c1c18"
                                fontFamily="'Plus Jakarta Sans', sans-serif"
                                fontSize="11.5"
                                fontWeight="700"
                                textAnchor="middle"
                                transform="rotate(22.5 240 80)"
                                x="240"
                                y="80"
                              >
                                Frete Grátis
                              </text>
                            </g>

                            {/* Slice 5: 15% OFF Almoço (180° - 225°) */}
                            <g transform="rotate(180 200 200)">
                              <path
                                d="M200 200 L200 5 A195 195 0 0 1 337.89 62.11 Z"
                                fill="#a73400"
                              />
                              <text
                                fill="#ffffff"
                                fontFamily="'Plus Jakarta Sans', sans-serif"
                                fontSize="11.5"
                                fontWeight="700"
                                textAnchor="middle"
                                transform="rotate(22.5 240 80)"
                                x="240"
                                y="80"
                              >
                                15% OFF Almoço
                              </text>
                            </g>

                            {/* Slice 6: Frete Grátis (225° - 270°) */}
                            <g transform="rotate(225 200 200)">
                              <path
                                d="M200 200 L200 5 A195 195 0 0 1 337.89 62.11 Z"
                                fill="#775652"
                              />
                              <text
                                fill="#ffd3cd"
                                fontFamily="'Plus Jakarta Sans', sans-serif"
                                fontSize="11.5"
                                fontWeight="700"
                                textAnchor="middle"
                                transform="rotate(22.5 240 80)"
                                x="240"
                                y="80"
                              >
                                Frete Grátis
                              </text>
                            </g>

                            {/* Slice 7: +50 Pontos (270° - 315°) */}
                            <g transform="rotate(270 200 200)">
                              <path
                                d="M200 200 L200 5 A195 195 0 0 1 337.89 62.11 Z"
                                fill="#7c5400"
                              />
                              <text
                                fill="#ffffff"
                                fontFamily="'Plus Jakarta Sans', sans-serif"
                                fontSize="11.5"
                                fontWeight="700"
                                textAnchor="middle"
                                transform="rotate(22.5 240 80)"
                                x="240"
                                y="80"
                              >
                                +50 Pontos
                              </text>
                            </g>

                            {/* Slice 8: 10% OFF Almoço (315° - 360°) */}
                            <g transform="rotate(315 200 200)">
                              <path
                                d="M200 200 L200 5 A195 195 0 0 1 337.89 62.11 Z"
                                fill="#f0eee8"
                              />
                              <text
                                fill="#a73400"
                                fontFamily="'Plus Jakarta Sans', sans-serif"
                                fontSize="11.5"
                                fontWeight="700"
                                textAnchor="middle"
                                transform="rotate(22.5 240 80)"
                                x="240"
                                y="80"
                              >
                                10% OFF Almoço
                              </text>
                            </g>

                            <circle
                              cx="200"
                              cy="200"
                              fill="none"
                              r="192"
                              stroke="#e5e2dc"
                              strokeWidth="4"
                            />
                          </g>
                        </svg>
                      </div>

                      {/* Central Wheel Hub */}
                      <div className="absolute inset-0 m-auto w-24 h-24 rounded-full bg-secondary text-on-secondary shadow-2xl flex flex-col items-center justify-center pointer-events-none z-20">
                        <Flame className="w-7 h-7 text-tertiary-fixed-dim" />
                        <span className="font-label-sm text-label-sm tracking-wider uppercase text-tertiary-fixed-dim mt-0.5">
                          Sorte
                        </span>
                      </div>
                    </div>

                    {/* Spin Trigger Button */}
                    {status?.authenticated ? (
                      <button
                        onClick={handleSpin}
                        disabled={isSpinning || !status.canSpin}
                        className={`mt-8 w-full py-4 px-6 rounded-xl font-title-md text-title-md flex items-center justify-center gap-3 shadow-lg transition-all duration-200 cursor-pointer ${
                          status.canSpin && !isSpinning
                            ? "bg-primary text-on-primary hover:bg-primary-container shadow-primary/25 active:scale-[0.99]"
                            : "bg-surface-container-high text-on-surface-variant cursor-not-allowed opacity-80"
                        }`}
                      >
                        {isSpinning ? (
                          <>
                            <RefreshCw className="w-6 h-6 animate-spin" />
                            <span>Girando a Roleta do Fogão...</span>
                          </>
                        ) : status.canSpin ? (
                          <>
                            <Dices className="w-6 h-6" />
                            <span>
                              GIRAR AGORA ({status.spinsLeft} Giro
                              {status.spinsLeft > 1 ? "s" : ""}{" "}
                              {status.hasWelcomeSpin ? "• Boas-Vindas!" : "Diário"})
                            </span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-6 h-6" />
                            <span>Giro de Hoje Já Realizado</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <Link
                        href="/login"
                        className="mt-8 w-full py-4 px-6 rounded-xl bg-primary text-on-primary font-title-md text-title-md hover:bg-primary-container flex items-center justify-center gap-3 shadow-lg shadow-primary/25"
                      >
                        <LogIn className="w-6 h-6" />
                        <span>Faça Login para Girar a Roleta</span>
                      </Link>
                    )}

                    {errorMessage && (
                      <p className="mt-3 text-error text-center font-label-md">
                        {errorMessage}
                      </p>
                    )}

                    <div className="flex items-center gap-2 mt-4 text-on-surface-variant font-label-md text-label-md">
                      <ShieldCheck className="w-4 h-4 text-tertiary" />
                      <span>
                        {status?.hasWelcomeSpin
                          ? "Giro bônus de boas-vindas disponível!"
                          : "Giro diário protegido pelo seu WhatsApp (1/1 hoje)"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Prize Celebration Card & Rules */}
                <div className="lg:col-span-5 flex flex-col gap-gutter-md">
                  {/* Prize Card */}
                  {prizeResult ? (
                    <div className="relative overflow-hidden rounded-3xl bg-surface-container-lowest p-6 sm:p-8 shadow-xl border border-primary/20">
                      <div className="absolute -top-10 -right-10 w-36 h-36 bg-tertiary-fixed-dim/25 rounded-full blur-2xl pointer-events-none" />
                      <div className="flex items-center justify-between gap-4 mb-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tertiary text-on-tertiary font-label-sm text-label-sm uppercase tracking-wider">
                          <PartyPopper className="w-4 h-4" />
                          Prêmio Sorteado
                        </span>
                        <div className="flex items-center gap-1.5 font-label-md text-label-md text-primary bg-primary-fixed px-3 py-1 rounded-full">
                          <Clock className="w-4 h-4" />
                          <span>Válido até 13h (Horário de SP)</span>
                        </div>
                      </div>

                      <h2 className="font-headline-md text-headline-md text-on-surface">
                        🎉 Parabéns, compadre!
                      </h2>
                      <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                        A fogueira tá acesa e a sorte sorriu pra você! Você ganhou{" "}
                        <strong className="text-primary font-bold">
                          {prizeResult.prize.name}
                        </strong>
                        !
                      </p>

                      {/* Coupon Box with Copy Button */}
                      {prizeResult.couponCode && (
                        <div className="mt-6 p-4 rounded-2xl bg-surface-container-low shadow-inner relative flex flex-col sm:flex-row items-center justify-between gap-4 border border-outline-variant/30">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-tertiary flex items-center justify-center text-on-tertiary shadow-sm">
                              <Ticket className="w-6 h-6" />
                            </div>
                            <div>
                              <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant block">
                                Código do Cupom
                              </span>
                              <span className="font-title-md text-title-md tracking-wider text-primary font-bold">
                                {prizeResult.couponCode}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={copyCoupon}
                            className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-surface-container-highest hover:bg-surface-variant text-on-surface font-label-md text-label-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            {copied ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                            <span>{copied ? "Copiado!" : "Copiar Cupom"}</span>
                          </button>
                        </div>
                      )}

                      <div className="mt-6 flex flex-col gap-2">
                        <Link
                          href="/"
                          className="w-full py-3.5 px-4 rounded-xl bg-primary text-on-primary font-label-lg text-label-lg text-center hover:bg-primary-container shadow-md transition-colors flex items-center justify-center gap-2"
                        >
                          <span>Usar Cupom e Escolher Marmita</span>
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                        <p className="font-body-sm text-body-sm text-on-surface-variant text-center mt-1">
                          O cupom foi adicionado automaticamente à sua sacola!
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-3xl bg-surface-container-lowest p-6 sm:p-8 shadow-xl text-center flex flex-col items-center justify-center min-h-[220px] border border-outline-variant/30">
                      <Dices className="w-12 h-12 text-tertiary mb-2" />
                      <h3 className="font-headline-sm text-headline-sm text-on-surface">
                        Gire para Revelar seu Prêmio
                      </h3>
                      <p className="font-body-sm text-on-surface-variant mt-1 max-w-sm">
                        Descontos exclusivos, frete grátis e marmitas caipiras feitas com carinho no fogo a lenha esperando por você.
                      </p>
                    </div>
                  )}

                  {/* Rules Card */}
                  <div className="p-6 sm:p-7 rounded-3xl bg-surface-container shadow-md flex flex-col gap-4 border border-outline-variant/30">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-secondary text-on-secondary flex items-center justify-center">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <h3 className="font-title-md text-title-md text-on-surface">
                        Regras da Roleta da Comitiva
                      </h3>
                    </div>
                    <ul className="space-y-3 font-body-sm text-body-sm text-on-surface-variant">
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span>
                          <strong>1 Giro Diário:</strong> Cada cliente cadastrado por WhatsApp possui direito a um giro gratuito por dia (mais 1 giro bônus no cadastro).
                        </span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <Clock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span>
                          <strong>Validade do Almoço:</strong> Os cupons obtidos expiram pontualmente às 13:00 de SP (se girar após as 13h, vale até as 13:00 do dia seguinte).
                        </span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <Truck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span>
                          <strong>Área Atendida:</strong> Entregas e marmitas válidas para todo o perímetro urbano de Jaborandi - SP.
                        </span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <Tag className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span>
                          <strong>Não Cumulativo:</strong> Válido 1 cupom promocional por pedido diário na sacola caipira.
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
