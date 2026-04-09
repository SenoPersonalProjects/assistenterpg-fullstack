'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { landingImages } from './landingAssets';
import { LandingSectionDivider } from './LandingSectionDivider';
import { landingFadeUp, landingScaleIn, landingStagger } from './landingMotion';

export function VillainsSection() {
  return (
    <section id="villains" className="landing-section landing-section--villains">
      <div className="landing-section__content">
        <LandingSectionDivider />

        <motion.div
          className="landing-villains"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={landingStagger}
        >
          <motion.div className="landing-villains__media" variants={landingScaleIn}>
            <Image
              src={landingImages.villains}
              alt="Maldições de desastre reunidas"
              fill
              sizes="(max-width: 1024px) 100vw, 52vw"
              className="landing-villains__image"
            />
            <div className="landing-villains__overlay" />
          </motion.div>

          <motion.div className="landing-villains__copy" variants={landingFadeUp}>
            <span className="landing-section__eyebrow">Ameaças</span>
            <h2 className="landing-section__title">
              Ameaças, maldições e NPCs também recebem atenção: o sistema facilita o gerenciamento deles de forma intuitiva.
            </h2>
            <p className="landing-section__description">
              O sistema ajuda a consultar criaturas, organizar confrontos e levar para a sessão antagonistas
              que realmente sustentam a narrativa, lidando com os detalhes complicados por você.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
