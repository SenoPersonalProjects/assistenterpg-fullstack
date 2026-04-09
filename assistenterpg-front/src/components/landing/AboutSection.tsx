import Image from 'next/image';
import { Icon } from '@/components/ui/Icon';
import { landingImages } from './landingAssets';

const stats = [
  { icon: 'swords', value: '50+', label: 'T?cnicas amaldi?oadas' },
  { icon: 'characters', value: '100+', label: 'Jogadores ativos' },
  { icon: 'book', value: '200+', label: 'P?ginas de conte?do' },
  { icon: 'sparkles', value: '?', label: 'Possibilidades' },
] as const;

export function AboutSection() {
  return (
    <section id="about" className="landing-section">
      <div className="landing-section__content">
        <div className="landing-about">
          <div className="landing-about__text">
            <span className="landing-section__eyebrow">Sobre o sistema</span>
            <h2 className="landing-section__title">
              Seu guia para o mundo dos
              <span className="landing-section__title-accent"> feiticeiros Jujutsu</span>
            </h2>
            <p className="landing-section__description">
              Um assistente completo para organizar mesas de RPG inspiradas em Jujutsu Kaisen. Tudo
              pronto para voc? construir personagens, evoluir t?cnicas e conduzir sess?es com ritmo.
            </p>
            <p className="landing-section__description">
              Do planejamento ? rolagem, o fluxo fica leve e visual. Compartilhe campanhas, crie
              invent?rios e mantenha as regras acess?veis para todo o grupo.
            </p>
          </div>

          <div className="landing-about__media">
            <div className="landing-about__image landing-card-pop">
              <Image
                src={landingImages.about}
                alt="Equipe de protagonistas"
                fill
                sizes="(max-width: 768px) 100vw, 40vw"
                className="object-cover"
              />
            </div>
            <div className="landing-about__stats">
              {stats.map((item) => (
                <div key={item.label} className="landing-about__stat landing-card-pop">
                  <Icon name={item.icon} className="h-5 w-5 text-app-primary" />
                  <div>
                    <p>{item.value}</p>
                    <span>{item.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
