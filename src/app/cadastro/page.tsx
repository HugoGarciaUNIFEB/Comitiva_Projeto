"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SafeImage from "@/components/SafeImage";
import {
  Flame,
  Sparkles,
  Bike,
  Dices,
  ShieldCheck,
  QrCode,
  AlertCircle,
  User,
  Phone,
  MessageSquare,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Clock,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  // Estados do formulário
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [optinMenu, setOptinMenu] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Máscara dinâmica de telefone brasileiro: (XX) XXXXX-XXXX
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, "");
    if (v.length > 11) v = v.substring(0, 11);

    if (v.length > 10) {
      v = v.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
    } else if (v.length > 6) {
      v = v.replace(/^(\d{2})(\d{4})(\d{0,4})$/, "($1) $2-$3");
    } else if (v.length > 2) {
      v = v.replace(/^(\d{2})(\d{0,5})$/, "($1) $2");
    } else if (v.length > 0) {
      v = v.replace(/^(\d*)$/, "($1");
    }
    setWhatsapp(v);
  };

  // Submissão do cadastro
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          whatsapp,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Erro ao realizar cadastro.");
        setLoading(false);
        return;
      }

      // Redireciona diretamente para a Roleta da Sorte para usar o giro de boas-vindas
      router.push("/roleta?welcome=true");
      router.refresh();
    } catch {
      setErrorMessage("Erro de conexão. Tente novamente.");
      setLoading(false);
    }
  };

  return (
    <main className="w-full min-h-screen flex items-center justify-center p-3 sm:p-6 md:p-margin-lg bg-background font-body-md text-on-surface overflow-x-hidden">
      <div className="flex flex-col w-full items-center justify-center py-4 sm:py-gutter-lg px-0 sm:px-margin">
        <div className="w-full max-w-5xl flex flex-col items-center">
          {/* Top Decorative Banner / Trust Bar */}
          <div className="w-full flex items-center justify-between mb-space-lg px-space-md opacity-90 hidden md:flex">
            <div className="flex items-center gap-space-xs text-on-surface-variant font-label-md">
              <Flame className="w-5 h-5 text-primary" />
              <span>Fogão a Lenha Tradicional</span>
            </div>
            <div className="flex items-center gap-space-xs text-on-surface-variant font-label-md">
              <Sparkles className="w-5 h-5 text-tertiary" />
              <span>Programa de Fidelidade Comitiva</span>
            </div>
            <div className="flex items-center gap-space-xs text-on-surface-variant font-label-md">
              <Bike className="w-5 h-5 text-primary" />
              <span>Entregas Rápidas em Jaborandi e Região</span>
            </div>
          </div>

          {/* Main Central Presentation Bento Layout */}
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-gutter-lg items-stretch">
            {/* Side Visual Storytelling & Perks (Left - 5 Cols on desktop) */}
            <div className="hidden lg:flex lg:col-span-5 flex-col justify-between p-space-xl bg-surface-container rounded-xl shadow-sm relative overflow-hidden border border-outline-variant/30">
              <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-primary/5 blur-2xl pointer-events-none"></div>
              <div className="absolute -left-12 -bottom-12 w-48 h-48 rounded-full bg-tertiary/10 blur-2xl pointer-events-none"></div>

              <div className="relative z-10 flex flex-col gap-space-md">
                <div className="inline-flex items-center gap-space-xs px-space-sm py-1 bg-surface-container-highest rounded-full w-fit">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                  <span className="font-label-sm uppercase tracking-wider text-on-surface-variant">
                    Comida Caipira Autêntica
                  </span>
                </div>
                <h2 className="font-headline-md text-headline-md text-on-surface">
                  O cheirinho de almoço quentinho espera por você.
                </h2>
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  Feito no tacho de ferro, com tempero fresco da roça e entrega rápida para matar
                  sua fome com fartura.
                </p>
              </div>

              {/* Wheel of Fortune Teaser Mini Card */}
              <div className="relative z-10 my-space-md p-space-md bg-surface-container-lowest rounded-xl shadow-sm flex items-center gap-space-md border border-outline-variant/30">
                <div className="w-14 h-14 rounded-full bg-tertiary-fixed flex items-center justify-center shrink-0 text-on-tertiary-fixed shadow-xs">
                  <Dices className="w-7 h-7 animate-spin" style={{ animationDuration: "8s" }} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-label-sm uppercase text-tertiary tracking-wide font-bold">
                    Bônus de Boas-Vindas
                  </span>
                  <p className="font-title-md text-title-md text-on-surface truncate">
                    Giro Grátis na Roleta
                  </p>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    Cadastre-se e ganhe 1 giro extra na Roleta da Sorte imediatamente!
                  </span>
                </div>
              </div>

              {/* Trust Badges Grid */}
              <div className="relative z-10 grid grid-cols-1 gap-space-sm pt-space-xs">
                <div className="flex items-center gap-space-sm text-on-surface">
                  <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center shrink-0 text-primary">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-md text-label-md">Sem Burocracia</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      Sem CPF, apenas nome e WhatsApp
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-space-sm text-on-surface">
                  <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center shrink-0 text-primary">
                    <Bike className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-md text-label-md">Entrega Rápida em Jaborandi</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      Marmita selada e fumegando no seu portão
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-space-sm text-on-surface">
                  <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center shrink-0 text-primary">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-md text-label-md">Pagamento Facilitado</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      PIX com baixa automática, cartão ou dinheiro
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Auth Card Box (Right - 7 Cols on desktop) */}
            <div className="col-span-1 lg:col-span-7 bg-surface-container-lowest p-space-md sm:p-space-xl rounded-xl shadow-md flex flex-col justify-between border border-outline-variant/30">
              <div>
                {/* Header Branding */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-44 h-24 relative mb-space-sm flex items-center justify-center">
                    <SafeImage
                      alt="Logotipo Comitiva Fogo de Chão"
                      className="w-full h-full object-contain"
                      src="/images/logo_comitiva.svg"
                    />
                  </div>
                  <span className="font-headline-sm text-headline-sm text-primary uppercase tracking-wide">
                    Comitiva Fogo de Chão
                  </span>
                  <h1 className="font-headline-md text-headline-md text-on-surface mt-1">
                    Crie sua conta na Comitiva!
                  </h1>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-space-xs max-w-md">
                    Cadastre-se agora para garantir seu almoço e resgatar bônus exclusivos.
                  </p>
                </div>

                {/* Mensagem de Erro */}
                {errorMessage && (
                  <div className="mt-space-sm p-space-sm bg-error-container text-on-error-container rounded-lg text-sm flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-error shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Form Area */}
                <form onSubmit={handleSubmit} className="mt-space-md flex flex-col gap-space-md">
                  {/* Field 1: Nome Completo */}
                  <div className="flex flex-col gap-1">
                    <label
                      htmlFor="name-input"
                      className="font-label-md text-label-md text-on-surface flex justify-between font-semibold"
                    >
                      <span>Nome Completo</span>
                      <span className="font-body-sm text-primary">Obrigatório</span>
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3 flex items-center pointer-events-none text-tertiary">
                        <User className="w-5 h-5" />
                      </div>
                      <input
                        id="name-input"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ex: Tiago Silveira"
                        required
                        className="w-full h-12 pl-10 pr-10 bg-surface rounded-lg font-body-lg text-body-lg text-on-surface border border-outline-variant/40 focus:border-primary focus:bg-surface-container-lowest outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Field 2: WhatsApp Input */}
                  <div className="flex flex-col gap-1">
                    <label
                      htmlFor="phone-input"
                      className="font-label-md text-label-md text-on-surface flex justify-between font-semibold"
                    >
                      <span>Número de Celular / WhatsApp</span>
                      <span className="font-body-sm text-primary">Obrigatório</span>
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3 flex items-center pointer-events-none text-tertiary">
                        <Phone className="w-5 h-5" />
                      </div>
                      <input
                        id="phone-input"
                        type="tel"
                        value={whatsapp}
                        onChange={handlePhoneChange}
                        placeholder="(17) 99999-9999"
                        required
                        className="w-full h-12 pl-10 pr-10 bg-surface rounded-lg font-body-lg text-body-lg text-on-surface border border-outline-variant/40 focus:border-primary focus:bg-surface-container-lowest outline-none transition-all"
                      />
                      <div className="absolute right-3 flex items-center text-primary">
                        <MessageSquare className="w-5 h-5" />
                      </div>
                    </div>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      Seu número será seu login único. Sem necessidade de CPF.
                    </span>
                  </div>

                  {/* Field 3: Senha de Acesso */}
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                      <label
                        htmlFor="password-input"
                        className="font-label-md text-label-md text-on-surface font-semibold"
                      >
                        Crie sua Senha de Acesso
                      </label>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        Mínimo 6 caracteres
                      </span>
                    </div>
                    <div className="relative flex items-center">
                      <div className="absolute left-3 flex items-center pointer-events-none text-tertiary">
                        <Lock className="w-5 h-5" />
                      </div>
                      <input
                        id="password-input"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Mínimo de 6 caracteres"
                        required
                        minLength={6}
                        className="w-full h-12 pl-10 pr-10 bg-surface rounded-lg font-body-lg text-body-lg text-on-surface border border-outline-variant/40 focus:border-primary focus:bg-surface-container-lowest outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 flex items-center text-on-surface-variant hover:text-on-surface"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Helper Checkbox: Cardápio do dia */}
                  <div className="flex items-start gap-space-xs mt-space-xs">
                    <input
                      id="optin-menu"
                      type="checkbox"
                      checked={optinMenu}
                      onChange={(e) => setOptinMenu(e.target.checked)}
                      className="mt-1 rounded text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                    />
                    <label
                      htmlFor="optin-menu"
                      className="font-body-sm text-body-sm text-on-surface-variant cursor-pointer"
                    >
                      Quero receber o cardápio do dia e avisos de entregas quentinhas no WhatsApp
                    </label>
                  </div>

                  {/* Primary Register CTA */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-14 bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg rounded-lg shadow-md transition-all flex items-center justify-center gap-space-xs mt-space-sm active:scale-[0.99] font-bold tracking-wide disabled:opacity-50"
                  >
                    <Dices className="w-5 h-5" />
                    <span>
                      {loading ? "Cadastrando..." : "Cadastrar e Ganhar 1 Giro Grátis"}
                    </span>
                    <ArrowRight className="w-5 h-5" />
                  </button>

                  {/* Already have an account link */}
                  <div className="text-center mt-space-sm pt-space-xs">
                    <span className="font-body-md text-body-md text-on-surface-variant">
                      Já possui uma conta?{" "}
                    </span>
                    <Link
                      href="/login"
                      className="font-label-md text-label-md text-primary hover:underline underline-offset-4 font-bold"
                    >
                      Faça login aqui
                    </Link>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Mobile Security Pills (Visible only on mobile/tablet) */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-space-sm mt-space-md lg:hidden">
            <div className="flex items-center justify-center gap-space-xs p-space-sm bg-surface-container rounded-lg text-on-surface-variant font-label-sm">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span>Sem Burocracia</span>
            </div>
            <div className="flex items-center justify-center gap-space-xs p-space-sm bg-surface-container rounded-lg text-on-surface-variant font-label-sm">
              <Clock className="w-4 h-4 text-primary" />
              <span>Entrega Rápida em Jaborandi</span>
            </div>
            <div className="flex items-center justify-center gap-space-xs p-space-sm bg-surface-container rounded-lg text-on-surface-variant font-label-sm">
              <QrCode className="w-4 h-4 text-primary" />
              <span>PIX, Dinheiro ou Cartão</span>
            </div>
          </div>

          {/* Subtle Footer Notice */}
          <div className="mt-space-lg text-center font-body-sm text-body-sm text-on-surface-variant">
            Ao se cadastrar, você concorda com os{" "}
            <Link href="/sobre" className="underline hover:text-primary">
              Termos da Comitiva
            </Link>{" "}
            e nossa{" "}
            <Link href="/sobre" className="underline hover:text-primary">
              Política de Privacidade
            </Link>
            .
          </div>
        </div>
      </div>
    </main>
  );
}
