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
              O mundo nao espera por herois. Ele produz maldicoes cada vez maiores.
            </h2>
            <p className="landing-section__description">
              A campanha cresce quando a presenca dos antagonistas tambem cresce. Calamidades,
              atrocidades e confrontos brutais pedem uma apresentacao a altura do perigo.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
