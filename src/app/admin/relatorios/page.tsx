"use client";

import React, { useState, useEffect } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import {
  BarChart3,
  Clock,
  RefreshCw,
  Banknote,
  TrendingUp,
  ShoppingBag,
  Coins,
  ArrowUp,
  CheckCircle2,
  Flame,
  Radio,
  Smartphone,
  Store,
  MessageSquare,
  CookingPot,
  Star,
  Lightbulb,
  Trash2,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface ReportData {
  period: string;
  peakHourText?: string;
  totalUnitsSold?: number;
  kpis: {
    grossRevenue: number;
    totalOrders: number;
    averageTicket: number;
    avgDispatchMinutes: number;
    dailyTarget: number;
  };
  hourlyChart: { hour: string; pedidos: number; capacidade: number }[];
  channels: { name: string; key: string; count: number; pct: number }[];
  paymentMethods: { name: string; pct: number; count: number }[];
  topDishes: { name: string; quantity: number; revenue: number; pct: number }[];
  favoriteSides: { name: string; pct: number }[];
}

export default function AdminRelatoriosPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [period, setPeriod] = useState<"today" | "yesterday" | "7days" | "month">("today");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const [shiftLabel, setShiftLabel] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });
      setCurrentTime(timeStr);
      const mins = now.getHours() * 60 + now.getMinutes();
      const isLunch = mins >= 630 && mins <= 780; // 10h30 às 13h00
      setShiftLabel(isLunch ? `Turno Almoço: ${timeStr}` : `Fechado • ${timeStr}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 10000);
    return () => clearInterval(timer);
  }, []);

  const fetchReports = async (selectedPeriod = period) => {
    setRefreshing(true);
    try {
      const res = await fetch(`/api/admin/reports?period=${selectedPeriod}`);
      if (res.ok) {
        const reportJson = await res.json();
        setData(reportJson);
      }
    } catch (err) {
      console.error("Erro ao carregar relatórios:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReports(period);
  }, [period]);

  return (
    <div className="flex min-h-screen bg-surface">
      <AdminSidebar />

      <div className="pt-16 lg:pt-0 lg:pl-72 flex flex-col flex-1 min-w-0 max-w-full overflow-x-hidden">
        {/* Top Header */}
        <header className="h-16 px-4 sm:px-gutter-lg flex items-center justify-between bg-surface-container-lowest/90 backdrop-blur-xl border-b border-surface-container shadow-sm sticky top-0 z-30">
          <div className="flex items-center gap-space-lg">
            <div className="flex items-center gap-space-xs text-on-surface-variant">
              <BarChart3 className="w-5 h-5 text-primary" />
              <span className="font-body-sm text-body-sm font-semibold">Relatórios Gerenciais &amp; Inteligência</span>
            </div>
            <div className="hidden md:flex items-center gap-space-xs bg-surface-container-high px-space-sm py-1 rounded-full text-on-surface-variant">
              <Clock className="w-4 h-4" />
              <span className="font-label-md text-label-md">{shiftLabel || currentTime || "Ao Vivo"}</span>
            </div>
          </div>
          <div className="flex items-center gap-space-md">
            <div className="flex items-center gap-2 pl-space-sm">
              <span className="inline-flex h-2.5 w-2.5 rounded-full bg-primary animate-pulse"></span>
              <span className="font-label-sm text-label-sm text-primary font-bold">Dados Sincronizados</span>
            </div>
          </div>
        </header>

        <main className="w-full pt-4 bg-surface pb-16">
          <div className="p-4 sm:p-gutter-lg max-w-[1500px] w-full flex flex-col gap-space-lg">
            {/* Top Bar: Title & Primary Controls */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md bg-surface-container-low p-4 sm:p-space-lg rounded-xl shadow-sm border border-surface-container">
              <div className="flex flex-col">
                <div className="flex items-center gap-space-xs text-primary font-bold">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary">
                    Painel do Administrador
                  </span>
                </div>
                <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold">
                  Dashboard &amp; Desempenho do Almoço
                </h1>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Visão tática e financeira da cozinha pantaneira em tempo real.
                </p>
              </div>

              {/* Controls & Filter Pill Group */}
              <div className="flex flex-wrap items-center gap-space-sm">
                <div className="flex items-center bg-surface-container-highest p-1 rounded-xl overflow-x-auto max-w-full">
                  <button
                    type="button"
                    onClick={() => setPeriod("today")}
                    className={`min-h-[40px] px-3 sm:px-space-md py-2 rounded-lg font-label-md text-xs sm:text-label-md transition-all whitespace-nowrap cursor-pointer ${
                      period === "today"
                        ? "bg-primary text-on-primary font-bold shadow-sm"
                        : "text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    Hoje (Almoço)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPeriod("yesterday")}
                    className={`min-h-[40px] px-3 sm:px-space-md py-2 rounded-lg font-label-md text-xs sm:text-label-md transition-all whitespace-nowrap cursor-pointer ${
                      period === "yesterday"
                        ? "bg-primary text-on-primary font-bold shadow-sm"
                        : "text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    Ontem
                  </button>
                  <button
                    type="button"
                    onClick={() => setPeriod("7days")}
                    className={`min-h-[40px] px-3 sm:px-space-md py-2 rounded-lg font-label-md text-xs sm:text-label-md transition-all whitespace-nowrap cursor-pointer ${
                      period === "7days"
                        ? "bg-primary text-on-primary font-bold shadow-sm"
                        : "text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    Últimos 7 Dias
                  </button>
                  <button
                    type="button"
                    onClick={() => setPeriod("month")}
                    className={`min-h-[40px] px-3 sm:px-space-md py-2 rounded-lg font-label-md text-xs sm:text-label-md transition-all whitespace-nowrap cursor-pointer ${
                      period === "month"
                        ? "bg-primary text-on-primary font-bold shadow-sm"
                        : "text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    Mês Atual
                  </button>
                </div>

                <div className="flex items-center gap-space-xs">
                  <button
                    type="button"
                    onClick={() => fetchReports()}
                    className="min-h-[40px] flex items-center gap-space-xs px-3 sm:px-space-md py-2 bg-surface-container-highest hover:bg-surface-variant text-on-surface rounded-xl font-label-md text-xs sm:text-label-md transition-all font-semibold cursor-pointer"
                  >
                    <RefreshCw className={`w-4 h-4 text-primary ${refreshing ? "animate-spin" : ""}`} />
                    <span>Atualizar</span>
                  </button>
                </div>
              </div>
            </div>

            {loading || !data ? (
              <div className="py-16 text-center text-on-surface-variant font-body-lg">
                Calculando indicadores e curva de pedidos...
              </div>
            ) : (
              <>
                {/* 4 Major KPIs Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md">
                  {/* Card 1: Faturamento */}
                  <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden border border-surface-container group">
                    <div className="flex items-center justify-between">
                      <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
                        Faturamento Bruto
                      </span>
                      <span className="w-8 h-8 rounded-lg bg-primary-fixed flex items-center justify-center text-primary">
                        <Banknote className="w-5 h-5" />
                      </span>
                    </div>
                    <div className="my-space-sm">
                      <div className="font-headline-lg text-headline-lg text-on-surface font-extrabold">
                        R$ {data.kpis.grossRevenue.toFixed(2).replace(".", ",")}
                      </div>
                      <div className="flex items-center gap-1 text-primary pt-1 font-bold">
                        {data.kpis.totalOrders > 0 ? (
                          <>
                            <TrendingUp className="w-4 h-4" />
                            <span className="font-label-md text-label-md">Ativo</span>
                            <span className="font-body-sm text-body-sm text-on-surface-variant ml-1 font-normal">
                              {data.kpis.totalOrders} pedidos computados
                            </span>
                          </>
                        ) : (
                          <span className="font-body-sm text-body-sm text-on-surface-variant font-normal">
                            Sem pedidos no período
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="pt-space-xs flex items-center justify-between text-on-surface-variant font-body-sm text-body-sm border-t border-surface-container">
                      <span>Média por Pedido:</span>
                      <strong className="text-on-surface font-label-md text-label-md">
                        R$ {data.kpis.averageTicket.toFixed(2).replace(".", ",")}
                      </strong>
                    </div>
                  </div>

                  {/* Card 2: Marmitas Pedidas */}
                  <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden border border-surface-container group">
                    <div className="flex items-center justify-between">
                      <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
                        Total de Pedidos Feitos
                      </span>
                      <span className="w-8 h-8 rounded-lg bg-tertiary-fixed flex items-center justify-center text-tertiary">
                        <ShoppingBag className="w-5 h-5" />
                      </span>
                    </div>
                    <div className="my-space-sm">
                      <div className="font-headline-lg text-headline-lg text-on-surface font-extrabold">
                        {data.kpis.totalOrders}{" "}
                        <span className="font-title-md text-title-md text-on-surface-variant font-normal">
                          pedidos
                        </span>
                      </div>
                    </div>
                    <div className="pt-space-xs flex items-center justify-between text-on-surface-variant font-body-sm text-body-sm border-t border-surface-container">
                      <span>Volume de almoços no período:</span>
                      <strong className="text-on-surface font-label-md text-label-md">
                        {data.kpis.totalOrders} {data.kpis.totalOrders === 1 ? "pedido" : "pedidos"}
                      </strong>
                    </div>
                  </div>

                  {/* Card 3: Ticket Médio */}
                  <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden border border-surface-container group">
                    <div className="flex items-center justify-between">
                      <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
                        Ticket Médio Geral
                      </span>
                      <span className="w-8 h-8 rounded-lg bg-secondary-fixed flex items-center justify-center text-secondary">
                        <Coins className="w-5 h-5" />
                      </span>
                    </div>
                    <div className="my-space-sm">
                      <div className="font-headline-lg text-headline-lg text-on-surface font-extrabold">
                        R$ {data.kpis.averageTicket.toFixed(2).replace(".", ",")}
                      </div>
                      <div className="flex items-center gap-1 text-primary pt-1 font-bold">
                        {data.kpis.averageTicket > 0 ? (
                          <>
                            <ArrowUp className="w-4 h-4" />
                            <span className="font-label-md text-label-md">Média Real</span>
                            <span className="font-body-sm text-body-sm text-on-surface-variant ml-1 font-normal">
                              calculada do banco
                            </span>
                          </>
                        ) : (
                          <span className="font-body-sm text-body-sm text-on-surface-variant font-normal">
                            Sem movimentação
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="pt-space-xs flex items-center justify-between text-on-surface-variant font-body-sm text-body-sm border-t border-surface-container">
                      <span>Total Faturado:</span>
                      <strong className="text-on-surface font-label-md text-label-md">
                        R$ {data.kpis.grossRevenue.toFixed(2).replace(".", ",")}
                      </strong>
                    </div>
                  </div>

                  {/* Card 4: Tempo Expedição */}
                  <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden border border-surface-container group">
                    <div className="flex items-center justify-between">
                      <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
                        Tempo Médio de Despacho
                      </span>
                      <span className="w-8 h-8 rounded-lg bg-secondary-container flex items-center justify-center text-primary-container">
                        <Clock className="w-5 h-5" />
                      </span>
                    </div>
                    <div className="my-space-sm">
                      <div className="font-headline-lg text-headline-lg text-on-surface font-extrabold">
                        {data.kpis.avgDispatchMinutes}{" "}
                        <span className="font-title-md text-title-md text-on-surface-variant font-normal">
                          min
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-tertiary-container pt-1 font-bold">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="font-label-md text-label-md">
                          {data.kpis.avgDispatchMinutes > 0 ? "Calculado do KDS" : "Aguardando entregas"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Analytics Grid: Hourly Curve & Distribution */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
                  {/* Chart Column: Hourly Sales Volume Curve (8 cols) */}
                  <div className="lg:col-span-8 bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between border border-surface-container">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs pb-space-md border-b border-surface-container">
                      <div className="flex flex-col">
                        <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                          Curva de Pedidos por Horário
                        </h2>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          {data.peakHourText || "Distribuição dos pedidos ao longo do horário de almoço."}
                        </p>
                      </div>
                      <div className="flex items-center gap-space-sm text-on-surface-variant font-label-sm text-label-sm">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-full bg-primary inline-block"></span> Marmitas Pedidas
                        </span>
                      </div>
                    </div>

                    {/* Gráfico Recharts Interativo */}
                    <div className="w-full h-64 sm:h-72 pt-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data.hourlyChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#D9531E" stopOpacity={0.4} />
                              <stop offset="95%" stopColor="#D9531E" stopOpacity={0.0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e2dc" />
                          <XAxis dataKey="hour" stroke="#8d7168" fontSize={11} tickLine={false} interval="preserveStartEnd" />
                          <YAxis stroke="#8d7168" fontSize={11} tickLine={false} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#31312d",
                              borderRadius: "8px",
                              color: "#fff",
                              border: "none",
                              fontSize: "12px",
                              fontWeight: "bold",
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="pedidos"
                            stroke="#D9531E"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#curveGradient)"
                            name="Marmitas"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="mt-space-md p-space-sm bg-surface-container-low rounded-lg flex items-center justify-between border border-surface-container">
                      <div className="flex items-center gap-space-xs text-on-surface">
                        <Flame className="w-4 h-4 text-primary" />
                        <span className="font-body-sm text-body-sm">
                          {data.peakHourText || "Monitoramento da demanda em tempo real no KDS."}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Channels & Payments Donut Summary (4 cols) */}
                  <div className="lg:col-span-4 flex flex-col gap-space-md">
                    {/* Channels Breakdown */}
                    <div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md border border-surface-container">
                      <div className="flex items-center justify-between">
                        <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Canais de Entrada</h3>
                        <Radio className="w-5 h-5 text-on-surface-variant" />
                      </div>

                      <div className="my-space-md flex flex-col gap-space-sm">
                        {data.channels.map((ch) => (
                          <div key={ch.key}>
                            <div className="flex items-center justify-between font-label-md text-label-md pb-1">
                              <span className="flex items-center gap-1.5 text-on-surface font-semibold">
                                {ch.key === "APP" ? (
                                  <Smartphone className="w-4 h-4 text-primary" />
                                ) : ch.key === "COUNTER" ? (
                                  <Store className="w-4 h-4 text-primary" />
                                ) : (
                                  <MessageSquare className="w-4 h-4 text-primary" />
                                )}
                                {ch.name}
                              </span>
                              <span className="font-bold text-primary">
                                {ch.pct}% <span className="font-normal text-on-surface-variant text-body-sm">({ch.count} ped)</span>
                              </span>
                            </div>
                            <div className="w-full bg-surface-container-high h-2.5 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  ch.key === "APP" ? "bg-primary" : ch.key === "COUNTER" ? "bg-tertiary" : "bg-secondary"
                                }`}
                                style={{ width: `${ch.pct}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Forms of Payment */}
                      <div className="pt-space-sm bg-surface-container-low p-space-sm rounded-lg flex flex-col gap-space-xs border border-surface-container">
                        <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-bold">
                          Formas de Pagamento
                        </span>
                        {data.paymentMethods.map((pm) => (
                          <div key={pm.name} className="flex items-center justify-between font-body-sm text-body-sm">
                            <span className="flex items-center gap-1">
                              <span className="w-2.5 h-2.5 rounded-full bg-primary"></span> {pm.name}
                            </span>
                            <strong className="font-label-md text-label-md text-on-surface">{pm.pct}%</strong>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ranking dos Pratos Mais Vendidos & Guarnições */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
                  {/* Top Pratos do Dia (8 cols) */}
                  <div className="lg:col-span-8 bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md border border-surface-container">
                    <div className="flex items-center justify-between pb-space-sm border-b border-surface-container">
                      <div>
                        <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                          Ranking dos Pratos Mais Vendidos
                        </h2>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          Desempenho por receita e quantidade no fogão pantaneiro.
                        </p>
                      </div>
                      <span className="bg-surface-container px-space-sm py-1 rounded text-on-surface-variant font-label-sm text-label-sm font-semibold">
                        {data.totalUnitsSold !== undefined ? data.totalUnitsSold : data.kpis.totalOrders} MARMITAS TOTAIS
                      </span>
                    </div>

                    <div className="flex flex-col gap-space-md mt-space-sm">
                      {data.topDishes.length === 0 ? (
                        <div className="py-12 text-center text-on-surface-variant font-body-md">
                          Nenhum prato vendido registrado neste período.
                        </div>
                      ) : (
                        data.topDishes.map((dish, idx) => (
                          <div
                            key={dish.name}
                            className="p-3.5 sm:p-space-md bg-surface-container-low rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-space-md hover:bg-surface-container transition-colors border border-surface-container min-w-0 overflow-hidden"
                          >
                            <div className="flex items-center gap-3 sm:gap-space-md flex-1 min-w-0 w-full sm:w-auto">
                              <div
                                className={`w-11 h-11 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center font-headline-sm text-headline-sm font-bold shadow-sm shrink-0 ${
                                  idx === 0
                                    ? "bg-primary text-on-primary"
                                    : idx === 1
                                    ? "bg-tertiary-container text-on-tertiary-container"
                                    : "bg-surface-variant text-on-surface"
                                }`}
                              >
                                {idx + 1}º
                              </div>
                              <div className="flex-1 min-w-0 flex flex-col">
                                <div className="flex items-center gap-space-xs flex-wrap">
                                  <h4 className="font-title-md text-title-md text-on-surface font-bold line-clamp-2 break-words leading-snug">
                                    {dish.name}
                                  </h4>
                                  {idx === 0 && (
                                    <span className="bg-primary-fixed text-on-primary-fixed text-[10px] font-bold px-1.5 py-0.5 rounded uppercase whitespace-nowrap shrink-0">
                                      Carro Chefe
                                    </span>
                                  )}
                                </div>
                                <span className="font-body-sm text-body-sm text-on-surface-variant">
                                  {dish.quantity} {dish.quantity === 1 ? "unidade vendida" : "unidades vendidas"} • {dish.pct}% do total
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-space-lg w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-surface-container/60 pt-2 sm:pt-0 shrink-0">
                              <div className="w-24 sm:w-32 hidden xs:block">
                                <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
                                  <div className="bg-primary h-full rounded-full" style={{ width: `${dish.pct}%` }}></div>
                                </div>
                              </div>
                              <div className="text-right whitespace-nowrap shrink-0">
                                <div className="font-title-md text-title-md font-bold text-on-surface">
                                  R$ {dish.revenue.toFixed(2).replace(".", ",")}
                                </div>
                                <span className="font-label-sm text-[11px] sm:text-label-sm text-on-surface-variant">
                                  Médio: R$ {(dish.revenue / Math.max(1, dish.quantity)).toFixed(2).replace(".", ",")}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Guarnições & Complementos Mais Escolhidos (4 cols) */}
                  <div className="lg:col-span-4 bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md border border-surface-container">
                    <div className="flex items-center justify-between pb-space-sm border-b border-surface-container">
                      <div>
                        <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Guarnições Mais Pedidas</h3>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          Preferência do cliente ao montar a marmita.
                        </p>
                      </div>
                      <CookingPot className="w-5 h-5 text-primary" />
                    </div>

                    <div className="flex flex-col gap-space-md my-space-sm">
                      {data.favoriteSides.length === 0 ? (
                        <div className="py-8 text-center text-on-surface-variant font-body-sm">
                          Nenhuma guarnição registrada no período.
                        </div>
                      ) : (
                        data.favoriteSides.map((side) => (
                          <div key={side.name}>
                            <div className="flex justify-between items-center font-label-md text-label-md mb-1">
                              <span className="text-on-surface font-bold flex items-center gap-1.5">
                                <Star className="w-4 h-4 text-tertiary fill-tertiary" />
                                {side.name}
                              </span>
                              <span className="text-primary font-bold">{side.pct}% dos pedidos</span>
                            </div>
                            <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                              <div className="bg-primary h-full rounded-full" style={{ width: `${side.pct}%` }}></div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
