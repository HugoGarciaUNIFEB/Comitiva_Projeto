"use client";

import React, { useState } from "react";

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

/**
 * Componente SafeImage com fallback automático para tom creme e ícone rústico
 * Garante que nenhuma tela fique quebrada caso um asset falhe ou esteja indisponível.
 */
export default function SafeImage({
  src,
  alt = "Imagem Comitiva Fogo de Chão",
  className = "",
  fallbackSrc = "/images/pratos/costela_fogo_chao.jpg",
  ...props
}: SafeImageProps) {
  const [error, setError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src || fallbackSrc);

  const handleError = () => {
    if (!error) {
      setError(true);
      setCurrentSrc(fallbackSrc);
    }
  };

  return (
    <img
      src={currentSrc}
      alt={alt}
      onError={handleError}
      className={className}
      {...props}
    />
  );
}
