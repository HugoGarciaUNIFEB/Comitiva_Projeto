import Link from "next/link";
import { Flame, CheckCircle2, Phone, Clock, MapPin, Sparkles } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-inverse-surface text-inverse-on-surface mt-space-xl border-t border-outline-variant/20">
      <div className="max-w-7xl mx-auto px-margin-lg py-margin-lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter-lg">
          {/* Coluna 1: Marca e Propósito */}
          <div className="space-y-space-sm">
            <div className="flex items-center gap-space-xs">
              <Flame className="w-6 h-6 text-tertiary-fixed-dim" />
              <span className="font-headline-sm text-headline-sm text-inverse-on-surface font-serif">
                Comitiva Fogo de Chão
              </span>
            </div>
            <p className="font-body-md text-body-md text-surface-container-highest">
              Sabor caipira tradicional preparado no autêntico fogão a lenha com carinho de
              comitiva e ingredientes selecionados do campo.
            </p>
            <div className="flex items-center gap-space-xs pt-space-xs">
              <CheckCircle2 className="w-4 h-4 text-tertiary-fixed-dim" />
              <span className="font-label-md text-label-md text-surface-container-highest">
                Receita Artesanal Garantida
              </span>
            </div>
          </div>

          {/* Coluna 2: Navegação Rápida */}
          <div className="space-y-space-sm">
            <h3 className="font-title-md text-title-md text-tertiary-fixed font-bold">
              Navegação Rápida
            </h3>
            <ul className="space-y-space-xs font-body-md text-body-md">
              <li>
                <Link
                  href="/"
                  className="text-surface-container-highest hover:text-surface-bright transition-colors"
                >
                  Cardápio do Dia
                </Link>
              </li>
              <li>
                <Link
                  href="/fidelidade"
                  className="text-surface-container-highest hover:text-surface-bright transition-colors"
                >
                  Programa de Selos Fidelidade
                </Link>
              </li>
              <li>
                <Link
                  href="/roleta"
                  className="text-surface-container-highest hover:text-surface-bright transition-colors"
                >
                  Roleta Caipira da Sorte
                </Link>
              </li>
              <li>
                <Link
                  href="/sobre"
                  className="text-surface-container-highest hover:text-surface-bright transition-colors"
                >
                  Nossa História &amp; Localização
                </Link>
              </li>
            </ul>
          </div>

          {/* Coluna 3: Atendimento e Horário de Pico */}
          <div className="space-y-space-sm">
            <h3 className="font-title-md text-title-md text-tertiary-fixed font-bold">
              Atendimento &amp; Pedidos
            </h3>
            <p className="font-body-md text-body-md text-surface-container-highest flex items-center gap-space-xs">
              <Phone className="w-4 h-4 text-primary-fixed shrink-0" />
              <span>(17) 99742-5580 / WhatsApp</span>
            </p>
            <p className="font-body-md text-body-md text-surface-container-highest flex items-center gap-space-xs">
              <Clock className="w-4 h-4 text-primary-fixed shrink-0" />
              <span>Pico: 10h30 às 13h00 (Segunda a Sábado)</span>
            </p>
            <p className="font-body-md text-body-md text-surface-container-highest flex items-center gap-space-xs">
              <MapPin className="w-4 h-4 text-primary-fixed shrink-0" />
              <span>Jaborandi - SP • Centro Histórico</span>
            </p>
          </div>

          {/* Coluna 4: Selos e Qualidade */}
          <div className="space-y-space-sm">
            <h3 className="font-title-md text-title-md text-tertiary-fixed font-bold">
              Selos de Qualidade
            </h3>
            <div className="p-space-sm rounded-lg bg-surface-container-low/10 border border-outline-variant/20 space-y-space-xs">
              <div className="flex items-center gap-space-xs">
                <Sparkles className="w-4 h-4 text-tertiary-fixed-dim shrink-0" />
                <span className="font-label-lg text-label-lg text-surface-bright font-bold">
                  100% Fogão a Lenha
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-surface-container-highest">
                Lenha de reflorestamento e cozimento lento garantindo aquele sabor defumado
                inigualável.
              </p>
            </div>
          </div>
        </div>

        {/* Rodapé inferior com Direitos */}
        <div className="mt-space-lg pt-space-md border-t border-outline-variant/20 flex flex-col sm:flex-row items-center justify-between gap-space-sm text-surface-container-highest font-label-md text-label-md">
          <span>© 2026 Comitiva Fogo de Chão - Projeto Integrador InovaFood Tech.</span>
          <span>Jaborandi, Terra Boa • Feito com Tradição e Fogo</span>
        </div>
      </div>
    </footer>
  );
}
