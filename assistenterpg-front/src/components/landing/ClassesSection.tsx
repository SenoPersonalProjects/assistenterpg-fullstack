'use client';

import { useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { landingImages } from './landingAssets';
import { LandingSectionDivider } from './LandingSectionDivider';
import { landingFadeUp, landingScaleIn, landingStagger } from './landingMotion';

const classes = [
  {
    id: 'feiticeiro',
    name: 'Feiticeiro Jujutsu',
    subtitle: 'Manipulador de energia amaldicoada',
    description:
      'Combina tecnica, dominio e presenca em combate para decidir o ritmo da cena com precisao.',
    image: landingImages.classFeiticeiro,
    traits: ['Tecnica inata', 'Expansao de dominio', 'Reforco de energia'],
  },
  {
    id: 'usuario',
    name: 'Usuario de maldicoes',
    subtitle: 'Mestre das artes proibidas',
    description:
      'Segue um caminho mais sombrio, usando pactos, transgressao e brutalidade para romper limites.',
    image: landingImages.classUsuario,
    traits: ['Pactos sombrios', 'Tecnicas proibidas', 'Manipulacao'],
  },
  {
    id: 'espirito',
    name: 'Espirito amaldicoado',
    subtitle: 'Nascido do medo humano',
    description:
      'Uma presenca hostil moldada por emocoes negativas, feita para transformar o cenario em ameaca.',
    image: landingImages.classEspirito,
    traits: ['Poder inato', 'Regeneracao', 'Dominio natural'],
  },
  {
    id: 'celestial',
    name: 'Corpo celestial',
    subtitle: 'Recipiente de potencia extrema',
    description:
      'Fisico, resistencia e explosao de poder viram o centro da experiencia para quem quer presenca total.',
    image: landingImages.classCelestial,
    traits: ['Fisico superior', 'Resistencia a energia', 'Potencial oculto'],
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
            Escolha o caminho que define a presenca do seu personagem na mesa.
          </motion.h2>
          <motion.p className="landing-section__description" variants={landingFadeUp}>
            Cada rota muda o tom do combate, da narrativa e da forma como a energia aparece em cena.
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
