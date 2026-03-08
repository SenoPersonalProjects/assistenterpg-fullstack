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
    label: 'Clas',
    description: 'CRUD de cla com suporte a tecnicas hereditarias e fonte.',
    icon: 'clan',
    route: '/suplementos/admin/clas',
  },
  {
    id: 'trilhas',
    slug: 'trilhas',
    label: 'Trilhas',
    description: 'CRUD de trilhas com associacao a classe e suplemento.',
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
    description: 'CRUD de origens, pericias e habilidades iniciais.',
    icon: 'story',
    route: '/suplementos/admin/origens',
  },
  {
    id: 'proficiencias',
    slug: 'proficiencias',
    label: 'Proficiencias',
    description: 'CRUD de proficiencias usadas por classes e personagens.',
    icon: 'skills',
    route: '/suplementos/admin/proficiencias',
  },
  {
    id: 'tipos-grau',
    slug: 'tipos-grau',
    label: 'Tipos de Grau',
    description: 'CRUD de tipos de grau para escalonamento e progressao.',
    icon: 'rank',
    route: '/suplementos/admin/tipos-grau',
  },
  {
    id: 'condicoes',
    slug: 'condicoes',
    label: 'Condicoes',
    description: 'CRUD de condicoes aplicadas em sessoes e personagens.',
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
    label: 'Tecnicas Amaldicoadas',
    description: 'CRUD de tecnicas com suporte a fonte/suplemento no nivel da tecnica.',
    icon: 'technique',
    route: '/suplementos/admin/tecnicas',
  },
];
