'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Icon } from '@/components/ui/Icon';
import { landingImages } from './landingAssets';
import { LandingSectionDivider } from './LandingSectionDivider';
import { landingFadeUp, landingScaleIn, landingStagger } from './landingMotion';

const stats = [
  { icon: 'rules', value: 'Compendio vivo', label: 'Regras, tecnicas e consultas em um so lugar' },
  { icon: 'campaign', value: 'Sessao fluida', label: 'Cena, iniciativa, chat e rolagens conectados' },
  { icon: 'inventory', value: 'Ficha completa', label: 'Derivados, inventario e recursos sem improviso' },
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
              Um assistente para campanhas que precisam de organizacao sem perder o clima da cena.
            </h2>
            <p className="landing-section__description">
              O Assistente RPG junta o que a mesa realmente usa durante a campanha: criacao de
              personagem, tecnicas, inventario, compendio, ameaças, campanhas e sessoes com chat e
              rolagem integrada.
            </p>
            <p className="landing-section__description">
              Em vez de espalhar informacao em varias abas, o fluxo do sistema centraliza o 
              máximo de coisas relevantes para o mestre e os jogadores.
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
