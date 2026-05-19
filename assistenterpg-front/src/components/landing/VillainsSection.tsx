'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { landingImages } from './landingAssets';
import { LandingSectionDivider } from './LandingSectionDivider';

gsap.registerPlugin(ScrollTrigger);

export function VillainsSection() {
  const container = useRef<HTMLElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container.current,
        start: 'top 75%',
        end: 'bottom bottom',
        toggleActions: 'play none none reverse',
      }
    });

    tl.fromTo(mediaRef.current,
      { x: -50, opacity: 0, rotationY: 15 },
      { x: 0, opacity: 1, rotationY: 0, duration: 1.2, ease: 'power3.out' }
    )
    .fromTo(textRef.current?.children || [],
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: 'power3.out' },
      '-=0.8'
    );
  }, { scope: container });

  return (
    <section ref={container} id="villains" className="landing-section landing-section--villains">
      <div className="landing-section__content">
        <LandingSectionDivider />

        <div className="landing-villains perspective-1000">
          <div ref={mediaRef} className="landing-villains__media group cursor-pointer" style={{ transformStyle: 'preserve-3d' }}>
            <Image
              src={landingImages.villains}
              alt="Maldições de desastre reunidas"
              fill
              sizes="(max-width: 1024px) 100vw, 52vw"
              className="landing-villains__image group-hover:scale-105 group-hover:rotate-1 transition-all duration-1000 ease-out"
            />
            <div className="landing-villains__overlay group-hover:opacity-60 transition-opacity duration-700" />
            
            {/* Subtle glow effect */}
            <div className="absolute inset-0 bg-app-danger/20 opacity-0 group-hover:opacity-100 mix-blend-overlay transition-opacity duration-700 pointer-events-none" />
          </div>

          <div ref={textRef} className="landing-villains__copy">
            <span className="landing-section__eyebrow text-app-danger">Ameaças</span>
            <h2 className="landing-section__title">
              Ameaças, maldições e NPCs também recebem atenção: o sistema facilita o gerenciamento deles de forma intuitiva.
            </h2>
            <p className="landing-section__description">
              O sistema ajuda a consultar criaturas, organizar confrontos e levar para a sessão antagonistas
              que realmente sustentam a narrativa, lidando com os detalhes complicados por você.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
