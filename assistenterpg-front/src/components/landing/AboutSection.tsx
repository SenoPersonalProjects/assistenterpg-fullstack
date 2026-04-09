'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Icon } from '@/components/ui/Icon';
import { landingImages } from './landingAssets';
import { LandingSectionDivider } from './LandingSectionDivider';
import { landingFadeUp, landingScaleIn, landingStagger } from './landingMotion';

const stats = [
  { icon: 'swords', value: '50+', label: 'Tecnicas amaldicoadas prontas' },
  { icon: 'characters', value: 'Mesa viva', label: 'Fluxo pensado para mestre e jogadores' },
  { icon: 'book', value: 'Campanha', label: 'Tudo fica no mesmo lugar, sem atrito' },
] as const;

export function AboutSection() {
  return (
    <section id="about" className="landing-section">
      <div className="landing-section__content">
        <LandingSectionDivider />

        <motion.div
          className="landing-about"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.22 }}
          variants={landingStagger}
        >
          <motion.div className="landing-about__text" variants={landingFadeUp}>
            <span className="landing-section__eyebrow">Sobre o sistema</span>
            <h2 className="landing-section__title">
              Um assistente para mesas que querem peso visual, ritmo e memoria.
            </h2>
            <p className="landing-section__description">
              O sistema foi montado para organizar o caos da campanha sem matar a atmosfera. Fichas,
              tecnicas, itens e sessoes continuam acessiveis enquanto a mesa mantem o impacto de uma
              cena forte.
            </p>
            <p className="landing-section__description">
              Em vez de parecer uma ferramenta fria, a landing passa a vender o que a mesa sente:
              tensao, estilo e energia amaldicoada em estado puro.
            </p>
          </motion.div>

          <motion.div className="landing-about__media" variants={landingScaleIn}>
            <div className="landing-about__image">
              <Image
                src={landingImages.aboutYouth}
                alt="Trio jovem de feiticeiros"
                fill
                sizes="(max-width: 1024px) 100vw, 48vw"
                className="landing-about__image-file"
              />
              <div className="landing-about__image-overlay" />
            </div>

            <motion.div className="landing-about__stats" variants={landingStagger}>
              {stats.map((item) => (
                <motion.div key={item.label} className="landing-about__stat" variants={landingScaleIn}>
                  <Icon name={item.icon} className="h-5 w-5 text-app-primary" />
                  <div>
                    <p>{item.value}</p>
                    <span>{item.label}</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
