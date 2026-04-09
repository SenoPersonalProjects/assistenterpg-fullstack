'use client';

import { useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { landingImages } from './landingAssets';
import { LandingSectionDivider } from './LandingSectionDivider';
import { landingFadeUp, landingScaleIn, landingStagger } from './landingMotion';

type LandingClass = {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  image: (typeof landingImages)[keyof typeof landingImages];
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
  const [activeClass, setActiveClass] = useState(classes[0]);

  return (
    <section id="classes" className="landing-section">
      <div className="landing-section__content">
        <LandingSectionDivider />

        <motion.div
          className="landing-section__header"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={landingStagger}
        >
          <motion.span className="landing-section__eyebrow" variants={landingScaleIn}>
            Classes
          </motion.span>
          <motion.h2 className="landing-section__title" variants={landingFadeUp}>
            Três classes definem como seu personagem entra em cena e sustenta a campanha.
          </motion.h2>
          <motion.p className="landing-section__description" variants={landingFadeUp}>
            Combatente, Sentinela e Especialista mudam a leitura do combate, das perícias e da
            forma como o Jujutsu aparece na mesa.
          </motion.p>
        </motion.div>

        <motion.div
          className="landing-classes__tabs"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={landingStagger}
        >
          {classes.map((item) => (
            <motion.div key={item.id} variants={landingScaleIn}>
              <Button
                size="sm"
                variant={activeClass.id === item.id ? 'primary' : 'secondary'}
                className="landing-classes__tab"
                onClick={() => setActiveClass(item)}
              >
                {item.name}
              </Button>
            </motion.div>
          ))}
        </motion.div>

        <div className="landing-classes__content">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeClass.id}
              className="landing-classes__media"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <Image
                src={activeClass.image}
                alt={activeClass.name}
                fill
                sizes="(max-width: 1024px) 100vw, 44vw"
                className="landing-classes__media-image"
                style={{ objectPosition: activeClass.imagePosition }}
              />
              <div className="landing-classes__media-overlay" />
            </motion.div>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeClass.id}-copy`}
              className="landing-classes__info"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <span>{activeClass.subtitle}</span>
              <h3>{activeClass.name}</h3>
              <p>{activeClass.description}</p>
              <div className="landing-classes__traits">
                {activeClass.traits.map((trait) => (
                  <span key={trait}>{trait}</span>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
