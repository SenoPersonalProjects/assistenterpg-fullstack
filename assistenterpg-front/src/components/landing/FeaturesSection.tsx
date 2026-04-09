'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Icon, type IconName } from '@/components/ui/Icon';
import { landingImages } from './landingAssets';
import { LandingSectionDivider } from './LandingSectionDivider';
import { landingFadeUp, landingScaleIn, landingStagger } from './landingMotion';

const features: Array<{ icon: IconName; title: string; description: string }> = [
  {
    icon: 'characters',
    title: 'Personagens completos',
    description:
      'Monte fichas com atributos, trilhas, tecnicas, poderes, derivados e escolhas guiadas pelo sistema.',
  },
  {
    icon: 'campaign',
    title: 'Campanhas e sessoes',
    description:
      'Gerencie membros, personagens vinculados, iniciativa, turnos, chat da mesa e eventos da sessao.',
  },
  {
    icon: 'rules',
    title: 'Compendio consultavel',
    description:
      'Acesse regras, classes, tecnicas e conteudo estruturado sem sair do ritmo da campanha.',
  },
  {
    icon: 'book',
    title: 'Suplementos e homebrews',
    description:
      'Ative conteudos extras, publique material proprio e expanda a mesa sem quebrar a base do sistema.',
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
                O site cobre o ciclo inteiro da mesa, da criacao ao controle da sessao.
              </h2>
              <p className="landing-section__description">
                Nao e so uma vitrine de fichas. O sistema foi construido para criar personagens,
                consultar regras, administrar campanhas, usar ameacas e conduzir a partida em tempo real.
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
