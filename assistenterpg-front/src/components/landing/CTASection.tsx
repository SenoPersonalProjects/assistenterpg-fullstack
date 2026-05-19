'use client';

import { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { landingImages } from './landingAssets';
import { LandingSectionDivider } from './LandingSectionDivider';

gsap.registerPlugin(ScrollTrigger);

export function CTASection() {
  const container = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLImageElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Parallax background for CTA
    gsap.to(bgRef.current, {
      yPercent: 20,
      scale: 1.1,
      ease: 'none',
      scrollTrigger: {
        trigger: container.current,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      }
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container.current,
        start: 'top 80%',
        end: 'bottom bottom',
        toggleActions: 'play none none reverse',
      }
    });

    tl.fromTo(contentRef.current?.children || [],
      { y: 50, opacity: 0, scale: 0.9 },
      { y: 0, opacity: 1, scale: 1, duration: 0.8, stagger: 0.2, ease: 'back.out(1.5)' }
    );
  }, { scope: container });

  return (
    <section ref={container} id="cta" className="landing-cta overflow-hidden">
      <div className="landing-cta__media">
        <Image
          ref={bgRef}
          src={landingImages.ctaGif}
          alt="Malevolent Shrine dominando o campo"
          fill
          unoptimized
          sizes="100vw"
          className="landing-cta__media-file"
          style={{ height: '120%', top: '-10%' }}
        />
      </div>
      <div className="landing-cta__overlay transition-opacity duration-1000 hover:bg-black/60" />

      <div className="landing-section__content landing-section__content--cta">
        <LandingSectionDivider />

        <div ref={contentRef} className="landing-cta__content">
          <div className="landing-cta__badge hover:scale-110 hover:rotate-12 transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.2)]">
            <Icon name="rank" className="h-5 w-5" />
          </div>

          <h2 className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70">
            Libere sua expansão de domínio e jogue campanhas memoráveis!
          </h2>

          <p>
            Crie sua conta, organize fichas, conduza cenas intensas e transforme a mesa em algo
            de outro nível desde a primeira sessão.
          </p>

          <div>
            <Link href="/auth/register">
              <Button size="lg" className="landing-cta__button hover:scale-105 hover:-translate-y-1 transition-all duration-300">
                Começar agora
                <Icon name="forward" className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
