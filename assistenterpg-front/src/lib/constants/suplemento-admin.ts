import type { AdminModuloSuplemento } from '@/lib/types';
import type { IconName } from '@/components/ui/Icon';

export type SuplementoAdminModuleConfig = {
  id: AdminModuloSuplemento;
  slug: string;
  label: string;
  description: string;
  icon: IconName;
  route: string;
};

export const SUPLEMENTO_ADMIN_MODULES: SuplementoAdminModuleConfig[] = [
  {
    id: 'classes',
    slug: 'classes',
    label: 'Classes',
    description: 'CRUD de classes vinculadas a sistema base, suplemento ou homebrew.',
    icon: 'class',
    route: '/suplementos/admin/classes',
  },
  {
    id: 'clas',
    slug: 'clas',
    label: 'Clãs',
    description: 'CRUD de clãs com suporte a técnicas hereditárias e fonte.',
    icon: 'clan',
    route: '/suplementos/admin/clas',
  },
  {
    id: 'trilhas',
    slug: 'trilhas',
    label: 'Trilhas',
    description: 'CRUD de trilhas com associação a classe e suplemento.',
    icon: 'training',
    route: '/suplementos/admin/trilhas',
  },
  {
    id: 'caminhos',
    slug: 'caminhos',
    label: 'Caminhos',
    description: 'CRUD de caminhos associados a trilhas.',
    icon: 'map',
    route: '/suplementos/admin/caminhos',
  },
  {
    id: 'origens',
    slug: 'origens',
    label: 'Origens',
    description: 'CRUD de origens, perícias e habilidades iniciais.',
    icon: 'story',
    route: '/suplementos/admin/origens',
  },
  {
    id: 'proficiencias',
    slug: 'proficiencias',
    label: 'Proficiências',
    description: 'CRUD de proficiências usadas por classes e personagens.',
    icon: 'skills',
    route: '/suplementos/admin/proficiencias',
  },
  {
    id: 'tipos-grau',
    slug: 'tipos-grau',
    label: 'Tipos de Grau',
    description: 'CRUD de tipos de grau para escalonamento e progressão.',
    icon: 'rank',
    route: '/suplementos/admin/tipos-grau',
  },
  {
    id: 'condicoes',
    slug: 'condicoes',
    label: 'Condições',
    description: 'CRUD de condições aplicadas em sessões e personagens.',
    icon: 'status',
    route: '/suplementos/admin/condicoes',
  },
  {
    id: 'habilidades',
    slug: 'habilidades',
    label: 'Habilidades',
    description: 'CRUD de habilidades com filtros por fonte e suplemento.',
    icon: 'sparkles',
    route: '/suplementos/admin/habilidades',
  },
  {
    id: 'equipamentos',
    slug: 'equipamentos',
    label: 'Equipamentos',
    description: 'CRUD de equipamentos com filtros por fontes e suporte a suplemento.',
    icon: 'item',
    route: '/suplementos/admin/equipamentos',
  },
  {
    id: 'tecnicas-amaldicoadas',
    slug: 'tecnicas',
    label: 'Técnicas Amaldiçoadas',
    description: 'CRUD de técnicas com suporte a fonte/suplemento no nível da técnica.',
    icon: 'technique',
    route: '/suplementos/admin/tecnicas',
  },
];
