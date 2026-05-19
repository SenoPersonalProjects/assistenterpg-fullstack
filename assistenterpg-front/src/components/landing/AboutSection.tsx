'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Icon } from '@/components/ui/Icon';
import { landingImages } from './landingAssets';
import { LandingSectionDivider } from './LandingSectionDivider';

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { icon: 'rules', value: 'Compêndio vivo', label: 'Regras, técnicas e consultas em um só lugar' },
  { icon: 'campaign', value: 'Sessão fluida', label: 'Cena, iniciativa, chat e rolagens conectados' },
  { icon: 'inventory', value: 'Ficha completa', label: 'Derivados, inventário e recursos sem improviso' },
] as const;

export function AboutSection() {
  const container = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const statsRefs = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container.current,
        start: 'top 75%',
        end: 'bottom bottom',
        toggleActions: 'play none none reverse',
      }
    });

    tl.fromTo(textRef.current?.children || [],
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: 'power3.out' }
    )
    .fromTo(mediaRef.current,
      { x: 50, opacity: 0, scale: 0.95 },
      { x: 0, opacity: 1, scale: 1, duration: 1, ease: 'power3.out' },
      '-=0.6'
    )
    .fromTo(statsRefs.current,
      { y: 20, opacity: 0, scale: 0.9 },
      { y: 0, opacity: 1, scale: 1, duration: 0.6, stagger: 0.1, ease: 'back.out(1.7)' },
      '-=0.4'
    );

    // Parallax effect on image
    gsap.to(imageRef.current, {
      yPercent: 15,
      ease: 'none',
      scrollTrigger: {
        trigger: mediaRef.current,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      }
    });

  }, { scope: container });

  return (
    <section ref={container} id="about" className="landing-section">
      <div className="landing-section__content">
        <LandingSectionDivider />

        <div className="landing-about">
          <div ref={textRef} className="landing-about__text">
            <span className="landing-section__eyebrow">Sobre o sistema</span>
            <h2 className="landing-section__title">
              Um assistente para campanhas que precisam de organização sem perder o clima da cena.
            </h2>
            <p className="landing-section__description">
              O Assistente RPG junta o que a mesa realmente usa durante a campanha: criação de
              personagem, técnicas, inventário, compêndio, ameaças, campanhas e sessões com chat e
              rolagem integrada.
            </p>
            <p className="landing-section__description">
              Em vez de espalhar informação em várias abas, o fluxo do sistema centraliza o
              máximo de coisas relevantes para o mestre e os jogadores.
            </p>
          </div>

          <div ref={mediaRef} className="landing-about__media group">
            <div className="landing-about__image overflow-hidden rounded-[2rem]">
              <Image
                ref={imageRef}
                src={landingImages.aboutYouth}
                alt="Trio jovem de feiticeiros"
                fill
                sizes="(max-width: 1024px) 100vw, 48vw"
                className="landing-about__image-file group-hover:scale-105 transition-transform duration-1000"
                style={{ height: '115%', top: '-7.5%' }} // Extra height for parallax
              />
              <div className="landing-about__image-overlay group-hover:opacity-80 transition-opacity duration-700" />
            </div>

            <div className="landing-about__stats mt-4 grid gap-3 sm:grid-cols-3 relative z-10">
              {stats.map((item, i) => (
                <div 
                  key={item.label} 
                  className="landing-about__stat hover:-translate-y-2 hover:shadow-xl hover:border-app-primary/40 transition-all duration-300 cursor-default"
                  ref={el => { statsRefs.current[i] = el; }}
                >
                  <div className="p-2 rounded-xl bg-app-primary/10 group-hover:scale-110 transition-transform duration-300">
                    <Icon name={item.icon} className="h-5 w-5 text-app-primary" />
                  </div>
                  <div>
                    <p>{item.value}</p>
                    <span>{item.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
