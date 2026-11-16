"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CookingPot,
  CreditCard,
  UtensilsCrossed,
  BarChart3,
  ExternalLink,
  LogOut,
  Flame,
} from "lucide-react";

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    {
      href: "/admin",
      label: "Cozinha (KDS)",
      icon: CookingPot,
      badge: "Ao Vivo",
    },
    {
      href: "/admin/pdv",
      label: "Atendimento de Balcão (PDV)",
      icon: CreditCard,
    },
    {
      href: "/admin/cardapio",
      label: "Cardápio & Pausa",
      icon: UtensilsCrossed,
    },
    {
      href: "/admin/relatorios",
      label: "Relatórios & Métricas",
      icon: BarChart3,
    },
  ];

  const [houseStatus, setHouseStatus] = useState<{
    isOpen: boolean;
    isPeak: boolean;
    label: string;
    sublabel: string;
  }>({
    isOpen: false,
    isPeak: false,
    label: "Fechado",
    sublabel: "Abre às 10h30",
  });

  useEffect(() => {
    const checkHouseStatus = () => {
      const now = new Date();
      const mins = now.getHours() * 60 + now.getMinutes();
      // 10h30 = 630 min, 13h00 = 780 min
      // 11h15 = 675 min, 12h30 = 750 min
      const isOpen = mins >= 630 && mins <= 780;
      const isPeak = mins >= 675 && mins <= 750;

      if (!isOpen) {
        setHouseStatus({
          isOpen: false,
          isPeak: false,
          label: "Fechado",
          sublabel: "Abre às 10h30",
        });
      } else if (isPeak) {
        setHouseStatus({
          isOpen: true,
          isPeak: true,
          label: "Aberto",
          sublabel: "Pico Ativo (11h15 às 12h30)",
        });
      } else {
        setHouseStatus({
          isOpen: true,
          isPeak: false,
          label: "Aberto",
          sublabel: "Turno Almoço (10h30 às 13h00)",
        });
      }
    };

    checkHouseStatus();
    const interval = setInterval(checkHouseStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch (err) {
      console.error("Erro ao deslogar:", err);
    }
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-72 bg-inverse-surface text-inverse-on-surface z-50 flex flex-col justify-between shadow-xl">
      <div className="flex flex-col">
        {/* Brand Header */}
        <div className="h-20 px-space-md flex items-center gap-space-sm bg-inverse-surface border-b border-surface-container-highest/20">
          <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center font-bold shadow-sm">
            <Flame className="w-6 h-6 text-on-primary" />
          </div>
          <div className="flex flex-col">
            <span className="font-headline-sm text-headline-sm text-surface-bright tracking-tight leading-none font-bold">
              Fogo de Chão
            </span>
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline-variant mt-1 font-bold">
              Painel Administrativo
            </span>
          </div>
        </div>

        {/* Section Label */}
        <div className="px-space-md py-space-sm">
          <span className="font-label-sm text-label-sm uppercase text-outline-variant tracking-wider font-bold px-space-xs">
            Operação &amp; Salão
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1.5 px-space-sm">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-space-sm px-space-md py-3 rounded-xl transition-all ${
                  isActive
                    ? "bg-primary text-on-primary font-bold shadow-md"
                    : "text-inverse-on-surface hover:bg-surface-container-highest/20 hover:text-surface-bright"
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className="font-label-lg text-label-lg flex-1">{item.label}</span>
                {item.badge && (
                  <span
                    className={`px-2 py-0.5 rounded-full font-label-sm text-label-sm font-bold ${
                      isActive
                        ? "bg-surface-bright text-primary"
                        : "bg-tertiary-container text-on-tertiary-container"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="my-2 border-t border-surface-container-highest/15" />

          {/* Atalho para Loja do Cliente */}
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-space-sm px-space-md py-2.5 rounded-xl text-outline-variant hover:text-surface-bright hover:bg-surface-container-highest/10 transition-colors"
          >
            <UtensilsCrossed className="w-5 h-5 shrink-0" />
            <span className="font-label-md text-label-md flex-1">Abrir App do Cliente</span>
            <ExternalLink className="w-4 h-4 shrink-0" />
          </Link>
        </nav>
      </div>

      {/* Footer da Sidebar: Status da Casa e Botão Sair */}
      <div className="p-space-md flex flex-col gap-space-sm">
        <div className="p-space-md rounded-2xl bg-surface-container-highest/10 border border-surface-container-highest/15 flex flex-col gap-space-xs">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-outline-variant font-bold uppercase tracking-wide">
              Status da Casa
            </span>
            <span
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full font-label-sm text-label-sm font-bold ${
                houseStatus.isOpen
                  ? "bg-surface-container-highest/20 text-surface-bright"
                  : "bg-surface-container-highest/10 text-outline-variant"
              }`}
            >
              <span className="relative flex h-2 w-2">
                {houseStatus.isOpen && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                )}
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    houseStatus.isOpen
                      ? houseStatus.isPeak
                        ? "bg-primary"
                        : "bg-tertiary"
                      : "bg-outline-variant"
                  }`}
                />
              </span>
              {houseStatus.label}
            </span>
          </div>
          <div className="pt-1">
            <div className="font-label-md text-label-md text-surface-bright font-bold">
              {houseStatus.isPeak
                ? "Horário de Pico Ativo"
                : houseStatus.isOpen
                ? "Atendimento Normal"
                : "Fogão Desligado"}
            </div>
            <div className="font-body-sm text-body-sm text-outline-variant">
              {houseStatus.sublabel}
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full py-2.5 px-4 rounded-xl text-outline-variant hover:text-error hover:bg-error/10 transition-colors flex items-center justify-center gap-2 font-label-md cursor-pointer font-semibold"
        >
          <LogOut className="w-4 h-4" />
          <span>Sair do Painel</span>
        </button>
      </div>
    </aside>
  );
}
