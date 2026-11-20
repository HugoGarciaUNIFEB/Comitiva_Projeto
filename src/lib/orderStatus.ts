export type OrderStatus =
  | "AGUARDANDO"
  | "NO_FOGAO"
  | "PRONTO"
  | "EM_ROTA"
  | "ENTREGUE"
  | "CANCELADO";

export interface StatusConfig {
  label: string;
  shortLabel: string;
  description: string;
  badgeClass: string;
  dotColor: string;
  stepIndex: number;
}

export const ORDER_STATUS_MAP: Record<OrderStatus, StatusConfig> = {
  AGUARDANDO: {
    label: "Aguardando Confirmação",
    shortLabel: "Aguardando",
    description: "Recebemos seu pedido! O comissário já está conferindo a comanda na cozinha.",
    badgeClass: "bg-surface-container-high text-on-surface",
    dotColor: "bg-outline-variant",
    stepIndex: 0,
  },
  NO_FOGAO: {
    label: "No Fogão a Lenha",
    shortLabel: "No Fogão",
    description: "O almoço já está no fogo de chão estalando na panela de ferro!",
    badgeClass: "bg-primary-container text-on-primary-container font-bold",
    dotColor: "bg-primary",
    stepIndex: 1,
  },
  PRONTO: {
    label: "Pronto na Bancada",
    shortLabel: "Pronto",
    description: "Sua marmita está montada, quentinha e embalada na bancada.",
    badgeClass: "bg-tertiary-fixed text-on-tertiary-fixed font-bold",
    dotColor: "bg-tertiary",
    stepIndex: 2,
  },
  EM_ROTA: {
    label: "A Caminho (Em Rota)",
    shortLabel: "A Caminho",
    description: "O entregador já saiu da base com sua marmita quentinha!",
    badgeClass: "bg-secondary-fixed text-on-secondary-fixed font-bold",
    dotColor: "bg-secondary",
    stepIndex: 3,
  },
  ENTREGUE: {
    label: "Entregue com Sucesso",
    shortLabel: "Entregue",
    description: "Pedido entregue! Bom almoço caipira e volte sempre à Comitiva.",
    badgeClass: "bg-surface-container text-on-surface font-semibold",
    dotColor: "bg-primary",
    stepIndex: 4,
  },
  CANCELADO: {
    label: "Pedido Cancelado",
    shortLabel: "Cancelado",
    description: "Este pedido foi cancelado.",
    badgeClass: "bg-error/15 text-error font-semibold",
    dotColor: "bg-error",
    stepIndex: -1,
  },
};

export function getOrderStatusConfig(status?: string, isDelivery: boolean = true): StatusConfig {
  if (!status) return ORDER_STATUS_MAP.AGUARDANDO;
  const normalized = status.toUpperCase() as OrderStatus;
  const baseConfig = ORDER_STATUS_MAP[normalized] || {
    label: status,
    shortLabel: status,
    description: "",
    badgeClass: "bg-surface-container text-on-surface",
    dotColor: "bg-surface-variant",
    stepIndex: 0,
  };

  if (!isDelivery) {
    if (normalized === "PRONTO") {
      return {
        ...baseConfig,
        label: "Pronto no Balcão",
        shortLabel: "Pronto",
        description: "Sua marmita está montada no balcão, quentinha e pronta para retirada!",
        stepIndex: 2,
      };
    }
    if (normalized === "ENTREGUE") {
      return {
        ...baseConfig,
        label: "Retirado no Balcão",
        shortLabel: "Retirado",
        description: "Pedido retirado no balcão! Bom almoço caipira e volte sempre à Comitiva.",
        stepIndex: 3,
      };
    }
  }

  return baseConfig;
}

export function getOrderStepIndex(status?: string, isDelivery: boolean = true): number {
  if (!status) return 0;
  const normalized = status.toUpperCase();
  if (normalized === "CANCELADO") return -1;
  if (!isDelivery) {
    if (normalized === "AGUARDANDO") return 0;
    if (normalized === "NO_FOGAO") return 1;
    if (normalized === "PRONTO") return 2;
    if (normalized === "ENTREGUE") return 3;
    return 0;
  }
  if (normalized === "AGUARDANDO") return 0;
  if (normalized === "NO_FOGAO") return 1;
  if (normalized === "PRONTO") return 2;
  if (normalized === "EM_ROTA") return 3;
  if (normalized === "ENTREGUE") return 4;
  return 0;
}

export function isTodaySaoPaulo(dateInput?: Date | string | null): boolean {
  if (!dateInput) return false;
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return false;
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const nowParts = formatter.formatToParts(new Date());
  const dateParts = formatter.formatToParts(d);

  const getVal = (parts: Intl.DateTimeFormatPart[], type: string) =>
    parts.find((p) => p.type === type)?.value;

  return (
    getVal(nowParts, "year") === getVal(dateParts, "year") &&
    getVal(nowParts, "month") === getVal(dateParts, "month") &&
    getVal(nowParts, "day") === getVal(dateParts, "day")
  );
}

export function getOrderStatusLabel(status?: string, isDelivery: boolean = true): string {
  return getOrderStatusConfig(status, isDelivery).label;
}

export function getOrderStatusShortLabel(status?: string, isDelivery: boolean = true): string {
  return getOrderStatusConfig(status, isDelivery).shortLabel;
}

export function getOrderStatusBadgeClass(status?: string, isDelivery: boolean = true): string {
  return getOrderStatusConfig(status, isDelivery).badgeClass;
}

export function formatCurrency(value?: number | null): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value || 0);
}

export function formatPaymentMethod(method?: string | null): string {
  if (!method) return "PIX";
  const upper = method.toUpperCase();
  if (upper === "CASH" || upper === "DINHEIRO") return "Dinheiro";
  if (upper === "CARD" || upper === "CARTAO" || upper === "CARTÃO") return "Cartão";
  if (upper === "PIX") return "PIX";
  return method;
}

export const ORDER_CHANNEL_MAP: Record<string, { label: string; badgeClass: string }> = {
  APP: { label: "Aplicativo", badgeClass: "bg-primary-fixed text-on-primary-fixed-variant" },
  COUNTER: { label: "Balcão", badgeClass: "bg-tertiary-fixed text-on-tertiary-fixed" },
  BALCAO: { label: "Balcão", badgeClass: "bg-tertiary-fixed text-on-tertiary-fixed" },
  WHATSAPP: { label: "WhatsApp", badgeClass: "bg-emerald-100 text-emerald-800" },
  PHONE: { label: "Telefone", badgeClass: "bg-sky-100 text-sky-800" },
  TELEFONE: { label: "Telefone", badgeClass: "bg-sky-100 text-sky-800" },
};

export function getOrderChannelLabel(channel?: string | null): string {
  if (!channel) return "Balcão";
  const upper = channel.toUpperCase();
  return ORDER_CHANNEL_MAP[upper]?.label || (upper === "BALCAO" ? "Balcão" : channel);
}

export function getOrderChannelBadgeClass(channel?: string | null): string {
  if (!channel) return "bg-surface-container text-on-surface-variant";
  const upper = channel.toUpperCase();
  return ORDER_CHANNEL_MAP[upper]?.badgeClass || "bg-surface-container text-on-surface-variant";
}

