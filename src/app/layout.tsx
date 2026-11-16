import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Comitiva Fogo de Chão | Marmitaria Artesanal Caipira",
  description:
    "Comida caseira tradicional preparada no autêntico fogão a lenha em Jaborandi - SP. Marmitas P, M e G com ingredientes selecionados do campo.",
  keywords: [
    "marmita",
    "fogão a lenha",
    "comida caipira",
    "Jaborandi",
    "comitiva fogo de chão",
    "almoço caseiro",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head />
      <body className="bg-background text-on-surface antialiased min-h-screen flex flex-col font-sans">
        {children}
      </body>
    </html>
  );
}
