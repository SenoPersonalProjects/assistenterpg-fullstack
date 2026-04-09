'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Icon, type IconName } from '@/components/ui/Icon';
import { landingImages } from './landingAssets';
import { LandingSectionDivider } from './LandingSectionDivider';
import { landingFadeUp, landingScaleIn, landingStagger } from './landingMotion';

const features: Array<{ icon: IconName; title: string; description: string }> = [
  {
    icon: 'energy',
    title: 'Energia amaldicoada',
    description: 'Custos, reforcos e efeitos ficam claros sem quebrar o clima da cena.',
  },
  {
    icon: 'technique',
    title: 'Tecnicas inatas',
    description: 'Catalogos e variacoes prontos para dar profundidade sem virar bagunca.',
  },
  {
    icon: 'domain',
    title: 'Expansao de dominio',
    description: 'Momentos de climax ganham peso com recursos que valorizam o confronto.',
  },
  {
    icon: 'aim',
    title: 'Combate com ritmo',
    description: 'Rolagens, iniciativa e decisoes funcionam com leitura rapida e presenca visual.',
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="landing-section landing-section--alt">
      <div className="landing-section__content">
        <LandingSectionDivider />

        <motion.div
          className="landing-features-layout"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={landingStagger}
        >
          <motion.div className="landing-features-layout__media" variants={landingScaleIn}>
            <div className="landing-features-layout__image">
              <Image
                src={landingImages.featuresSchool}
                alt="Escola tecnica Jujutsu"
                fill
                sizes="(max-width: 1024px) 100vw, 42vw"
                className="landing-features-layout__image-file"
              />
              <div className="landing-features-layout__image-overlay" />
            </div>
            <motion.div className="landing-features-layout__copy" variants={landingFadeUp}>
              <span className="landing-section__eyebrow">Recursos</span>
              <h2 className="landing-section__title">
                Estrutura suficiente para sustentar uma campanha sem matar a atmosfera.
              </h2>
              <p className="landing-section__description">
                O mundo de Jujutsu pede impacto visual e clareza mecanica. Aqui, os dois convivem
                no mesmo espaco.
              </p>
            </motion.div>
          </motion.div>

          <motion.div className="landing-features" variants={landingStagger}>
            {features.map((feature) => (
              <motion.div key={feature.title} className="landing-feature" variants={landingScaleIn}>
                <div className="landing-feature__icon">
                  <Icon name={feature.icon} className="h-5 w-5" />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
