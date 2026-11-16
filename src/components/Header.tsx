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

  // Busca status de autenticação do usuário de forma estável
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
    { href: "/", label: "Cardápio Diário" },
    { href: "/fidelidade", label: "Fidelidade" },
    { href: "/roleta", label: "Roleta da Sorte" },
    { href: "/sobre", label: "Sobre & Localização" },
  ];

  return (
    <header className="fixed top-0 w-full z-50 bg-surface/95 backdrop-blur-md shadow-[0_2px_12px_-2px_rgba(74,46,43,0.12)] border-b border-outline-variant/20">
      {/* Top Banner de Horário de Pico e Entrega */}
      <div className="bg-tertiary text-on-tertiary py-1.5 px-margin-lg text-center font-label-md text-label-md font-semibold">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
          <CookingPot className="w-4 h-4 text-tertiary-fixed-dim shrink-0" />
          <span>
            Almoço quentinho saindo do fogão a lenha! Horário de entrega: 10h30 às 13h00 em
            Jaborandi - SP • Faça seu pedido antecipado!
          </span>
        </div>
      </div>

      {/* Barra Principal de Navegação */}
      <div className="h-20 max-w-7xl mx-auto px-margin-lg flex items-center justify-between gap-space-lg">
        {/* Logotipo e Identidade da Marca */}
        <Link href="/" className="flex items-center gap-space-md shrink-0 group">
          <div className="h-12 w-auto relative flex items-center justify-center p-1 group-hover:scale-105 transition-transform">
            <SafeImage
              alt="Comitiva Fogo de Chão Logo"
              className="h-11 w-auto object-contain"
              src="/images/logo_comitiva.svg"
              fallbackSrc="/images/logo_comitiva.png"
            />
          </div>
        </Link>

        {/* Links Desktop */}
        <nav className="hidden lg:flex items-center gap-space-sm">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg font-label-lg text-label-lg transition-colors ${
                  isActive
                    ? "bg-primary-container text-on-primary-container font-bold shadow-sm"
                    : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Ações: Painel Admin (se admin), Sacola e Usuário */}
        <div className="flex items-center gap-space-md shrink-0">
          {user?.role === "admin" && (
            <Link
              href="/admin"
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-secondary text-on-secondary font-label-md text-label-md font-bold shadow-sm hover:opacity-95 transition-opacity"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Painel KDS</span>
            </Link>
          )}

          {/* Botão de Sacola / Carrinho */}
          <button
            type="button"
            onClick={onOpenCart || (() => useCartStore.getState().openCart())}
            aria-label="Abrir Sacola de Almoço"
            className="relative flex items-center gap-space-sm px-4 py-2.5 rounded-lg bg-primary text-on-primary hover:bg-primary-container transition-all shadow-md font-label-lg text-label-lg active:scale-95 cursor-pointer"
          >
            <ShoppingBag className="w-5 h-5" />
            <span className="hidden md:inline font-bold">Sacola</span>
            <span className="flex items-center justify-center h-5 w-5 rounded-full bg-tertiary-fixed-dim text-on-tertiary-fixed font-bold text-[11px] leading-none shadow-sm">
              {totalItemsCount}
            </span>
          </button>

          {/* Botão de Usuário / Login */}
          {authLoading ? (
            <div className="h-9 w-24 bg-surface-container-high rounded-xl animate-pulse" />
          ) : user ? (
            <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-xl border border-outline-variant/30 shadow-xs relative z-50">
              <Link
                href="/conta"
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-surface-container transition-colors"
                title="Acessar Minha Conta"
              >
                <div className="w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-xs">
                  <User className="w-3.5 h-3.5" />
                </div>
                <span className="hidden sm:inline font-label-md text-label-md text-on-surface truncate max-w-[110px] font-bold">
                  {user.name.split(" ")[0]}
                </span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-outline-variant hover:text-error hover:bg-error/10 transition-colors cursor-pointer"
                title="Sair da Conta"
                aria-label="Sair da Conta"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-space-xs px-3.5 py-2 rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-container-highest transition-colors font-label-lg text-label-lg font-semibold"
            >
              <LogIn className="w-4 h-4 text-primary" />
              <span>Entrar</span>
            </Link>
          )}

          {/* Menu Mobile Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-on-surface hover:bg-surface-container"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Menu Mobile Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-surface-container-lowest border-t border-outline-variant/30 px-margin-lg py-space-md shadow-lg flex flex-col gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`px-4 py-2.5 rounded-lg font-label-md ${
                pathname === link.href
                  ? "bg-primary text-on-primary font-bold"
                  : "text-on-surface hover:bg-surface-container"
              }`}
            >
              {link.label}
            </Link>
          ))}
          {!user ? (
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-2.5 rounded-lg bg-primary/10 text-primary font-bold flex items-center gap-2 mt-2"
            >
              <LogIn className="w-5 h-5" />
              Entrar ou Cadastrar
            </Link>
          ) : (
            <div className="flex flex-col gap-1 mt-2 pt-2 border-t border-outline-variant/20">
              <Link
                href="/conta"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2.5 rounded-lg bg-surface-container text-on-surface font-bold flex items-center gap-2"
              >
                <User className="w-5 h-5 text-primary" />
                <span>Minha Conta ({user.name.split(" ")[0]})</span>
              </Link>
              <button
                type="button"
                onClick={async () => {
                  setMobileMenuOpen(false);
                  await handleLogout();
                }}
                className="px-4 py-2.5 rounded-lg text-error hover:bg-error/10 font-bold flex items-center gap-2 text-left cursor-pointer"
              >
                <LogOut className="w-5 h-5" />
                <span>Sair da Conta</span>
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
