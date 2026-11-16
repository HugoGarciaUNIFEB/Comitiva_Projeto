"use client";

import React from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import SafeImage from "@/components/SafeImage";
import {
  Flame,
  UtensilsCrossed,
  MapPin,
  Clock,
  Truck,
  HeartHandshake,
  CheckCircle2,
  Store,
  Sparkles,
  BookOpen,
} from "lucide-react";

export default function SobrePage() {
  return (
    <div className="min-h-screen bg-background font-body-md text-on-surface antialiased flex flex-col">
      <Header />
      <CartDrawer isOpen={false} onClose={() => {}} />

      <main className="w-full pt-28 bg-background flex-1">
        <div className="flex flex-col w-full">
          {/* Top Editorial Ambience Scrim / Sub-hero banner */}
          <section className="relative w-full overflow-hidden bg-surface-container-low border-b border-outline-variant/20">
            <div className="max-w-7xl mx-auto px-margin-lg py-margin-lg lg:py-space-xl relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-lg items-center">
                {/* Text storytelling side */}
                <div className="lg:col-span-7 flex flex-col items-start">
                  <div className="inline-flex items-center gap-space-xs px-3 py-1 rounded-full bg-surface-container text-tertiary font-label-md text-label-md mb-space-sm shadow-sm border border-outline-variant/30 font-bold">
                    <BookOpen className="w-4 h-4 text-tertiary" />
                    <span>Tradição Rústica de Jaborandi - SP</span>
                  </div>
                  <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight leading-tight mb-space-md font-serif font-bold">
                    Da Tradição dos Tropeiros para a Sua Mesa de Almoço
                  </h1>
                  <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl leading-relaxed mb-space-lg">
                    Um tributo diário à culinária de comitiva: panelas pretas de ferro fundido roncando na brasa viva, o perfume inconfundível do alho dourado na banha e o compromisso pontual de alimentar quem constrói o dia a dia da nossa terra.
                  </p>
                  <div className="flex flex-wrap items-center gap-space-md">
                    <a
                      href="#localizacao"
                      className="px-6 py-3.5 rounded-xl bg-primary text-on-primary font-label-lg text-label-lg shadow-md hover:bg-primary-container transition-all inline-flex items-center gap-2 font-bold"
                    >
                      <MapPin className="w-5 h-5" />
                      <span>Visitar Marmitaria</span>
                    </a>
                    <Link
                      href="/"
                      className="px-6 py-3.5 rounded-xl bg-surface-container-highest text-on-surface font-label-lg text-label-lg shadow-sm hover:bg-surface-dim transition-all inline-flex items-center gap-2 font-semibold"
                    >
                      <UtensilsCrossed className="w-5 h-5 text-primary" />
                      <span>Ver Cardápio do Dia</span>
                    </Link>
                  </div>
                </div>

                {/* Asymmetric atmospheric imagery collage */}
                <div className="lg:col-span-5 relative">
                  <div className="relative w-full h-[380px] rounded-3xl overflow-hidden shadow-xl bg-surface-container border border-outline-variant/30">
                    <SafeImage
                      className="w-full h-full object-cover"
                      src="/images/pratos/costela_fogo_chao.jpg"
                      alt="Fogão a lenha rústico da Comitiva Fogo de Chão"
                      fallbackSrc="/images/banners/banner_home.jpg"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/85 via-inverse-surface/20 to-transparent flex flex-col justify-end p-space-md">
                      <span className="font-label-sm text-label-sm uppercase tracking-widest text-tertiary-fixed-dim font-bold">
                        Fogo Sagrado de Cada Alvorada
                      </span>
                      <span className="font-headline-sm text-headline-sm text-surface-bright font-bold">
                        Panelas acesas desde as 5h da manhã
                      </span>
                    </div>
                  </div>

                  {/* Floating badge */}
                  <div className="absolute -bottom-4 -left-4 bg-surface p-space-md rounded-2xl shadow-xl flex items-center gap-space-sm max-w-xs border border-outline-variant/30">
                    <div className="w-12 h-12 rounded-xl bg-primary-container flex items-center justify-center text-on-primary shrink-0">
                      <Flame className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-title-md text-title-md text-on-surface leading-tight font-bold">
                        100% Brasa e Lenha
                      </p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Sem atalhos, cozimento lento e artesanal.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Narrative Section: História e Compromisso */}
          <section className="w-full max-w-7xl mx-auto px-margin-lg py-space-xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-lg items-center">
              {/* Left Photo Narrative */}
              <div className="lg:col-span-5 grid grid-cols-2 gap-space-md">
                <div className="space-y-space-md">
                  <div className="rounded-2xl overflow-hidden shadow-md h-52 bg-surface-container border border-outline-variant/30">
                    <SafeImage
                      className="w-full h-full object-cover"
                      src="/images/pratos/frango_caipira.jpg"
                      alt="Ingredientes frescos do campo"
                      fallbackSrc="/images/pratos/costela_fogo_chao.jpg"
                    />
                  </div>
                  <div className="p-space-md rounded-2xl bg-surface-container-high shadow-sm border border-outline-variant/20 text-center">
                    <span className="font-headline-lg text-headline-lg text-primary block font-bold">
                      100%
                    </span>
                    <span className="font-label-sm text-label-sm text-on-surface font-semibold">
                      Ingredientes da agricultura familiar da região
                    </span>
                  </div>
                </div>

                <div className="space-y-space-md pt-space-lg">
                  <div className="p-space-md rounded-2xl bg-primary text-on-primary shadow-md">
                    <Clock className="w-8 h-8 text-tertiary-fixed-dim" />
                    <p className="font-title-md text-title-md mt-space-xs leading-snug font-bold">
                      Pontualidade Sagrada
                    </p>
                    <p className="font-body-sm text-body-sm text-primary-fixed mt-1">
                      Seu almoço chega fumegando na hora exata da sua pausa.
                    </p>
                  </div>
                  <div className="rounded-2xl overflow-hidden shadow-md h-56 bg-surface-container border border-outline-variant/30">
                    <SafeImage
                      className="w-full h-full object-cover"
                      src="/images/pratos/feijoada_comitiva.jpg"
                      alt="Tacho de ferro tradicional"
                      fallbackSrc="/images/pratos/costela_fogo_chao.jpg"
                    />
                  </div>
                </div>
              </div>

              {/* Right Editorial Column */}
              <div className="lg:col-span-7 flex flex-col justify-center lg:pl-space-md">
                <div className="flex items-center gap-space-xs mb-space-xs text-primary font-label-lg text-label-lg font-bold">
                  <Flame className="w-5 h-5 text-primary" />
                  <span>Nossa Alma &amp; Raízes</span>
                </div>
                <h2 className="font-headline-lg text-headline-lg text-on-surface mb-space-md leading-tight font-serif font-bold">
                  O Respeito ao Fogo de Chão e ao Trabalho de Jaborandi
                </h2>
                <div className="space-y-space-md font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
                  <p>
                    A <strong>Comitiva Fogo de Chão</strong> nasceu inspirada nos tropeiros e peões de boiadeiro que cruzavam o interior paulista e pantaneiro. Sem pressa e com disciplina de ferro, eles acendiam o fogo ao alvorecer para cozinhar refeições ricas, nutritivas e resistentes à dura lida diária.
                  </p>
                  <p>
                    Trouxemos essa sabedoria centenária para o coração de <strong>Jaborandi - SP</strong>. Nossas marmitas não são apenas refeições rápidas: são o resultado de até 6 horas de cozimento contínuo em brasa mansa de lenha reflorestada, banha artesanal e tempero socado no pilão de madeira.
                  </p>
                  <p>
                    Acreditamos que todo trabalhador, comerciante e família de Jaborandi merece comer comida de verdade, com sustância, generosidade e pontualidade irrepreensível no horário sagrado do almoço.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section: Os 4 Pilares da Comitiva */}
          <section className="w-full bg-surface-container-low py-space-xl border-y border-outline-variant/20">
            <div className="max-w-7xl mx-auto px-margin-lg">
              <div className="text-center max-w-2xl mx-auto mb-space-xl">
                <span className="font-label-md text-label-md uppercase tracking-widest text-primary font-bold">
                  Compromisso Inegociável
                </span>
                <h2 className="font-headline-lg text-headline-lg text-on-surface mt-1 font-serif font-bold">
                  Os 4 Pilares da Nossa Panela
                </h2>
                <p className="font-body-md text-body-md text-on-surface-variant mt-2">
                  Diretrizes éticas e gastronômicas que regem cada marmita despachada do nosso alpendre.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter-md">
                {/* Pilar 1 */}
                <div className="p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/30 flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-primary-container text-on-primary flex items-center justify-center mb-space-md">
                      <Flame className="w-6 h-6" />
                    </div>
                    <h3 className="font-title-md text-title-md text-on-surface font-bold mb-space-xs">
                      Fogo de Chão Real
                    </h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                      Não utilizamos gás para os pratos principais. A defumação natural da lenha é a alma do nosso sabor.
                    </p>
                  </div>
                  <div className="mt-space-md pt-space-xs border-t border-outline-variant/20 flex items-center gap-1 text-primary font-label-sm font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Autêntico e Lento</span>
                  </div>
                </div>

                {/* Pilar 2 */}
                <div className="p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/30 flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-tertiary-container text-on-tertiary flex items-center justify-center mb-space-md">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <h3 className="font-title-md text-title-md text-on-surface font-bold mb-space-xs">
                      Fartura e Respeito
                    </h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                      Marmitas pesadas com carne de verdade, feijão gordo e mandioca na manteiga, sem economia mesquinha.
                    </p>
                  </div>
                  <div className="mt-space-md pt-space-xs border-t border-outline-variant/20 flex items-center gap-1 text-tertiary font-label-sm font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Tamanhos P, M e G</span>
                  </div>
                </div>

                {/* Pilar 3 */}
                <div className="p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/30 flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-secondary-container text-on-secondary-container flex items-center justify-center mb-space-md">
                      <Clock className="w-6 h-6" />
                    </div>
                    <h3 className="font-title-md text-title-md text-on-surface font-bold mb-space-xs">
                      Horário de Pico Sagrado
                    </h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                      Operação afiada das 10h30 às 13h00. Quem pede com antecedência almoça sem atraso.
                    </p>
                  </div>
                  <div className="mt-space-md pt-space-xs border-t border-outline-variant/20 flex items-center gap-1 text-secondary font-label-sm font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>KDS em Tempo Real</span>
                  </div>
                </div>

                {/* Pilar 4 */}
                <div className="p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/30 flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-primary-fixed text-on-primary-fixed flex items-center justify-center mb-space-md">
                      <HeartHandshake className="w-6 h-6" />
                    </div>
                    <h3 className="font-title-md text-title-md text-on-surface font-bold mb-space-xs">
                      Comunidade Jaborandi
                    </h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                      Priorizamos produtores locais e mantemos a taxa de entrega mais acessível e justa da cidade.
                    </p>
                  </div>
                  <div className="mt-space-md pt-space-xs border-t border-outline-variant/20 flex items-center gap-1 text-primary font-label-sm font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Taxa Fixa R$ 5,00</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section: Localização, Horários e Mapa Integrado */}
          <section id="localizacao" className="w-full max-w-7xl mx-auto px-margin-lg py-space-xl scroll-mt-24">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-lg items-start">
              {/* Coluna da Esquerda: Dados Operacionais e Horários */}
              <div className="lg:col-span-5 flex flex-col gap-space-md">
                <div className="flex items-center gap-space-xs text-primary font-label-lg font-bold">
                  <MapPin className="w-5 h-5 text-primary" />
                  <span>Onde Estamos &amp; Como Pedir</span>
                </div>
                <h2 className="font-headline-lg text-headline-lg text-on-surface font-serif font-bold">
                  Ponto de Retirada &amp; Entrega em Jaborandi
                </h2>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Venha retirar sua marmita quentinha no nosso alpendre de chão batido ou receba no trabalho com rapidez.
                </p>

                {/* Informações de Contato e Endereço */}
                <div className="bg-surface-container-low rounded-2xl p-space-md space-y-space-md border border-outline-variant/20">
                  <div className="flex items-start gap-space-sm">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-title-md text-title-md text-on-surface font-bold">
                        Endereço da Marmitaria
                      </h4>
                      <p className="font-body-md text-body-md text-on-surface-variant">
                        Rua Quinze de Novembro, 382 • Centro Histórico
                      </p>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">
                        Jaborandi - SP • CEP 14775-000
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-space-sm">
                    <div className="w-10 h-10 rounded-xl bg-tertiary-container/20 text-tertiary flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-title-md text-title-md text-on-surface font-bold">
                        Horário do Almoço
                      </h4>
                      <p className="font-body-md text-body-md text-on-surface-variant">
                        Segunda a Sábado: <strong>10h30 às 13h00</strong>
                      </p>
                      <span className="font-label-sm text-label-sm text-tertiary font-bold">
                        Pico das panelas: 11h15 às 12h30
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-space-sm">
                    <div className="w-10 h-10 rounded-xl bg-primary-fixed text-primary flex items-center justify-center shrink-0">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-title-md text-title-md text-on-primary-fixed font-bold">
                          Taxa Única de Entrega
                        </h4>
                        <span className="px-3 py-1 rounded-full bg-primary text-on-primary font-bold text-label-md">
                          R$ 5,00
                        </span>
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                        Entrega para todo o perímetro urbano de Jaborandi - SP com motoqueira própria e baú térmico selado.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Coluna da Direita: Mapa Google Iframe (sem chave de API) */}
              <div className="lg:col-span-7 flex flex-col gap-space-md">
                <div className="relative w-full h-[380px] rounded-3xl overflow-hidden shadow-lg border border-outline-variant/30 bg-surface-container">
                  <iframe
                    title="Mapa Comitiva Fogo de Chão Jaborandi SP"
                    src="https://maps.google.com/maps?q=Jaborandi%20SP%20Brasil&t=&z=15&ie=UTF8&iwloc=&output=embed"
                    className="w-full h-full border-0"
                    allowFullScreen
                    loading="lazy"
                  />
                  <div className="absolute top-4 left-4 bg-surface/95 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-md flex items-center gap-2 border border-outline-variant/20">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                    <span className="font-label-sm text-label-sm font-bold text-on-surface">
                      Jaborandi – SP • Centro
                    </span>
                  </div>
                </div>

                {/* Fachada e Retirada */}
                <div className="bg-surface-container-low rounded-2xl p-space-md shadow-sm border border-outline-variant/20">
                  <div className="flex flex-col sm:flex-row items-center gap-space-md">
                    <div className="w-full sm:w-44 h-28 rounded-xl overflow-hidden shrink-0 bg-surface-container shadow-sm">
                      <SafeImage
                        className="w-full h-full object-cover"
                        src="/images/sobre/localizacao.jpg"
                        alt="Fachada e Alpendre Caipira"
                        fallbackSrc="/images/banners/banner_home.jpg"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="inline-flex items-center gap-1 text-tertiary font-label-sm text-label-sm uppercase font-bold mb-1">
                        <Store className="w-4 h-4" />
                        <span>Fachada e Ambiente</span>
                      </div>
                      <h4 className="font-title-md text-title-md text-on-surface font-bold">
                        Ponto com Alpendre Caipira
                      </h4>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 leading-normal">
                        Sinta o cheiro da lenha de longe! Você pode estacionar em frente, entrar no alpendre e retirar sua marmita montada na hora, fumegando direto dos tachos de ferro.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
