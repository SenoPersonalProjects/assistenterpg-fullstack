'use client';

import React from 'react';
import Lottie, { LottieComponentProps } from 'lottie-react';

type LottiePlayerProps = Omit<LottieComponentProps, 'animationData'> & {
  src: object | string;
  size?: number | string;
};

export function LottiePlayer({ src, size = '100%', ...props }: LottiePlayerProps) {
  const [animationData, setAnimationData] = React.useState<object | null>(
    typeof src === 'object' ? src : null
  );

  React.useEffect(() => {
    if (typeof src === 'string') {
      fetch(src)
        .then((res) => res.json())
        .then((data) => setAnimationData(data))
        .catch((err) => console.error('Erro ao carregar animação Lottie:', err));
    }
  }, [src]);

  if (!animationData) {
    return <div style={{ width: size, height: size }} className="bg-app-muted/10 animate-pulse rounded-full" />;
  }

  return (
    <div style={{ width: size, height: size }} className="flex items-center justify-center overflow-hidden">
      <Lottie animationData={animationData} {...props} />
    </div>
  );
}
