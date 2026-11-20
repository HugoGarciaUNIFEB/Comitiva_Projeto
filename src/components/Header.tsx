"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCartStore } from "@/lib/store/useCartStore";
import SafeImage from "@/components/SafeImage";
import {
  Flame,
  ShoppingBag,
  User,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  X,
  CookingPot,
  Sparkles,
  Dices,
  BookOpen,
  UtensilsCrossed,
} from "lucide-react";

interface HeaderProps {
  onOpenCart?: () => void;
}

export default function Header({ onOpenCart }: HeaderProps) {
  const pathname = usePathname();
  const totalItemsCount = useCartStore((state) => state.getTotalItemsCount());

  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Busca status de autenticação do usuário
  useEffect(() => {
    let isMounted = true;
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted) return;
        if (data && data.authenticated) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      })
      .catch(() => {
        if (isMounted) setUser(null);
      })
      .finally(() => {
        if (isMounted) setAuthLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [pathname]);

  // Fecha o menu mobile quando a rota muda
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Erro ao deslogar:", err);
    } finally {
      setUser(null);
      window.location.href = "/";
    }
  };

  const navLinks = [
    { href: "/", label: "Cardápio Diário", icon: UtensilsCrossed },
    { href: "/fidelidade", label: "Fidelidade", icon: Sparkles },
    { href: "/roleta", label: "Roleta da Sorte", icon: Dices },
    { href: "/sobre", label: "Sobre & Localização", icon: BookOpen },
  ];

  return (
    <header className="fixed top-0 w-full z-50 bg-surface/95 backdrop-blur-md shadow-[0_2px_12px_-2px_rgba(74,46,43,0.12)] border-b border-outline-variant/20">
      {/* Top Banner de Horário de Pico e Entrega */}
      <div className="bg-tertiary text-on-tertiary py-1.5 px-3 sm:px-6 text-center text-xs sm:text-sm font-semibold">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-1.5 flex-wrap">
          <CookingPot className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-tertiary-fixed-dim shrink-0" />
          <span className="truncate max-w-[280px] sm:max-w-none">
            Almoço saindo do fogão a lenha! 10h30 às 13h00 em Jaborandi - SP
          </span>
        </div>
      </div>

      {/* Barra Principal de Navegação */}
      <div className="h-16 sm:h-20 max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-2 sm:gap-4">
        {/* Logotipo e Identidade da Marca */}
        <Link href="/" className="flex items-center gap-2 shrink-0 group">
          <div className="h-10 sm:h-12 w-auto relative flex items-center justify-center p-0.5 group-hover:scale-105 transition-transform">
            <SafeImage
              alt="Comitiva Fogo de Chão Logo"
              className="h-9 sm:h-11 w-auto object-contain"
              src="/images/logo_comitiva.svg"
              fallbackSrc="/images/logo_comitiva.png"
            />
          </div>
        </Link>

        {/* Links Desktop (≥1024px) */}
        <nav className="hidden lg:flex items-center gap-1.5">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-primary-container text-on-primary-container font-bold shadow-sm"
                    : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-medium"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Ações: Painel Admin, Sacola e Usuário */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {user?.role === "admin" && (
            <Link
              href="/admin"
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 min-h-[44px] rounded-lg bg-secondary text-on-secondary text-sm font-bold shadow-sm hover:opacity-95 transition-opacity"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Painel Administrativo</span>
            </Link>
          )}

          {/* Botão de Sacola / Carrinho (SEMPRE VISÍVEL no desktop e celular) */}
          <button
            type="button"
            onClick={onOpenCart || (() => useCartStore.getState().openCart())}
            aria-label="Abrir Sacola de Almoço"
            className="relative flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 min-h-[44px] min-w-[44px] rounded-xl bg-primary text-on-primary hover:bg-primary-container transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <ShoppingBag className="w-5 h-5 shrink-0" />
            <span className="hidden md:inline font-bold text-sm">Sacola</span>
            <span className="flex items-center justify-center h-5 w-5 rounded-full bg-tertiary-fixed-dim text-on-tertiary-fixed font-bold text-[11px] leading-none shadow-sm">
              {totalItemsCount}
            </span>
          </button>

          {/* Botão de Usuário / Login (Desktop) */}
          <div className="hidden sm:flex items-center">
            {authLoading ? (
              <div className="h-9 w-24 bg-surface-container-high rounded-xl animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-xl border border-outline-variant/30 shadow-xs relative z-50">
                <Link
                  href="/conta"
                  className="flex items-center gap-2 px-2.5 py-1.5 min-h-[40px] rounded-lg hover:bg-surface-container transition-colors"
                  title="Acessar Minha Conta"
                >
                  <div className="w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-xs">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-medium text-sm text-on-surface truncate max-w-[110px] font-bold">
                    {user.name.split(" ")[0]}
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-2 min-h-[40px] min-w-[40px] rounded-lg text-outline-variant hover:text-error hover:bg-error/10 transition-colors cursor-pointer flex items-center justify-center"
                  title="Sair da Conta"
                  aria-label="Sair da Conta"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-3.5 py-2 min-h-[44px] rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-container-highest transition-colors text-sm font-semibold"
              >
                <LogIn className="w-4 h-4 text-primary" />
                <span>Entrar</span>
              </Link>
            )}
          </div>

          {/* Menu Mobile Hambúrguer (≤1023px) */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2.5 min-h-[44px] min-w-[44px] rounded-xl text-on-surface hover:bg-surface-container active:scale-95 transition-all flex items-center justify-center border border-outline-variant/20"
            aria-label={mobileMenuOpen ? "Fechar menu" : "Abrir menu"}
          >
            {mobileMenuOpen ? <X className="w-6 h-6 text-primary" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Menu Mobile Gaveta / Dropdown com todas as rotas solicitadas */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-surface-container-lowest border-t border-outline-variant/30 px-4 py-4 shadow-xl flex flex-col gap-1.5 animate-in slide-in-from-top-2 duration-200">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 min-h-[44px] rounded-xl text-base transition-colors ${
                  isActive
                    ? "bg-primary text-on-primary font-bold shadow-sm"
                    : "text-on-surface hover:bg-surface-container font-medium"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-on-primary" : "text-primary"}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}

          {/* Minha Conta e Sair ou Entrar */}
          <div className="mt-2 pt-2 border-t border-outline-variant/20 flex flex-col gap-1.5">
            {user ? (
              <>
                <Link
                  href="/conta"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 min-h-[44px] rounded-xl bg-surface-container text-on-surface font-bold text-base hover:bg-surface-container-high transition-colors"
                >
                  <User className="w-5 h-5 text-primary" />
                  <span>Minha Conta ({user.name.split(" ")[0]})</span>
                </Link>

                {user.role === "admin" && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 min-h-[44px] rounded-xl bg-secondary text-on-secondary font-bold text-base hover:opacity-95 transition-opacity"
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    <span>Painel Administrativo</span>
                  </Link>
                )}

                <button
                  type="button"
                  onClick={async () => {
                    setMobileMenuOpen(false);
                    await handleLogout();
                  }}
                  className="flex items-center gap-3 px-4 py-3 min-h-[44px] rounded-xl text-error hover:bg-error/10 font-bold text-base text-left cursor-pointer transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sair da Conta</span>
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 px-4 py-3 min-h-[44px] rounded-xl bg-primary text-on-primary font-bold text-base shadow-sm hover:bg-primary-container transition-colors"
              >
                <LogIn className="w-5 h-5" />
                <span>Entrar ou Cadastrar</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
