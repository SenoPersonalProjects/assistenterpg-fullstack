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

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { value: '50+', label: 'Técnicas inatas' },
  { value: '100+', label: 'Equipamentos e relíquias' },
  { value: '2', label: 'Suplementos oficiais' },
];

export function HeroSection() {
  const container = useRef<HTMLElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const statsRefs = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(() => {
    // Parallax background watermark
    gsap.to('.landing-hero__symbol', {
      yPercent: 30,
      rotation: 15,
      ease: 'none',
      scrollTrigger: {
        trigger: container.current,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    });

    // Staggered entrance animation
    const tl = gsap.timeline({ defaults: { ease: 'power4.out', duration: 1.2 } });
    
    tl.fromTo(badgeRef.current, 
      { y: 30, opacity: 0 }, 
      { y: 0, opacity: 1 }
    )
    .fromTo(titleRef.current, 
      { y: 40, opacity: 0, rotationX: -20 }, 
      { y: 0, opacity: 1, rotationX: 0 }, 
      '-=0.9'
    )
    .fromTo(descRef.current, 
      { y: 30, opacity: 0 }, 
      { y: 0, opacity: 1 }, 
      '-=0.9'
    )
    .fromTo(actionsRef.current, 
      { y: 30, opacity: 0 }, 
      { y: 0, opacity: 1 }, 
      '-=0.9'
    )
    .fromTo(visualRef.current, 
      { x: 50, opacity: 0, scale: 0.95 }, 
      { x: 0, opacity: 1, scale: 1, duration: 1.5, ease: 'expo.out' }, 
      '-=1.0'
    )
    .fromTo(statsRefs.current, 
      { y: 20, opacity: 0 }, 
      { y: 0, opacity: 1, stagger: 0.1 }, 
      '-=1.2'
    );

    // Continuous floating animation for visual
    gsap.to(visualRef.current, {
      y: -15,
      rotation: -1.5,
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });

  }, { scope: container });

  return (
    <section ref={container} id="hero" className="landing-hero group">
      <div className="landing-hero__backdrop" />
      <div className="landing-hero__glow opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />

      <div className="landing-hero__symbol">
        <Image
          src={landingImages.heroWatermark}
          alt=""
          fill
          sizes="900px"
          className="object-contain"
        />
      </div>

      <div className="landing-hero__content">
        <div className="landing-hero__copy perspective-1000">
          <div ref={badgeRef} className="landing-hero__badge">
            <Icon name="sparkles" className="h-4 w-4" />
            Campanhas para o sistema de RPG de Era Jujutsu
          </div>

          <h1 ref={titleRef} className="landing-hero__title" style={{ transformOrigin: 'bottom center' }}>
            Libere sua energia amaldiçoada sem se preocupar com detalhes.
          </h1>

          <p ref={descRef} className="landing-hero__description">
            Monte personagens, técnicas, inventário e sessões em um fluxo que parece parte do
            próprio universo de Era Jujutsu. Deixe o sistema cuidar das regras e foque na diversão.
          </p>

          <div ref={actionsRef} className="landing-hero__actions">
            <Link href="/auth/register">
              <Button size="lg" className="font-black px-8 shadow-2xl shadow-app-primary/40 hover:scale-105 transition-transform duration-300">
                <Icon name="add" className="h-5 w-5 mr-2" />
                Começar agora
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="secondary" className="font-black px-8 hover:bg-app-surface/80 hover:scale-105 transition-all duration-300 border border-transparent hover:border-app-border">
                <Icon name="forward" className="h-5 w-5 mr-2" />
                Entrar na conta
              </Button>
            </Link>
          </div>

          <div className="landing-hero__stats">
            {stats.map((item, i) => (
              <div 
                key={item.label} 
                className="landing-hero__stat"
                ref={el => { statsRefs.current[i] = el; }}
              >
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-app-primary to-app-secondary">{item.value}</span>
                <p>{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div ref={visualRef} className="landing-hero__visual hover:rotate-2 transition-transform duration-700 cursor-pointer">
          <div className="landing-hero__frame group-hover:shadow-[0_0_60px_rgba(var(--primary-rgb),0.3)] transition-shadow duration-700">
            <Image
              src={landingImages.heroGif}
              alt="Gojo executando Hollow Purple"
              fill
              priority
              unoptimized
              sizes="(max-width: 1024px) 92vw, 40vw"
              className="landing-hero__gif group-hover:scale-110 transition-transform duration-[2s]"
            />
            <div className="landing-hero__frame-overlay group-hover:opacity-60 transition-opacity duration-700" />
          </div>

          <div className="landing-hero__caption group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform duration-500">
            <span className="landing-hero__caption-label flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-app-primary animate-pulse" />
              Ritmo cinematográfico
            </span>
            <p>
              Todos os conceitos principais de Era Jujutsu reunidos no sistema em uma experiência mais viva para o
              mestre e para o grupo.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
