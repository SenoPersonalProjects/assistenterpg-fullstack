// components/landing/FeaturesSection.tsx - CORRIGIDO

import { Icon, type IconName } from '@/components/ui/Icon';

const features: Array<{ icon: IconName; title: string; description: string }> = [
  {
    icon: 'user',
    title: 'Criação de Personagens',
    description:
      'Sistema completo com atributos, perícias, classes, origens, clãs e técnicas inatas.',
  },
  {
    icon: 'briefcase',
    title: 'Inventário Inteligente',
    description:
      'Gerenciamento automático de espaços, categorias de Grau Xamã e modificações de equipamentos.',
  },
  {
    icon: 'sparkles',
    title: 'Técnicas Inatas',
    description:
      'Catálogo completo com Infinito, Dez Sombras, Manipulação de Sangue e muito mais.',
  },
  {
    icon: 'shield',
    title: 'Equipamentos Amaldiçoados',
    description:
      'Armas, proteções e artefatos com modificações e cálculos automáticos de stats.',
  },
  {
    icon: 'characters',
    title: 'Campanhas Multiplayer',
    description: 'Crie campanhas, convide amigos e gerencie personagens do grupo.',
  },
  {
    icon: 'eye',
    title: 'Preview em Tempo Real',
    description:
      'Veja todos os cálculos de atributos derivados, perícias e espaços instantaneamente.',
  },
];

export function FeaturesSection() {
  return (
    <section className="py-24 px-4 relative">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-app-fg mb-4">
            Tudo que você precisa para jogar
          </h2>
          <p className="text-xl text-app-muted max-w-2xl mx-auto">
            Ferramentas completas para mestres e jogadores do sistema Jujutsu Kaisen RPG.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <FeatureCard key={idx} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: IconName;
  title: string;
  description: string;
}) {
  return (
    <div className="group p-6 rounded-2xl bg-app-card border border-app-border hover:border-app-secondary hover:shadow-lg transition-all duration-300">
      <div className="w-12 h-12 rounded-xl bg-gradient-cta flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        <Icon name={icon} className="w-6 h-6 text-white" />
      </div>
      <h3 className="text-xl font-semibold text-app-fg mb-2">{title}</h3>
      <p className="text-app-muted leading-relaxed">{description}</p>
    </div>
  );
}
