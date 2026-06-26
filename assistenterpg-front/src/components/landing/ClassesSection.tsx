'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Button } from '@/components/ui/Button';
import { landingImages } from './landingAssets';
import { LandingSectionDivider } from './LandingSectionDivider';

gsap.registerPlugin(ScrollTrigger);

type LandingClass = {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  image: string;
  imagePosition: string;
  traits: string[];
};

const classes: LandingClass[] = [
  {
    id: 'combatente',
    name: 'Combatente',
    subtitle: 'Confronto direto e pressão ofensiva',
    description:
      'Especialista em combate corpo a corpo, usa energia de forma agressiva para amplificar golpes e manter a linha de frente sob controle.',
    image: landingImages.classCombatente,
    imagePosition: '50% 20%',
    traits: ['Ataque Especial', 'Aniquilador e Guerreiro', 'Pressão corpo a corpo'],
  },
  {
    id: 'sentinela',
    name: 'Sentinela',
    subtitle: 'Controle de campo e combate tático',
    description:
      'Atua em média e longa distância, organiza a luta e controla o campo para responder com precisão ao que acontece na cena.',
    image: landingImages.classSentinela,
    imagePosition: '50% 24%',
    traits: ['Aprimorado', 'Atirador de Elite e Conduíte', 'Leitura tática'],
  },
  {
    id: 'especialista',
    name: 'Especialista',
    subtitle: 'Versatilidade, suporte e perícias',
    description:
      'Classe mais flexível do sistema, normalmente com os aspectos mais fora da curva, trilhas focadas em curas, barreiras, truques de Jujutsu, itens e soluções criativas.',
    image: landingImages.classEspecialista,
    imagePosition: '48% 18%',
    traits: ['Perito', 'Médico de Campo e Técnico', 'Barreiras e suporte'],
  },
];

export function ClassesSection() {
  const [activeClassId, setActiveClassId] = useState(classes[0].id);
  const [failedImageClassId, setFailedImageClassId] = useState<string | null>(
    null,
  );
  const container = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const tabAnimationMountedRef = useRef(false);
  const displayClass =
    classes.find((item) => item.id === activeClassId) ?? classes[0];
  const imageFailed = failedImageClassId === displayClass.id;

  // Entrance Animation
  useGSAP(
    () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container.current,
          start: 'top 80%',
          end: 'bottom bottom',
          toggleActions: 'play none none reverse',
        },
      });

      tl.fromTo(
        headerRef.current?.children || [],
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: 'power3.out' },
      )
        .fromTo(
          tabsRef.current?.children || [],
          { scale: 0.8, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.5,
            stagger: 0.1,
            ease: 'back.out(1.5)',
          },
          '-=0.4',
        )
        .fromTo(
          [mediaRef.current, infoRef.current],
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, stagger: 0.2, ease: 'power3.out' },
          '-=0.2',
        );
    },
    { scope: container },
  );

  // Tab change animation
  useEffect(() => {
    const targets = [mediaRef.current, infoRef.current].filter(
      (target): target is HTMLDivElement => Boolean(target),
    );

    if (!tabAnimationMountedRef.current) {
      tabAnimationMountedRef.current = true;
      gsap.set(targets, { autoAlpha: 1, x: 0 });
      return;
    }

    if (targets.length === 0) return;

    gsap.killTweensOf(targets);
    gsap.fromTo(
      targets,
      { autoAlpha: 0, x: (index) => (index === 0 ? 20 : -20) },
      {
        autoAlpha: 1,
        x: 0,
        duration: 0.35,
        ease: 'power2.out',
        onComplete: () => {
          gsap.set(targets, { autoAlpha: 1, x: 0 });
        },
      },
    );

    return () => {
      gsap.killTweensOf(targets);
      gsap.set(targets, { autoAlpha: 1, x: 0 });
    };
  }, [activeClassId]);

  function handleSelectClass(classId: string) {
    if (classId === activeClassId) return;
    setActiveClassId(classId);
  }

  return (
    <section ref={container} id="classes" className="landing-section">
      <div className="landing-section__content">
        <LandingSectionDivider />

        <div ref={headerRef} className="landing-section__header">
          <span className="landing-section__eyebrow">
            Classes
          </span>
          <h2 className="landing-section__title">
            Três classes definem como seu personagem entra em cena e sustenta a campanha.
          </h2>
          <p className="landing-section__description">
            Combatente, Sentinela e Especialista mudam a leitura do combate, das perícias e da
            forma como o Jujutsu aparece na mesa.
          </p>
        </div>

        <div ref={tabsRef} className="landing-classes__tabs relative z-20">
          {classes.map((item) => (
            <div key={item.id}>
              <Button
                size="sm"
                variant={activeClassId === item.id ? 'primary' : 'secondary'}
                className={`landing-classes__tab transition-all duration-300 ${activeClassId === item.id ? 'scale-105 shadow-xl shadow-app-primary/30' : 'hover:border-app-primary/50'}`}
                onClick={() => handleSelectClass(item.id)}
              >
                {item.name}
              </Button>
            </div>
          ))}
        </div>

        <div className="landing-classes__content group">
          <div ref={mediaRef} className="landing-classes__media overflow-hidden">
            {imageFailed ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[radial-gradient(circle_at_50%_20%,rgba(var(--primary-rgb),0.22),transparent_55%),linear-gradient(135deg,rgba(0,0,0,0.35),rgba(0,0,0,0.8))] p-8 text-center">
                <span className="text-xs font-black uppercase tracking-[0.28em] text-app-primary">
                  Imagem indisponível
                </span>
                <p className="mt-3 max-w-sm text-sm font-medium text-white/75">
                  O dossiê visual desta classe não carregou, mas as informações
                  seguem disponíveis.
                </p>
              </div>
            ) : (
              <Image
                key={displayClass.id}
                src={displayClass.image}
                alt={displayClass.name}
                fill
                sizes="(max-width: 1024px) 100vw, 44vw"
                className="landing-classes__media-image group-hover:scale-110 transition-transform duration-[1.5s] ease-out"
                style={{ objectPosition: displayClass.imagePosition }}
                onError={() => setFailedImageClassId(displayClass.id)}
              />
            )}
            <div className="landing-classes__media-overlay group-hover:opacity-60 transition-opacity duration-700" />
          </div>

          <div ref={infoRef} className="landing-classes__info">
            <span className="group-hover:tracking-[0.25em] transition-all duration-500">{displayClass.subtitle}</span>
            <h3 className="bg-clip-text text-transparent bg-gradient-to-r from-app-fg to-app-muted">{displayClass.name}</h3>
            <p>{displayClass.description}</p>
            <div className="landing-classes__traits">
              {displayClass.traits.map((trait, i) => (
                <span 
                  key={trait} 
                  className="hover:bg-app-primary hover:text-white transition-colors duration-300 cursor-default"
                  style={{ transitionDelay: `${i * 50}ms` }}
                >
                  {trait}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
