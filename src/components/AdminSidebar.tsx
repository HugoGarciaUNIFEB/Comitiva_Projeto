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
  Menu,
  X,
} from "lucide-react";

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  // Fecha o menu mobile quando a rota muda
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch (err) {
      console.error("Erro ao deslogar:", err);
    }
  };

  const navContent = (
    <div className="flex flex-col justify-between h-full">
      <div className="flex flex-col">
        {/* Brand Header */}
        <div className="h-20 px-space-md flex items-center justify-between bg-inverse-surface border-b border-surface-container-highest/20">
          <div className="flex items-center gap-space-sm">
            <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center font-bold shadow-sm shrink-0">
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
          {/* Botão de fechar visível no mobile */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden p-2 rounded-xl text-outline-variant hover:text-surface-bright hover:bg-surface-container-highest/20 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
            aria-label="Fechar menu"
          >
            <X className="w-6 h-6" />
          </button>
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
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-space-sm px-space-md py-3 rounded-xl transition-all min-h-[44px] ${
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
            className="flex items-center gap-space-sm px-space-md py-2.5 rounded-xl text-outline-variant hover:text-surface-bright hover:bg-surface-container-highest/10 transition-colors min-h-[44px]"
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
          className="w-full py-2.5 px-4 rounded-xl text-outline-variant hover:text-error hover:bg-error/10 transition-colors flex items-center justify-center gap-2 font-label-md cursor-pointer font-semibold min-h-[44px]"
        >
          <LogOut className="w-4 h-4" />
          <span>Sair do Painel</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Barra Superior Mobile/Tablet (visível apenas em telas < 1024px) */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-inverse-surface text-inverse-on-surface z-40 px-4 flex items-center justify-between border-b border-surface-container-highest/20 shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center font-bold shadow-xs shrink-0">
            <Flame className="w-5 h-5 text-on-primary" />
          </div>
          <span className="font-bold text-surface-bright text-base font-serif truncate max-w-[170px] sm:max-w-none">
            Fogo de Chão • Admin
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Status rápido pill */}
          <span
            className={`hidden xs:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
              houseStatus.isOpen
                ? "bg-surface-container-highest/20 text-surface-bright"
                : "bg-surface-container-highest/10 text-outline-variant"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                houseStatus.isOpen ? "bg-primary" : "bg-outline-variant"
              }`}
            />
            {houseStatus.label}
          </span>

          {/* Botão Hambúrguer Mobile */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 min-h-[44px] min-w-[44px] rounded-xl text-surface-bright hover:bg-surface-container-highest/20 flex items-center justify-center transition-colors border border-surface-container-highest/30 active:scale-95 cursor-pointer"
            aria-label="Abrir menu de navegação administrativa"
          >
            <Menu className="w-6 h-6 text-surface-bright" />
          </button>
        </div>
      </div>

      {/* 2. Drawer Mobile (recolhível com backdrop) */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="fixed inset-y-0 left-0 max-w-full flex pr-10">
            <aside className="w-72 max-w-[85vw] bg-inverse-surface text-inverse-on-surface shadow-2xl flex flex-col justify-between border-r border-surface-container-highest/20 animate-slide-right">
              {navContent}
            </aside>
          </div>
        </div>
      )}

      {/* 3. Sidebar Fixa Desktop (≥1024px) - 100% Preservada */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-72 bg-inverse-surface text-inverse-on-surface z-50 flex-col justify-between shadow-xl">
        {navContent}
      </aside>
    </>
  );
}
