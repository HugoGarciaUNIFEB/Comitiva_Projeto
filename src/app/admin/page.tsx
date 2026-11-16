"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import AdminSidebar from "@/components/AdminSidebar";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
  DragStartEvent,
  DragEndEvent,
  closestCorners,
} from "@dnd-kit/core";
import {
  RefreshCw,
  Clock,
  Flame,
  CookingPot,
  PlusCircle,
  ShoppingBag,
  Bike,
  Hourglass,
  Store,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  PackageCheck,
  CheckCheck,
  GripVertical,
  MapPin,
  ExternalLink,
  Phone,
  MessageSquare,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  getOrderChannelLabel,
  formatCurrency,
  formatPaymentMethod,
} from "@/lib/orderStatus";

interface OrderItem {
  id: string;
  productName: string;
  size?: string | null;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  includedSides?: string | null;
  addedSides?: string | null;
  observations?: string | null;
}

interface Order {
  id: string;
  orderNumber: number;
  status: "AGUARDANDO" | "NO_FOGAO" | "PRONTO" | "EM_ROTA" | "ENTREGUE" | "CANCELADO";
  total: number;
  orderType?: string;
  deliveryType?: "ENTREGA" | "RETIRADA";
  channel?: string;
  orderOrigin?: string;
  deliveryAddress?: string | null;
  addressStreet?: string | null;
  customerName: string;
  customerPhone?: string | null;
  user?: {
    name?: string | null;
    whatsapp?: string | null;
  } | null;
  paymentMethod: string;
  changeFor?: number | null;
  notes?: string | null;
  pointsEarned?: number;
  createdAt: string;
  updatedAt?: string;
  items: OrderItem[];
}

interface KdsData {
  orders: Order[];
  metrics: {
    totalAtivos: number;
    aguardandoCount: number;
    noFogaoCount: number;
    prontoCount: number;
    emRotaCount?: number;
    entreguesCount: number;
    marmitasEntreguesHoje: number;
    tempoMedioEspera: number;
  };
}

// -------------------------------------------------------------
// Componente de Cartão de Pedido (Draggable)
// -------------------------------------------------------------
interface OrderCardProps {
  order: Order;
  onUpdateStatus: (orderId: string, nextStatus: Order["status"]) => void;
  isUpdating: boolean;
}

function DraggableOrderCard({ order, onUpdateStatus, isUpdating }: OrderCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: order.id,
    data: { order },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 50,
      }
    : undefined;

  const isDelivery = order.orderType === "DELIVERY" || order.deliveryType === "ENTREGA";
  const phoneClean = (order.customerPhone || order.user?.whatsapp || "").replace(/\D/g, "");
  const fullAddress = order.deliveryAddress || order.addressStreet || "";
  const channelLabel = getOrderChannelLabel(order.channel || order.orderOrigin);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex flex-col bg-surface-container-lowest rounded-2xl p-4 shadow-sm border transition-all relative overflow-hidden ${
        isDragging
          ? "opacity-30 border-dashed border-primary"
          : "border-outline-variant/30 hover:border-primary/40 hover:shadow-md"
      }`}
    >
      {/* Top Accent Strip */}
      <div
        className={`absolute top-0 left-0 right-0 h-1.5 ${
          order.status === "AGUARDANDO"
            ? "bg-tertiary animate-pulse"
            : order.status === "NO_FOGAO"
            ? "bg-primary animate-pulse"
            : order.status === "PRONTO"
            ? "bg-tertiary-fixed-dim"
            : order.status === "EM_ROTA"
            ? "bg-secondary animate-pulse"
            : "bg-surface-container-highest"
        }`}
      />

      {/* Header do Cartão com Handle de Arrastar */}
      <div className="flex items-start justify-between gap-2 mb-2 pt-1">
        <div className="flex items-center gap-2">
          {/* Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            className="p-1 -ml-1 text-on-surface-variant/60 hover:text-on-surface hover:bg-surface-container-high rounded-lg cursor-grab active:cursor-grabbing touch-none select-none"
            title="Arraste para mover entre colunas"
          >
            <GripVertical className="w-4 h-4" />
          </div>

          <span className="font-title-md text-title-md text-on-surface font-bold">
            #{order.orderNumber}
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm font-bold">
            {channelLabel}
          </span>
        </div>

        <span className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1 font-medium">
          <Clock className="w-3.5 h-3.5" />
          {new Date(order.createdAt).toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>

      {/* Modalidade e Cliente */}
      <div className="flex flex-col gap-1.5 mb-2.5">
        <div className="flex items-center justify-between gap-2">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg font-label-sm text-label-sm font-bold ${
              isDelivery
                ? "bg-primary/10 text-primary border border-primary/20"
                : "bg-secondary-container/50 text-secondary border border-secondary/20"
            }`}
          >
            {isDelivery ? (
              <>
                <Bike className="w-3.5 h-3.5 text-primary" />
                <span>Delivery</span>
              </>
            ) : (
              <>
                <Store className="w-3.5 h-3.5 text-secondary" />
                <span>Retirada Balcão</span>
              </>
            )}
          </span>

          <span className="text-on-surface text-body-sm font-bold truncate max-w-[170px]">
            {order.customerName || "Consumidor Balcão"}
          </span>
        </div>

        {/* Informações detalhadas de Entrega */}
        {isDelivery && fullAddress && (
          <div className="bg-surface-container/60 border border-outline-variant/20 rounded-xl p-2.5 space-y-1">
            <div className="flex items-start justify-between gap-1">
              <span className="text-xs font-bold text-primary flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                Endereço de Entrega:
              </span>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  `${fullAddress}, Jaborandi - SP`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-bold text-primary hover:underline inline-flex items-center gap-0.5 shrink-0"
              >
                <ExternalLink className="w-3 h-3" />
                Maps
              </a>
            </div>
            <p className="text-xs font-medium text-on-surface leading-tight">
              {fullAddress}
            </p>
          </div>
        )}

        {/* Contato do Cliente */}
        {phoneClean && (
          <div className="flex items-center gap-2 pt-0.5">
            <a
              href={`https://wa.me/55${phoneClean}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-bold text-tertiary hover:underline bg-surface-container px-2 py-0.5 rounded-md"
            >
              <MessageSquare className="w-3 h-3" />
              WhatsApp ({phoneClean.slice(-4)})
            </a>
            <a
              href={`tel:${phoneClean}`}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-on-surface-variant hover:text-on-surface bg-surface-container px-2 py-0.5 rounded-md"
            >
              <Phone className="w-3 h-3" />
              Ligar
            </a>
          </div>
        )}

        {/* Pagamento e Troco */}
        <div className="text-[11px] text-on-surface-variant bg-surface-container/40 p-2 rounded-xl flex items-center justify-between border border-outline-variant/10">
          <span>
            Pag: <strong>{formatPaymentMethod(order.paymentMethod)}</strong> •{" "}
            <span className="font-bold text-on-surface">{formatCurrency(order.total)}</span>
          </span>
          {order.paymentMethod === "CASH" && (
            <span className="text-primary font-bold">
              {order.changeFor && order.changeFor > order.total
                ? `Troco p/ ${formatCurrency(order.changeFor)}`
                : "Sem troco"}
            </span>
          )}
        </div>
      </div>

      {/* Itens do Pedido */}
      <div className="space-y-1.5 mb-2.5">
        {order.items.map((item) => {
          let sides: string[] = [];
          try {
            if (item.includedSides) sides = JSON.parse(item.includedSides);
          } catch {
            // ignora
          }

          return (
            <div
              key={item.id}
              className="rounded-xl bg-surface-container-low p-2 border border-outline-variant/20"
            >
              <div className="flex items-center justify-between mb-0.5">
                <span className="font-label-md text-label-md text-on-surface font-bold">
                  {item.quantity}x {item.productName}
                </span>
                {item.size && (
                  <span className="px-1.5 py-0.2 rounded-md bg-secondary-fixed text-on-secondary-fixed font-label-sm text-[11px] font-bold">
                    {item.size}
                  </span>
                )}
              </div>
              {sides.length > 0 && (
                <div className="text-[11px] text-on-surface-variant leading-tight">
                  <span className="font-semibold text-on-surface">Guarnições:</span>{" "}
                  {sides.join(", ")}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Observações da Comanda */}
      {order.notes && (
        <div className="p-2 rounded-xl bg-tertiary-fixed/30 text-on-tertiary-fixed text-xs font-semibold mb-2.5 border border-tertiary-fixed">
          OBS: {order.notes}
        </div>
      )}

      {/* Botões de Ação por Coluna */}
      <div className="mt-auto pt-2 border-t border-outline-variant/20 flex items-center gap-2">
        {/* Coluna AGUARDANDO */}
        {order.status === "AGUARDANDO" && (
          <button
            onClick={() => onUpdateStatus(order.id, "NO_FOGAO")}
            disabled={isUpdating}
            className="w-full min-h-[42px] py-2 px-3 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50"
          >
            <span>Mover para o Fogão</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}

        {/* Coluna NO_FOGAO */}
        {order.status === "NO_FOGAO" && (
          <>
            <button
              onClick={() => onUpdateStatus(order.id, "AGUARDANDO")}
              disabled={isUpdating}
              className="min-h-[42px] px-2.5 rounded-xl bg-surface-container hover:bg-surface-container-highest text-on-surface-variant font-label-sm text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
              title="Voltar para Aguardando"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar</span>
            </button>
            <button
              onClick={() => onUpdateStatus(order.id, "PRONTO")}
              disabled={isUpdating}
              className="flex-1 min-h-[42px] py-2 px-3 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50"
            >
              <PackageCheck className="w-4 h-4" />
              <span>Concluir p/ Bancada</span>
            </button>
          </>
        )}

        {/* Coluna PRONTO */}
        {order.status === "PRONTO" && (
          <>
            <button
              onClick={() => onUpdateStatus(order.id, "NO_FOGAO")}
              disabled={isUpdating}
              className="min-h-[42px] px-2.5 rounded-xl bg-surface-container hover:bg-surface-container-highest text-on-surface-variant font-label-sm text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
              title="Voltar para No Fogão"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar</span>
            </button>
            {isDelivery ? (
              <button
                onClick={() => onUpdateStatus(order.id, "EM_ROTA")}
                disabled={isUpdating}
                className="flex-1 min-h-[42px] py-2 px-3 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50"
              >
                <Bike className="w-4 h-4" />
                <span>Saí para Entrega</span>
              </button>
            ) : (
              <button
                onClick={() => onUpdateStatus(order.id, "ENTREGUE")}
                disabled={isUpdating}
                className="flex-1 min-h-[42px] py-2 px-3 rounded-xl bg-secondary hover:bg-on-surface-variant text-on-secondary font-label-md text-label-md font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50"
              >
                <CheckCheck className="w-4 h-4" />
                <span>Entregar ao Balcão</span>
              </button>
            )}
          </>
        )}

        {/* Coluna EM_ROTA */}
        {order.status === "EM_ROTA" && (
          <>
            <button
              onClick={() => onUpdateStatus(order.id, "PRONTO")}
              disabled={isUpdating}
              className="min-h-[42px] px-2.5 rounded-xl bg-surface-container hover:bg-surface-container-highest text-on-surface-variant font-label-sm text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
              title="Voltar para Pronto"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar</span>
            </button>
            <button
              onClick={() => onUpdateStatus(order.id, "ENTREGUE")}
              disabled={isUpdating}
              className="flex-1 min-h-[42px] py-2 px-3 rounded-xl bg-secondary hover:bg-on-surface-variant text-on-secondary font-label-md text-label-md font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Marcar como Entregue</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Componente de Coluna Droppable
// -------------------------------------------------------------
interface DroppableColumnProps {
  id: string;
  status: Order["status"];
  title: string;
  count: number;
  badgeColor: string;
  icon: React.ElementType;
  emptyText: string;
  children: React.ReactNode;
}

function DroppableColumn({
  id,
  status,
  title,
  count,
  badgeColor,
  icon: Icon,
  emptyText,
  children,
}: DroppableColumnProps) {
  const { isOver, setNodeRef } = useDroppable({
    id,
    data: { status },
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col rounded-3xl p-3.5 md:p-4 shadow-sm border transition-all min-h-[550px] ${
        isOver
          ? "ring-2 ring-primary bg-primary/5 border-primary"
          : "bg-surface-container-low border-outline-variant/30"
      }`}
    >
      {/* Cabeçalho da Coluna */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-outline-variant/20">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-primary" />
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold text-base md:text-lg">
            {title}
          </h2>
        </div>
        <span
          className={`px-2.5 py-0.5 rounded-full font-label-md text-label-md font-bold shadow-xs ${badgeColor}`}
        >
          {count}
        </span>
      </div>

      {/* Lista de Cartões */}
      <div className="flex flex-col gap-3 flex-1">
        {children}

        {count === 0 && (
          <div className="text-center py-16 text-on-surface-variant my-auto">
            <CheckCircle2 className="w-8 h-8 mb-2 mx-auto text-on-surface-variant/40" />
            <p className="font-label-md text-xs">{emptyText}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Página Principal do KDS
// -------------------------------------------------------------
export default function KdsPage() {
  const [data, setData] = useState<KdsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<"ALL" | "DELIVERY" | "RETIRADA">("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState(new Date());
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [mobileTab, setMobileTab] = useState<"AGUARDANDO" | "NO_FOGAO" | "PRONTO" | "EM_ROTA">("AGUARDANDO");
  const [showCompleted, setShowCompleted] = useState(false);

  // Sensores DnD com constraints para não conflitar com cliques
  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: {
      distance: 5,
    },
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 150,
      tolerance: 5,
    },
  });
  const sensors = useSensors(pointerSensor, touchSensor);

  const fetchKds = async () => {
    try {
      const res = await fetch("/api/admin/orders");
      if (res.ok) {
        const json = await res.json();
        setData(json);
        setLastSync(new Date());
      }
    } catch (err) {
      console.error("Erro ao sincronizar KDS:", err);
    } finally {
      setLoading(false);
    }
  };

  // Polling a cada 5 segundos
  useEffect(() => {
    fetchKds();
    const interval = setInterval(() => {
      fetchKds();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Atualização de status com reversão otimista em caso de erro
  const handleUpdateStatus = async (orderId: string, nextStatus: Order["status"]) => {
    if (!data) return;

    const previousOrders = [...data.orders];
    const targetOrder = data.orders.find((o) => o.id === orderId);
    if (!targetOrder) return;

    // Validação local: pedidos de retirada não podem ir para EM_ROTA
    const isDelivery = targetOrder.orderType === "DELIVERY" || targetOrder.deliveryType === "ENTREGA";
    if (nextStatus === "EM_ROTA" && !isDelivery) {
      setErrorMessage(
        `O Pedido #${targetOrder.orderNumber} é Retirada no Balcão e não pode entrar Em Rota.`
      );
      setTimeout(() => setErrorMessage(null), 4000);
      return;
    }

    // Atualização otimista imediata na interface
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        orders: prev.orders.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o)),
      };
    });

    setUpdatingId(orderId);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (res.ok) {
        const json = await res.json();
        if (nextStatus === "ENTREGUE") {
          setSuccessMessage(`Pedido #${targetOrder.orderNumber} marcado como entregue! Pontos creditados ao cliente.`);
          setTimeout(() => setSuccessMessage(null), 4000);
        }
        // Recarrega dados reais do banco
        fetchKds();
      } else {
        const errJson = await res.json().catch(() => ({}));
        // Reversão do estado em caso de erro
        setData((prev) => (prev ? { ...prev, orders: previousOrders } : prev));
        setErrorMessage(errJson.error || "Erro ao atualizar status do pedido.");
        setTimeout(() => setErrorMessage(null), 4000);
      }
    } catch {
      // Reversão em caso de erro de conexão
      setData((prev) => (prev ? { ...prev, orders: previousOrders } : prev));
      setErrorMessage("Falha de conexão com o servidor. A alteração foi desfeita.");
      setTimeout(() => setErrorMessage(null), 4000);
    } finally {
      setUpdatingId(null);
    }
  };

  // Manipuladores de Drag & Drop
  const handleDragStart = (event: DragStartEvent) => {
    const orderId = event.active.id as string;
    const found = data?.orders.find((o) => o.id === orderId);
    if (found) {
      setActiveOrder(found);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveOrder(null);

    if (!over || !data) return;

    const orderId = active.id as string;
    const draggedOrder = data.orders.find((o) => o.id === orderId);
    if (!draggedOrder) return;

    let targetStatus: Order["status"] | null = null;
    const overId = String(over.id);

    if (overId.includes("AGUARDANDO")) targetStatus = "AGUARDANDO";
    else if (overId.includes("NO_FOGAO")) targetStatus = "NO_FOGAO";
    else if (overId.includes("PRONTO")) targetStatus = "PRONTO";
    else if (overId.includes("EM_ROTA")) targetStatus = "EM_ROTA";
    else if (overId.includes("ENTREGUE")) targetStatus = "ENTREGUE";

    if (!targetStatus || targetStatus === draggedOrder.status) return;

    handleUpdateStatus(draggedOrder.id, targetStatus);
  };

  const orders = data?.orders || [];
  const filteredOrders = orders.filter((o) => {
    const isDelivery = o.orderType === "DELIVERY" || o.deliveryType === "ENTREGA";
    if (filterType === "DELIVERY") return isDelivery;
    if (filterType === "RETIRADA") return !isDelivery;
    return true;
  });

  const colAguardando = filteredOrders.filter((o) => o.status === "AGUARDANDO");
  const colNoFogao = filteredOrders.filter((o) => o.status === "NO_FOGAO");
  const colPronto = filteredOrders.filter((o) => o.status === "PRONTO");
  const colEmRota = filteredOrders.filter((o) => o.status === "EM_ROTA");
  const colEntregues = filteredOrders.filter((o) => o.status === "ENTREGUE");

  return (
    <div className="min-h-screen bg-surface font-body-md text-on-surface antialiased flex">
      <AdminSidebar />

      {/* Main Container deslocado pela largura da sidebar desktop */}
      <div className="pl-72 flex-1 flex flex-col min-w-0">
        {/* Top Header Fixo */}
        <header className="h-20 bg-surface/90 backdrop-blur-xl border-b border-outline-variant/20 z-40 flex items-center justify-between px-8 sticky top-0">
          <div className="flex items-center gap-space-md">
            <div className="flex items-center gap-space-xs text-on-surface-variant font-label-md">
              <RefreshCw className={`w-5 h-5 text-tertiary ${loading ? "animate-spin" : ""}`} />
              <span>
                Sincronizado às{" "}
                {lastSync.toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}{" "}
                • Polling 5s
              </span>
            </div>
          </div>

          <div className="flex items-center gap-space-lg">
            <div className="flex items-center gap-space-xs bg-surface-container-low px-space-md py-space-xs rounded-full border border-outline-variant/30">
              <Clock className="w-4 h-4 text-primary" />
              <span className="font-label-md text-label-md text-on-surface font-bold">
                10h30 às 13h00
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                | Turno Almoço Jaborandi
              </span>
            </div>

            <div className="flex items-center gap-space-sm pl-space-md border-l border-outline-variant/20">
              <div className="flex flex-col text-right">
                <span className="font-label-md text-label-md text-on-surface font-bold">
                  Comissário do Fogão
                </span>
                <span className="font-label-sm text-label-sm text-primary font-bold">
                  Painel de Operações
                </span>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold shadow-sm">
                <Flame className="w-5 h-5" />
              </div>
            </div>
          </div>
        </header>

        {/* Conteúdo Principal do KDS */}
        <main className="p-6 md:p-8 flex-1 flex flex-col">
          {/* Sub-header Operacional / KDS Controls Bar */}
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6">
            <div className="flex flex-col">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center p-2.5 rounded-2xl bg-primary text-on-primary shadow-sm">
                  <CookingPot className="w-6 h-6" />
                </span>
                <div>
                  <h1 className="font-headline-md text-headline-md text-on-surface tracking-tight font-bold">
                    Fila de Produção e Entregas (KDS)
                  </h1>
                  <p className="font-body-md text-body-md text-on-surface-variant flex items-center gap-2 flex-wrap text-sm">
                    <span className="font-bold text-tertiary">
                      Fogão a Lenha & Expedição
                    </span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1 font-bold text-on-surface">
                      <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                      {colAguardando.length + colNoFogao.length + colPronto.length + colEmRota.length} ativos
                    </span>
                    <span>•</span>
                    <span className="text-tertiary font-semibold">{colAguardando.length} na fila</span>
                    <span>•</span>
                    <span className="text-primary font-semibold">{colNoFogao.length} no fogo</span>
                    <span>•</span>
                    <span className="text-secondary font-semibold">{colPronto.length} prontos</span>
                    <span>•</span>
                    <span className="text-primary font-bold">{colEmRota.length} em rota</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Filtros e Atalho Novo Pedido Balcão */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center bg-surface-container-high p-1 rounded-xl shadow-inner border border-outline-variant/30">
                <button
                  onClick={() => setFilterType("ALL")}
                  className={`px-3 py-1.5 rounded-lg font-label-md text-xs md:text-sm transition-all cursor-pointer ${
                    filterType === "ALL"
                      ? "bg-surface-container-lowest text-on-surface font-bold shadow-sm"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  Todos ({orders.length})
                </button>
                <button
                  onClick={() => setFilterType("DELIVERY")}
                  className={`px-3 py-1.5 rounded-lg font-label-md text-xs md:text-sm transition-all cursor-pointer ${
                    filterType === "DELIVERY"
                      ? "bg-surface-container-lowest text-on-surface font-bold shadow-sm"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  Delivery
                </button>
                <button
                  onClick={() => setFilterType("RETIRADA")}
                  className={`px-3 py-1.5 rounded-lg font-label-md text-xs md:text-sm transition-all cursor-pointer ${
                    filterType === "RETIRADA"
                      ? "bg-surface-container-lowest text-on-surface font-bold shadow-sm"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  Balcão / Retirada
                </button>
              </div>

              <Link
                href="/admin/pdv"
                className="h-10 px-4 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-md text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Novo Pedido Balcão (PDV)</span>
              </Link>
            </div>
          </div>

          {/* Banner de Erro visual (sem alert do navegador) */}
          {errorMessage && (
            <div className="mb-4 p-3.5 bg-error/15 text-error border border-error/30 rounded-2xl flex items-center gap-2 text-sm shadow-sm animate-fade-in">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <div>
                <strong className="font-bold">Aviso: </strong>
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          {/* Banner de Sucesso visual */}
          {successMessage && (
            <div className="mb-4 p-3.5 bg-secondary-container text-on-secondary-container border border-secondary/30 rounded-2xl flex items-center gap-2 text-sm shadow-sm animate-fade-in">
              <CheckCheck className="w-5 h-5 shrink-0 text-secondary" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Métricas Reais do Banco */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 mb-6">
            <div className="p-3.5 rounded-2xl bg-surface-container-lowest shadow-sm flex items-center justify-between border border-outline-variant/30">
              <div>
                <span className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider font-bold">
                  Pedidos Ativos
                </span>
                <div className="font-headline-sm text-lg font-bold text-on-surface mt-0.5">
                  {colAguardando.length + colNoFogao.length + colPronto.length + colEmRota.length}
                </div>
              </div>
              <div className="h-9 w-9 rounded-full bg-primary-fixed flex items-center justify-center text-primary">
                <CookingPot className="w-4 h-4" />
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-surface-container-lowest shadow-sm flex items-center justify-between border border-outline-variant/30">
              <div>
                <span className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider font-bold">
                  Aguardando
                </span>
                <div className="font-headline-sm text-lg font-bold text-tertiary mt-0.5">
                  {colAguardando.length}
                </div>
              </div>
              <div className="h-9 w-9 rounded-full bg-tertiary-fixed flex items-center justify-center text-tertiary">
                <Hourglass className="w-4 h-4" />
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-surface-container-lowest shadow-sm flex items-center justify-between border border-outline-variant/30">
              <div>
                <span className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider font-bold">
                  No Fogão
                </span>
                <div className="font-headline-sm text-lg font-bold text-primary mt-0.5">
                  {colNoFogao.length}
                </div>
              </div>
              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Flame className="w-4 h-4" />
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-surface-container-lowest shadow-sm flex items-center justify-between border border-outline-variant/30">
              <div>
                <span className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider font-bold">
                  Em Rota (Moto)
                </span>
                <div className="font-headline-sm text-lg font-bold text-secondary mt-0.5">
                  {colEmRota.length}
                </div>
              </div>
              <div className="h-9 w-9 rounded-full bg-secondary-fixed flex items-center justify-center text-secondary">
                <Bike className="w-4 h-4" />
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-surface-container-lowest shadow-sm flex items-center justify-between border border-outline-variant/30 col-span-2 lg:col-span-1">
              <div>
                <span className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider font-bold">
                  Marmitas Hoje
                </span>
                <div className="font-headline-sm text-lg font-bold text-on-surface mt-0.5">
                  {data?.metrics.marmitasEntreguesHoje || 0}
                </div>
              </div>
              <div className="h-9 w-9 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Mobile Tab Selector (visível apenas em telas menores que xl) */}
          <div className="flex xl:hidden overflow-x-auto gap-2 p-1.5 bg-surface-container-high rounded-2xl mb-4 scrollbar-none">
            {[
              { id: "AGUARDANDO", label: "Aguardando", count: colAguardando.length, icon: Hourglass },
              { id: "NO_FOGAO", label: "No Fogão", count: colNoFogao.length, icon: Flame },
              { id: "PRONTO", label: "Pronto", count: colPronto.length, icon: PackageCheck },
              { id: "EM_ROTA", label: "Em Rota", count: colEmRota.length, icon: Bike },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setMobileTab(tab.id as typeof mobileTab)}
                className={`flex-1 min-w-[110px] py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  mobileTab === tab.id
                    ? "bg-surface-container-lowest text-on-surface shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                <span className="px-1.5 py-0.2 rounded-full bg-surface-container text-[11px]">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* DndContext com 4 Colunas do Kanban */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 items-start flex-1">
              {/* COLUNA 1: AGUARDANDO MONTAGEM */}
              <div className={`${mobileTab === "AGUARDANDO" ? "block" : "hidden xl:block"}`}>
                <DroppableColumn
                  id="col-AGUARDANDO"
                  status="AGUARDANDO"
                  title="Aguardando Montagem"
                  count={colAguardando.length}
                  badgeColor="bg-tertiary-fixed text-on-tertiary-fixed"
                  icon={Hourglass}
                  emptyText="Nenhum pedido aguardando montagem."
                >
                  {colAguardando.map((order) => (
                    <DraggableOrderCard
                      key={order.id}
                      order={order}
                      onUpdateStatus={handleUpdateStatus}
                      isUpdating={updatingId === order.id}
                    />
                  ))}
                </DroppableColumn>
              </div>

              {/* COLUNA 2: NO FOGÃO A LENHA */}
              <div className={`${mobileTab === "NO_FOGAO" ? "block" : "hidden xl:block"}`}>
                <DroppableColumn
                  id="col-NO_FOGAO"
                  status="NO_FOGAO"
                  title="No Fogão a Lenha"
                  count={colNoFogao.length}
                  badgeColor="bg-primary-container text-on-primary-container"
                  icon={Flame}
                  emptyText="Nenhuma marmita no fogão no momento."
                >
                  {colNoFogao.map((order) => (
                    <DraggableOrderCard
                      key={order.id}
                      order={order}
                      onUpdateStatus={handleUpdateStatus}
                      isUpdating={updatingId === order.id}
                    />
                  ))}
                </DroppableColumn>
              </div>

              {/* COLUNA 3: PRONTO NA BANCADA */}
              <div className={`${mobileTab === "PRONTO" ? "block" : "hidden xl:block"}`}>
                <DroppableColumn
                  id="col-PRONTO"
                  status="PRONTO"
                  title="Pronto na Bancada"
                  count={colPronto.length}
                  badgeColor="bg-tertiary-fixed-dim text-on-tertiary-fixed font-bold"
                  icon={PackageCheck}
                  emptyText="Nenhum pedido pronto aguardando despacho."
                >
                  {colPronto.map((order) => (
                    <DraggableOrderCard
                      key={order.id}
                      order={order}
                      onUpdateStatus={handleUpdateStatus}
                      isUpdating={updatingId === order.id}
                    />
                  ))}
                </DroppableColumn>
              </div>

              {/* COLUNA 4: EM ROTA COM ENTREGADOR */}
              <div className={`${mobileTab === "EM_ROTA" ? "block" : "hidden xl:block"}`}>
                <DroppableColumn
                  id="col-EM_ROTA"
                  status="EM_ROTA"
                  title="Em Rota (A Caminho)"
                  count={colEmRota.length}
                  badgeColor="bg-secondary-fixed text-on-secondary-fixed font-bold"
                  icon={Bike}
                  emptyText="Nenhum pedido em rota com o entregador."
                >
                  {colEmRota.map((order) => (
                    <DraggableOrderCard
                      key={order.id}
                      order={order}
                      onUpdateStatus={handleUpdateStatus}
                      isUpdating={updatingId === order.id}
                    />
                  ))}
                </DroppableColumn>
              </div>
            </div>

            {/* Drag Overlay para efeito visual durante arrasto */}
            <DragOverlay>
              {activeOrder ? (
                <div className="w-80 md:w-96 shadow-2xl rounded-2xl bg-surface-container-lowest border-2 border-primary p-4 rotate-1 pointer-events-none opacity-95">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-title-md text-title-md font-bold text-primary">
                      #{activeOrder.orderNumber}
                    </span>
                    <span className="font-label-sm text-xs px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-bold">
                      {activeOrder.deliveryType === "ENTREGA" ? "Delivery" : "Balcão"}
                    </span>
                  </div>
                  <p className="font-body-md text-sm text-on-surface font-bold truncate">
                    {activeOrder.customerName}
                  </p>
                  <p className="text-xs text-on-surface-variant mt-1">
                    {activeOrder.items.length} item(ns) • {formatCurrency(activeOrder.total)}
                  </p>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>

          {/* Gaveta de Pedidos Concluídos Hoje */}
          <div className="mt-8 pt-6 border-t border-outline-variant/20">
            <button
              onClick={() => setShowCompleted(!showCompleted)}
              className="w-full flex items-center justify-between p-4 rounded-2xl bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <CheckCheck className="w-5 h-5 text-secondary" />
                <span className="font-title-md text-title-md text-on-surface font-bold">
                  Pedidos Concluídos Hoje ({colEntregues.length})
                </span>
                <span className="text-xs text-on-surface-variant">
                  • Pontos creditados automaticamente
                </span>
              </div>
              <div className="flex items-center gap-1 text-sm text-on-surface-variant font-semibold">
                <span>{showCompleted ? "Recolher" : "Expandir lista"}</span>
                {showCompleted ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </div>
            </button>

            {showCompleted && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 animate-fade-in">
                {colEntregues.map((order) => (
                  <div
                    key={order.id}
                    className="p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/30 flex items-center justify-between gap-3 shadow-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-on-surface">#{order.orderNumber}</span>
                        <span className="text-xs px-2 py-0.2 rounded-md bg-surface-container text-on-surface-variant font-medium">
                          {order.customerName}
                        </span>
                      </div>
                      <div className="text-xs text-on-surface-variant mt-1">
                        {order.deliveryType === "ENTREGA" ? "🏍️ Delivery" : "🏪 Balcão"} •{" "}
                        {formatCurrency(order.total)} ({formatPaymentMethod(order.paymentMethod)})
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center gap-1 text-xs text-secondary font-bold">
                        <CheckCheck className="w-3.5 h-3.5" /> Entregue
                      </span>
                      {order.pointsEarned ? (
                        <div className="text-[11px] text-tertiary font-bold">
                          +{order.pointsEarned} pts
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}

                {colEntregues.length === 0 && (
                  <div className="col-span-full py-8 text-center text-sm text-on-surface-variant">
                    Nenhum pedido marcado como entregue hoje ainda.
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
