'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { landingImages } from './landingAssets';

const classes = [
  {
    id: 'feiticeiro',
    name: 'Feiticeiro Jujutsu',
    subtitle: 'Manipulador de energia amaldiçoada',
    description:
      'Especialistas treinados em técnicas hereditárias. Equilibram domínio, combate físico e
      refinamento de energia amaldiçoada.',
    image: landingImages.classesPrimary,
    traits: ['Técnica inata', 'Expansão de domínio', 'Reforço de energia'],
  },
  {
    id: 'usuario',
    name: 'Usuário de maldições',
    subtitle: 'Mestre das artes proibidas',
    description:
      'Humanos que avançaram pelo caminho das sombras, usando técnicas proibidas e pactos com
      espíritos malditos.',
    image: landingImages.classesSecondary,
    traits: ['Pactos sombrios', 'Técnicas proibidas', 'Manipulação'],
  },
  {
    id: 'espirito',
    name: 'Espírito amaldiçoado',
    subtitle: 'Nascido do medo humano',
    description:
      'Criaturas formadas por emoções negativas. Cada espírito possui habilidades únicas ligadas ao
      medo que o originou.',
    image: landingImages.featuresLeft,
    traits: ['Poder inato', 'Regeneração', 'Domínio natural'],
  },
  {
    id: 'celestial',
    name: 'Corpo celestial',
    subtitle: 'Recipiente do poder supremo',
    description:
      'Indivíduos com condições raras que ampliam força física e resistência espiritual em níveis
      extraordinários.',
    image: landingImages.featuresRight,
    traits: ['Físico superior', 'Resistência à energia', 'Potencial oculto'],
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
            Cada classe traz uma experiência distinta de jogo com mecânicas próprias e estilos
            narrativos específicos.
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
