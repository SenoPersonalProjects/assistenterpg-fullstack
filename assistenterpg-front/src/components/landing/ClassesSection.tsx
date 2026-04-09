'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { landingImages } from './landingAssets';

const classes = [
  {
    id: 'feiticeiro',
    name: 'Feiticeiro Jujutsu',
    subtitle: 'Manipulador de energia amaldi?oada',
    description:
      'Especialistas treinados em t?cnicas heredit?rias. Equilibram dom?nio, combate f?sico e refinamento de energia amaldi?oada.',
    image: landingImages.classesPrimary,
    traits: ['T?cnica inata', 'Expans?o de dom?nio', 'Refor?o de energia'],
  },
  {
    id: 'usuario',
    name: 'Usu?rio de maldi??es',
    subtitle: 'Mestre das artes proibidas',
    description:
      'Humanos que avan?aram pelo caminho das sombras, usando t?cnicas proibidas e pactos com esp?ritos malditos.',
    image: landingImages.classesSecondary,
    traits: ['Pactos sombrios', 'T?cnicas proibidas', 'Manipula??o'],
  },
  {
    id: 'espirito',
    name: 'Esp?rito amaldi?oado',
    subtitle: 'Nascido do medo humano',
    description:
      'Criaturas formadas por emo??es negativas. Cada esp?rito possui habilidades ?nicas ligadas ao medo que o originou.',
    image: landingImages.featuresLeft,
    traits: ['Poder inato', 'Regenera??o', 'Dom?nio natural'],
  },
  {
    id: 'celestial',
    name: 'Corpo celestial',
    subtitle: 'Recipiente do poder supremo',
    description:
      'Indiv?duos com condi??es raras que ampliam for?a f?sica e resist?ncia espiritual em n?veis extraordin?rios.',
    image: landingImages.featuresRight,
    traits: ['F?sico superior', 'Resist?ncia ? energia', 'Potencial oculto'],
  },
];

export function ClassesSection() {
  const [activeClass, setActiveClass] = useState(classes[0]);

  return (
    <section id="classes" className="landing-section">
      <div className="landing-section__content">
        <div className="landing-section__header">
          <span className="landing-section__eyebrow">Classes</span>
          <h2 className="landing-section__title">
            Escolha seu
            <span className="landing-section__title-accent"> caminho</span>
          </h2>
          <p className="landing-section__description">
            Cada classe traz uma experi?ncia distinta de jogo com mec?nicas pr?prias e estilos
            narrativos espec?ficos.
          </p>
        </div>

        <div className="landing-classes__tabs">
          {classes.map((item) => (
            <Button
              key={item.id}
              size="sm"
              variant={activeClass.id === item.id ? 'primary' : 'secondary'}
              className="landing-classes__tab"
              onClick={() => setActiveClass(item)}
            >
              {item.name}
            </Button>
          ))}
        </div>

        <div className="landing-classes__content">
          <div className="landing-classes__media">
            <Image
              src={activeClass.image}
              alt={activeClass.name}
              fill
              sizes="(max-width: 768px) 100vw, 40vw"
              className="object-cover"
            />
          </div>

          <div className="landing-classes__info">
            <span>{activeClass.subtitle}</span>
            <h3>{activeClass.name}</h3>
            <p>{activeClass.description}</p>
            <div className="landing-classes__traits">
              {activeClass.traits.map((trait) => (
                <span key={trait}>{trait}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
