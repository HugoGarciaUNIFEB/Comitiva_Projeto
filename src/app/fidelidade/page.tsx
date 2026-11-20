"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import SafeImage from "@/components/SafeImage";
import { useCartStore } from "@/lib/store/useCartStore";
import {
  Sparkles,
  ArrowRightLeft,
  Flame,
  BadgeCheck,
  Award,
  HeartHandshake,
  Info,
  CookingPot,
  Bookmark,
  Gift,
  Dices,
  RotateCw,
  Lock,
  ArrowRight,
  PartyPopper,
  X,
} from "lucide-react";

interface LoyaltyTransaction {
  id: string;
  points: number;
  type: "EARNED" | "REDEEMED";
  description: string;
  createdAt: string;
}

interface Reward {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  imageUrl?: string | null;
}

interface LoyaltyData {
  userName: string;
  points: number;
  stampsCount: number;
  completedCards: number;
  transactions: LoyaltyTransaction[];
  rewards: Reward[];
}

export default function FidelidadePage() {
  const [data, setData] = useState<LoyaltyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [redeemingId, setRedeemingId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<"ALL" | "AVAILABLE">("ALL");
  const [successModal, setSuccessModal] = useState<{
    rewardName: string;
    couponCode: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const applyCoupon = useCartStore((state) => state.applyCoupon);

  const loadData = async () => {
    try {
      const res = await fetch("/api/loyalty");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      } else {
        setErrorMessage("Faça login para visualizar sua pontuação e benefícios.");
      }
    } catch {
      setErrorMessage("Erro ao carregar dados de fidelidade.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRedeem = async (reward: Reward) => {
    if (redeemingId) return;
    setRedeemingId(reward.id);
    setErrorMessage("");

    try {
      const res = await fetch("/api/loyalty/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rewardId: reward.id }),
      });

      const json = await res.json();

      if (!res.ok) {
        setErrorMessage(json.error || "Não foi possível resgatar o prêmio.");
        setRedeemingId(null);
        return;
      }

      // Sucesso!
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
          colors: ["#D9531E", "#F2A900", "#4A2E2B"],
        });
      } catch {
        // ignora se biblioteca não carregar em headless
      }

      setSuccessModal({
        rewardName: reward.title,
        couponCode: json.coupon.code,
      });

      // Aplica cupom no carrinho
      applyCoupon({
        code: json.coupon.code,
        discountType: json.coupon.discountType,
        discountValue: json.coupon.discountValue,
      });

      // Recarrega saldo
      loadData();
    } catch {
      setErrorMessage("Erro de conexão ao processar resgate.");
    } finally {
      setRedeemingId(null);
    }
  };

  const userPoints = data?.points || 0;
  const targetPoints = 450; // Meta Marmita G
  const progressPercent = Math.min(100, Math.round((userPoints / targetPoints) * 100));

  const filteredRewards = data?.rewards.filter((r) => {
    if (activeFilter === "AVAILABLE") {
      return r.pointsCost <= userPoints;
    }
    return true;
  }) || [];

  return (
    <div className="min-h-screen bg-background font-body-md text-on-surface flex flex-col">
      <Header />
      <CartDrawer />

      <main className="w-full pt-24 sm:pt-28 pb-16 bg-background flex-1 overflow-x-hidden">
        <div className="flex flex-col w-full">
          <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-10 space-y-8">
            {/* Top Introductory Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-surface-container-low p-space-lg shadow-sm border border-outline-variant/30">
              <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-primary/5 pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-space-md">
                <div className="space-y-space-xs max-w-2xl">
                  <div className="inline-flex items-center gap-space-xs px-3 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-tertiary" />
                    <span>Programa Tropeiro de Vantagens</span>
                  </div>
                  <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
                    Clube de Vantagens da Comitiva
                  </h1>
                  <p className="font-body-lg text-body-lg text-on-surface-variant">
                    Cada almoço pedido vira pontos para você trocar por pratos caprichados e brindes da fazenda.
                  </p>
                </div>
                <div className="flex items-center gap-space-sm self-start md:self-auto bg-surface-container px-4 py-3 rounded-xl shadow-sm border border-outline-variant/30">
                  <ArrowRightLeft className="w-7 h-7 text-primary" />
                  <div>
                    <span className="block font-label-sm text-label-sm text-on-surface-variant uppercase font-bold">
                      Regra Geral
                    </span>
                    <span className="font-title-md text-title-md text-primary font-bold">
                      R$ 1,00 gasto = 1 Ponto
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Layout Grid: Main Loyalty Pass & Side Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-lg items-stretch">
              {/* Tropeiro Pass Card (Leather & Wood Aesthetic) */}
              <div className="lg:col-span-8 relative rounded-2xl sm:rounded-3xl overflow-hidden bg-[#4A2E2B] text-surface-bright shadow-xl flex flex-col justify-between p-4 sm:p-6 md:p-8 border border-outline/30">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#311c1a] via-[#4A2E2B] to-[#5d3834] opacity-95 pointer-events-none" />
                <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-primary-container/20 blur-2xl pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-outline-variant/20">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-surface-bright/10 p-2 flex items-center justify-center shadow-inner">
                      <Flame className="w-8 h-8 text-tertiary-fixed" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-headline-md text-headline-md text-surface-bright">
                          {data?.userName || "Amigo da Comitiva"}
                        </span>
                        <BadgeCheck className="w-5 h-5 text-tertiary-fixed-dim" />
                      </div>
                      <p className="font-label-md text-label-md text-tertiary-fixed tracking-wide flex items-center gap-1.5">
                        <Award className="w-4 h-4" />
                        Tropeiro Fiel • Jaborandi - SP
                      </p>
                    </div>
                  </div>
                  <div className="px-3.5 py-1.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-md text-label-md flex items-center gap-1.5 shadow-sm">
                    <HeartHandshake className="w-4 h-4 text-tertiary" />
                    <span>Cliente Cadastrado</span>
                  </div>
                </div>

                {/* Center Counter Display */}
                <div className="relative z-10 my-8 flex flex-col md:flex-row items-baseline justify-between gap-6">
                  <div>
                    <span className="font-label-md text-label-md uppercase tracking-widest text-outline-variant block mb-1">
                      Saldo Disponível para Resgate
                    </span>
                    <div className="flex items-baseline gap-3">
                      <span className="font-display text-display font-bold text-tertiary-fixed-dim leading-none tracking-tight">
                        {userPoints}
                      </span>
                      <span className="font-title-md text-title-md text-surface-container-highest uppercase font-semibold">
                        Pontos Acumulados
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-surface-container-highest font-body-sm text-body-sm bg-surface-bright/10 px-3 py-2 rounded-lg">
                    <Info className="w-5 h-5 text-primary-fixed-dim shrink-0" />
                    <span>Pontos creditados automaticamente a cada pedido entregue!</span>
                  </div>
                </div>

                {/* Progress to Next Big Milestone */}
                <div className="relative z-10 space-y-3 bg-surface-bright/10 p-5 rounded-2xl">
                  <div className="flex justify-between items-center text-surface-bright font-label-lg text-label-lg">
                    <span className="flex items-center gap-1.5">
                      <CookingPot className="w-5 h-5 text-tertiary-fixed-dim" />
                      Meta: 1 Almoço Marmita G no Fogo de Chão
                    </span>
                    <span className="font-bold text-tertiary-fixed-dim">
                      {userPoints} / {targetPoints} pts ({progressPercent}%)
                    </span>
                  </div>
                  <div className="w-full bg-surface-bright/20 h-3 rounded-full overflow-hidden p-0.5">
                    <div
                      className="bg-gradient-to-r from-tertiary to-tertiary-fixed-dim h-full rounded-full transition-all duration-700 shadow-sm"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between font-body-sm text-body-sm text-surface-container-highest pt-1">
                    <span className="flex items-center gap-1 text-tertiary-fixed">
                      <Flame className="w-4 h-4" />
                      {userPoints >= targetPoints
                        ? "Parabéns! Você já tem pontos suficientes para resgatar sua Marmita G!"
                        : `Faltam ${targetPoints - userPoints} pontos para resgatar sua Marmita G grátis!`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Side Stamp Card / Quick Action */}
              <div className="lg:col-span-4 flex flex-col justify-between rounded-3xl bg-surface-container p-6 shadow-sm border border-outline-variant/30">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2">
                      <Bookmark className="w-5 h-5 text-primary" />
                      Cartela Tropeira
                    </h3>
                    <span className="font-label-sm text-label-sm text-on-surface-variant font-bold">
                      10 Selos = Brinde
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Cada pedido entregue garante um carimbo na sua cartela de fogo a lenha.
                  </p>

                  {/* Visual Stamps Grid */}
                  <div className="grid grid-cols-5 gap-2.5 pt-2">
                    {Array.from({ length: 10 }).map((_, index) => {
                      const isStamped = index < (data?.stampsCount || 0);
                      const isSpecialReward = index === 9;

                      return (
                        <div
                          key={index}
                          className={`aspect-square rounded-xl flex items-center justify-center shadow-sm font-label-md text-label-md transition-all ${
                            isStamped
                              ? "bg-tertiary-fixed-dim text-on-tertiary-fixed font-bold scale-105"
                              : isSpecialReward
                              ? "bg-primary-fixed text-primary font-bold border border-primary/30"
                              : "bg-surface-container-highest text-outline"
                          }`}
                        >
                          {isStamped ? (
                            <Flame className="w-5 h-5" />
                          ) : isSpecialReward ? (
                            <Gift className="w-5 h-5" />
                          ) : (
                            <span>{index + 1}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-6 pt-4 space-y-3">
                  <div className="p-3 bg-surface-container-low rounded-xl flex items-center gap-3 border border-outline-variant/20">
                    <Dices className="w-6 h-6 text-tertiary" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-label-md text-label-md text-on-surface font-bold truncate">
                        Roleta Diária da Sorte!
                      </h4>
                      <p className="font-body-sm text-body-sm text-on-surface-variant truncate">
                        Gire e ganhe cupons e até +50 pontos.
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/roleta"
                    className="w-full py-2.5 px-4 rounded-xl bg-primary text-on-primary hover:bg-primary-container transition-all font-label-lg text-label-lg shadow-sm flex items-center justify-center gap-2"
                  >
                    <RotateCw className="w-5 h-5" />
                    <span>Ir para a Roleta Caipira</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-4 rounded-xl bg-error/10 border border-error/30 text-error font-body-sm">
                {errorMessage}
              </div>
            )}

            {/* Reward Catalog Section */}
            <div className="space-y-space-md pt-space-md">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-xs">
                <div>
                  <span className="font-label-sm text-label-sm text-primary uppercase tracking-wider font-bold">
                    Catálogo de Resgate
                  </span>
                  <h2 className="font-headline-lg text-headline-lg text-on-surface">
                    Prêmios &amp; Benefícios da Fazenda
                  </h2>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    Troque seus pontos acumulados instantaneamente por cupons aplicáveis na sacola.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveFilter("ALL")}
                    className={`px-3.5 py-1.5 rounded-full font-label-md text-label-md transition-colors cursor-pointer ${
                      activeFilter === "ALL"
                        ? "bg-primary text-on-primary shadow-sm"
                        : "bg-surface-container-highest text-on-surface hover:bg-surface-dim"
                    }`}
                  >
                    Todos ({data?.rewards.length || 0})
                  </button>
                  <button
                    onClick={() => setActiveFilter("AVAILABLE")}
                    className={`px-3.5 py-1.5 rounded-full font-label-md text-label-md transition-colors cursor-pointer ${
                      activeFilter === "AVAILABLE"
                        ? "bg-primary text-on-primary shadow-sm"
                        : "bg-surface-container-highest text-on-surface hover:bg-surface-dim"
                    }`}
                  >
                    Resgatáveis Agora (
                    {data?.rewards.filter((r) => r.pointsCost <= userPoints).length || 0}
                    )
                  </button>
                </div>
              </div>

              {/* Rewards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter-lg">
                {filteredRewards.map((reward) => {
                  const canAfford = userPoints >= reward.pointsCost;

                  return (
                    <div
                      key={reward.id}
                      className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between transition-all hover:shadow-md border border-outline-variant/30"
                    >
                      <div className="p-space-md space-y-space-xs">
                        <div className="flex items-center justify-between mb-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-bold flex items-center gap-1">
                            <Gift className="w-3.5 h-3.5" /> Prêmio
                          </span>
                          <span className="font-title-md text-title-md text-primary font-bold">
                            {reward.pointsCost} Pts
                          </span>
                        </div>
                        <div className="h-44 w-full rounded-xl overflow-hidden bg-surface-container-high relative mb-3">
                          <SafeImage
                            className="w-full h-full object-cover"
                            src={reward.imageUrl || "/images/pratos/costela_fogo_chao.jpg"}
                            alt={reward.title}
                          />
                          {canAfford && (
                            <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-surface-bright/90 text-primary font-label-sm text-label-sm font-bold shadow-sm">
                              Elegível
                            </span>
                          )}
                        </div>
                        <h3 className="font-title-md text-title-md text-on-surface">
                          {reward.title}
                        </h3>
                        <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                          {reward.description}
                        </p>
                      </div>

                      <div className="p-space-md pt-0">
                        {canAfford ? (
                          <button
                            onClick={() => handleRedeem(reward)}
                            disabled={redeemingId === reward.id}
                            className="w-full py-2.5 rounded-xl bg-primary text-on-primary hover:bg-primary-container font-label-lg text-label-lg transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                          >
                            <Gift className="w-4 h-4" />
                            <span>
                              {redeemingId === reward.id
                                ? "Resgatando..."
                                : `Resgatar Agora (${reward.pointsCost} pts)`}
                            </span>
                          </button>
                        ) : (
                          <button
                            disabled
                            className="w-full py-2.5 rounded-xl bg-surface-container-high text-on-surface-variant font-label-lg text-label-lg cursor-not-allowed flex items-center justify-center gap-2 opacity-80"
                          >
                            <Lock className="w-4 h-4" />
                            <span>
                              Faltam {reward.pointsCost - userPoints} pts
                            </span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Statement & Points Ledger */}
            <div className="space-y-space-md pt-space-md">
              <div>
                <h2 className="font-headline-md text-headline-md text-on-surface">
                  Extrato Recente de Pontos
                </h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Acompanhe as entradas de pontos e os resgates realizados na Comitiva.
                </p>
              </div>

              <div className="overflow-x-auto rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/30">
                <table className="w-full text-left font-body-md text-body-md min-w-[600px]">
                  <thead className="bg-surface-container font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-6 font-semibold">Data / Horário</th>
                      <th className="py-3.5 px-6 font-semibold">Descrição</th>
                      <th className="py-3.5 px-6 font-semibold">Tipo</th>
                      <th className="py-3.5 px-6 font-semibold text-right">
                        Pontuação
                      </th>
                      <th className="py-3.5 px-6 font-semibold text-center">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10 text-on-surface font-body-sm text-body-sm">
                    {data?.transactions && data.transactions.length > 0 ? (
                      data.transactions.map((tx) => (
                        <tr
                          key={tx.id}
                          className="hover:bg-surface-container-low transition-colors"
                        >
                          <td className="py-4 px-6 text-on-surface-variant">
                            {new Date(tx.createdAt).toLocaleDateString("pt-BR", {
                              day: "2-digit",
                              month: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="py-4 px-6 font-semibold">
                            {tx.description}
                          </td>
                          <td className="py-4 px-6 text-on-surface-variant">
                            {tx.type === "EARNED" ? "Entrada" : "Resgate"}
                          </td>
                          <td
                            className={`py-4 px-6 text-right font-title-md text-title-md font-bold ${
                              tx.type === "EARNED" ? "text-primary" : "text-error"
                            }`}
                          >
                            {tx.type === "EARNED" ? `+${tx.points}` : `-${tx.points}`}{" "}
                            pts
                          </td>
                          <td className="py-4 px-6 text-center">
                            <span className="px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface font-label-sm text-label-sm">
                              Efetivado
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={5}
                          className="py-8 text-center text-on-surface-variant"
                        >
                          Nenhuma movimentação de pontos registrada ainda.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Success Modal - Tela Cheia no Celular */}
      {successModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-0 sm:p-4">
          <div className="bg-surface-container-lowest h-full sm:h-auto rounded-none sm:rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border-0 sm:border border-primary/20 text-center animate-in fade-in zoom-in-95 duration-200 flex flex-col justify-center overflow-y-auto relative">
            <button
              type="button"
              onClick={() => setSuccessModal(null)}
              className="absolute top-4 right-4 p-2 min-h-[44px] min-w-[44px] rounded-full text-on-surface hover:bg-surface-container flex items-center justify-center cursor-pointer"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
            <PartyPopper className="w-14 h-14 text-primary mx-auto mb-2" />
            <h3 className="font-headline-md text-headline-md text-on-surface">
              Parabéns pelo Resgate!
            </h3>
            <p className="font-body-md text-on-surface-variant mt-2">
              Você resgatou <strong>{successModal.rewardName}</strong>. O cupom
              promocional foi gerado e já está aplicado na sua sacola de compras!
            </p>

            <div className="my-6 p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30">
              <span className="font-label-sm text-on-surface-variant uppercase tracking-wider block">
                Código do Cupom
              </span>
              <span className="font-headline-sm text-headline-sm text-primary font-bold tracking-widest mt-1 block">
                {successModal.couponCode}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <Link
                href="/"
                onClick={() => setSuccessModal(null)}
                className="w-full py-3.5 rounded-xl bg-primary text-on-primary font-label-lg text-label-lg hover:bg-primary-container transition-colors shadow-md flex items-center justify-center gap-2"
              >
                <span>Ir para o Cardápio e Usar</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                onClick={() => setSuccessModal(null)}
                className="w-full py-2.5 rounded-xl text-on-surface-variant hover:bg-surface-container-high transition-colors font-label-md"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
