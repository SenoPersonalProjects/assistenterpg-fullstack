import type { IconName } from '@/components/ui/Icon';

export type AppShellNavItem = {
  href: string;
  label: string;
  icon: IconName;
  exact?: boolean;
  adminOnly?: boolean;
};

export type AppShellNavGroup = {
  id: string;
  label: string;
  adminOnly?: boolean;
  items: AppShellNavItem[];
};

export const APP_SHELL_NAV_GROUPS: AppShellNavGroup[] = [
  {
    id: 'mesa',
    label: 'Mesa',
    items: [
      { href: '/home', label: 'Início', icon: 'home', exact: true },
      { href: '/campanhas', label: 'Campanhas', icon: 'campaign' },
      { href: '/anotacoes', label: 'Anotações', icon: 'scroll' },
    ],
  },
  {
    id: 'fichas',
    label: 'Fichas',
    items: [
      { href: '/personagens-base', label: 'Personagens', icon: 'character-gojo' },
      { href: '/npcs-ameacas', label: 'NPCs e Ameaças', icon: 'curse' },
    ],
  },
  {
    id: 'conteudo',
    label: 'Conteúdo',
    items: [
      { href: '/homebrews', label: 'Homebrews', icon: 'sparkles' },
      { href: '/suplementos', label: 'Suplementos', icon: 'book' },
      { href: '/mundo', label: 'Mundo', icon: 'map' },
      { href: '/compendio', label: 'Compêndio', icon: 'rules' },
    ],
  },
  {
    id: 'social',
    label: 'Social/Sistema',
    items: [{ href: '/amigos', label: 'Amigos', icon: 'characters' }],
  },
  {
    id: 'administracao',
    label: 'Administração',
    adminOnly: true,
    items: [
      {
        href: '/suplementos/admin',
        label: 'Admin Conteúdo',
        icon: 'settings',
        adminOnly: true,
      },
    ],
  },
];

const ROUTE_TITLES: Array<{ href: string; title: string; exact?: boolean }> = [
  { href: '/home', title: 'Início', exact: true },
  { href: '/suplementos/admin', title: 'Admin Conteúdo' },
  { href: '/compendio/admin', title: 'Admin Compêndio' },
  { href: '/compendio/busca', title: 'Busca no Compêndio' },
  { href: '/campanhas', title: 'Campanhas' },
  { href: '/anotacoes', title: 'Anotações' },
  { href: '/personagens-base', title: 'Personagens' },
  { href: '/npcs-ameacas', title: 'NPCs e Ameaças' },
  { href: '/homebrews', title: 'Homebrews' },
  { href: '/suplementos', title: 'Suplementos' },
  { href: '/mundo', title: 'Mundo' },
  { href: '/compendio', title: 'Compêndio' },
  { href: '/amigos', title: 'Amigos' },
  { href: '/configuracoes', title: 'Configurações' },
  { href: '/notificacoes', title: 'Notificações' },
  { href: '/dev/components', title: 'Componentes' },
];

export function getAppShellNavGroups(isAdmin: boolean): AppShellNavGroup[] {
  return APP_SHELL_NAV_GROUPS.map((group) => {
    if (group.adminOnly && !isAdmin) return null;

    const items = group.items.filter((item) => !item.adminOnly || isAdmin);
    if (items.length === 0) return null;

    return { ...group, items };
  }).filter((group): group is AppShellNavGroup => Boolean(group));
}

export function isAppShellNavItemActive(
  pathname: string,
  item: Pick<AppShellNavItem, 'href' | 'exact'>,
): boolean {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function getActiveAppShellNavItem(
  pathname: string,
  groups: AppShellNavGroup[],
): AppShellNavItem | null {
  const items = groups.flatMap((group) => group.items);

  return (
    items
      .filter((item) => isAppShellNavItemActive(pathname, item))
      .sort((a, b) => b.href.length - a.href.length)[0] ?? null
  );
}

export function getAppShellRouteTitle(pathname: string): string {
  const route = [...ROUTE_TITLES]
    .sort((a, b) => b.href.length - a.href.length)
    .find((item) => isAppShellNavItemActive(pathname, item));

  return route?.title ?? 'Assistente RPG';
}
