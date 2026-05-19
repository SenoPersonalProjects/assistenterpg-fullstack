'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Icon, type IconName } from '@/components/ui/Icon';
import { landingImages } from './landingAssets';
import { LandingSectionDivider } from './LandingSectionDivider';

gsap.registerPlugin(ScrollTrigger);

const features: Array<{ icon: IconName; title: string; description: string }> = [
  {
    icon: 'characters',
    title: 'Personagens completos',
    description:
      'Monte fichas com atributos, trilhas, técnicas, poderes, derivados e escolhas guiadas pelo sistema.',
  },
  {
    icon: 'campaign',
    title: 'Campanhas e sessões',
    description:
      'Gerencie membros, personagens vinculados, iniciativa, turnos, chat da mesa e eventos da sessão.',
  },
  {
    icon: 'rules',
    title: 'Compêndio consultável',
    description:
      'Acesse as regras, classes, técnicas e conteúdo estruturado sem precisar sair do site.',
  },
  {
    icon: 'book',
    title: 'Suplementos e homebrews',
    description:
      'Ative conteúdos extras, publique material próprio e expanda a sua experiência sem quebrar a base do sistema.',
  },
];

export function FeaturesSection() {
  const container = useRef<HTMLElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<(HTMLDivElement | null)[]>([]);
  const titleRef = useRef<HTMLDivElement>(null);

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
      { x: -50, opacity: 0, scale: 0.95 },
      { x: 0, opacity: 1, scale: 1, duration: 1, ease: 'power3.out' }
    )
    .fromTo(titleRef.current?.children || [],
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: 'power3.out' },
      '-=0.6'
    )
    .fromTo(featuresRef.current,
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: 'back.out(1.5)' },
      '-=0.8'
    );

    // Subtle float animation for features
    featuresRef.current.forEach((el, index) => {
      gsap.to(el, {
        y: -5,
        duration: 2 + index * 0.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: index * 0.2,
      });
    });

  }, { scope: container });

  return (
    <section ref={container} id="features" className="landing-section landing-section--alt">
      <div className="landing-section__content">
        <LandingSectionDivider />

        <div className="landing-features-layout">
          <div className="landing-features-layout__media">
            <div ref={mediaRef} className="landing-features-layout__image group">
              <Image
                src={landingImages.featuresSchool}
                alt="Escola técnica Jujutsu"
                fill
                sizes="(max-width: 1024px) 100vw, 42vw"
                className="landing-features-layout__image-file group-hover:scale-110 transition-transform duration-1000"
              />
              <div className="landing-features-layout__image-overlay group-hover:opacity-75 transition-opacity duration-700" />
            </div>
            <div ref={titleRef} className="landing-features-layout__copy">
              <span className="landing-section__eyebrow">Recursos</span>
              <h2 className="landing-section__title">
                O site cobre o ciclo inteiro da mesa, da criação ao controle da sessão.
              </h2>
              <p className="landing-section__description">
                Não é só uma vitrine de fichas. O sistema foi construído para criar personagens,
                consultar regras, administrar campanhas, usar ameaças e conduzir a partida em tempo real.
              </p>
            </div>
          </div>

          <div className="landing-features relative z-10">
            {features.map((feature, i) => (
              <div 
                key={feature.title} 
                className="landing-feature group cursor-pointer"
                ref={el => { featuresRef.current[i] = el; }}
              >
                <div className="landing-feature__icon relative overflow-hidden group-hover:bg-app-primary group-hover:text-white transition-all duration-500">
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
                  <Icon name={feature.icon} className="h-6 w-6 relative z-10" />
                </div>
                <h3 className="group-hover:text-app-primary transition-colors duration-300">{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
