import Image from 'next/image';
import { Icon, type IconName } from '@/components/ui/Icon';
import { landingImages } from './landingAssets';

const features: Array<{ icon: IconName; title: string; description: string }> = [
  {
    icon: 'energy',
    title: 'Energia amaldi?oada',
    description:
      'Controle custos, refor?os e libera??es de energia para manter o combate equilibrado.',
  },
  {
    icon: 'technique',
    title: 'T?cnicas inatas',
    description:
      'Cat?logo completo e pronto para evoluir habilidades com varia??es e requisitos claros.',
  },
  {
    icon: 'domain',
    title: 'Expans?o de dom?nio',
    description:
      'Regras ?picas para a t?cnica suprema dos feiticeiros, com efeitos narrativos marcantes.',
  },
  {
    icon: 'aim',
    title: 'Combate estrat?gico',
    description:
      'Iniciativa, rea??es e rolagens calibradas para criar momentos de tens?o.',
  },
  {
    icon: 'shield-defense',
    title: 'Votos e restri??es',
    description:
      'Defina limita??es que fortalecem seu personagem e sustentam o drama da mesa.',
  },
  {
    icon: 'rank',
    title: 'Progress?o de grau',
    description:
      'Evolua de Grau 4 at? Grau Especial com miss?es, conquistas e recompensas.',
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="landing-section landing-section--alt">
      <div className="landing-section__content">
        <div className="landing-section__header">
          <span className="landing-section__eyebrow">Recursos</span>
          <h2 className="landing-section__title">
            Tudo o que um
            <span className="landing-section__title-accent"> feiticeiro precisa</span>
          </h2>
          <p className="landing-section__description">
            Mec?nicas profundas, ferramentas visuais e rolagens prontas para apoiar campanhas de
            qualquer tamanho.
          </p>
        </div>

        <div className="landing-features">
          {features.map((feature) => (
            <div key={feature.title} className="landing-feature landing-card-pop">
              <div className="landing-feature__icon">
                <Icon name={feature.icon} className="h-5 w-5" />
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="landing-feature__decor landing-feature__decor--left">
        <Image
          src={landingImages.featuresLeft}
          alt=""
          fill
          sizes="240px"
          className="object-cover"
        />
      </div>
      <div className="landing-feature__decor landing-feature__decor--right">
        <Image
          src={landingImages.featuresRight}
          alt=""
          fill
          sizes="240px"
          className="object-cover"
        />
      </div>
    </section>
  );
}
