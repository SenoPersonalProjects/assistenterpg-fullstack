'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { landingImages } from './landingAssets';

export function CTASection() {
  return (
    <section id="cta" className="landing-cta">
      <div className="landing-cta__media">
        <Image
          src={landingImages.simboloEscola}
          alt="Símbolo da escola"
          fill
          sizes="480px"
          className="object-contain"
        />
      </div>

      <div className="landing-cta__content">
        <div className="landing-cta__badge">
          <Icon name="rank" className="h-5 w-5" />
        </div>
        <h2>
          Pronto para a sua
          <span> primeira missão</span>?
        </h2>
        <p>
          Crie sua conta e organize campanhas, fichas e rolagens em poucos minutos. A mesa fica mais
          fluida e todo mundo acompanha.
        </p>
        <Link href="/auth/register">
          <Button size="lg" className="landing-cta__button">
            Começar agora
            <Icon name="forward" className="h-5 w-5" />
          </Button>
        </Link>
      </div>
    </section>
  );
}
