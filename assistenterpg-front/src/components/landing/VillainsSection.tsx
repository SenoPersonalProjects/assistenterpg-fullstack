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
              alt="Maldicoes de desastre reunidas"
              fill
              sizes="(max-width: 1024px) 100vw, 52vw"
              className="landing-villains__image"
            />
            <div className="landing-villains__overlay" />
          </motion.div>

          <motion.div className="landing-villains__copy" variants={landingFadeUp}>
            <span className="landing-section__eyebrow">Ameacas</span>
            <h2 className="landing-section__title">
              Ameacas, maldicoes e NPCs nao ficam soltos: eles entram na mesa com contexto.
            </h2>
            <p className="landing-section__description">
              Do compendio para a campanha, o sistema ajuda a consultar criaturas, organizar
              confrontos e levar para a sessao antagonistas que realmente sustentam a narrativa.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
