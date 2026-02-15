// app/dev/components/page.tsx
'use client';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Checkbox } from '@/components/ui/Checkbox';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { Icon, ICON_NAMES } from '@/components/ui/Icon';
import { NotificationsButton } from '@/components/layout/NotificationsButton';
import { ThemeToggle } from '@/components/layout/ThemeToggle';

const selectOptions = [
  { value: 'combatente', label: 'Combatente' },
  { value: 'sentinela', label: 'Sentinela' },
  { value: 'especialista', label: 'Especialista' },
];

export default function ComponentsShowcasePage() {
  return (
    <main className="min-h-screen p-8 space-y-8 bg-app-bg">
      <header className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-app-fg">Catálogo de Componentes</h1>
          <p className="text-sm text-app-muted">Visualize os componentes nos temas claro e escuro.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-app-muted">Tema</span>
          <ThemeToggle />
        </div>
      </header>

      <SectionTitle>Botões</SectionTitle>
      <div className="flex gap-4 flex-wrap items-center">
        <Button variant="primary">Primário</Button>
        <Button variant="secondary">Secundário</Button>
        <Button variant="ghost">Ghost</Button>
        <Button disabled>Desabilitado</Button>
        <NotificationsButton pendingNotifications={3} />
      </div>

      <SectionTitle>Inputs</SectionTitle>
      <div className="grid gap-4 max-w-md">
        <Input label="Texto" placeholder="Digite algo..." />
        <Input label="Senha" type="password" placeholder="Senha" />
      </div>

      <SectionTitle>Checkbox</SectionTitle>
      <div className="flex gap-4">
        <Checkbox label="Opção padrão" />
        <Checkbox label="Marcado" defaultChecked />
      </div>

      <SectionTitle>Select</SectionTitle>
      <div className="max-w-xs">
        <Select label="Classe" options={selectOptions} defaultValue="combatente" />
      </div>

      <SectionTitle>Badges</SectionTitle>
      <div className="flex gap-2 flex-wrap items-center">
        <Badge>Neutro</Badge>
        <Badge color="green">Ativa</Badge>
        <Badge color="red">Erro</Badge>
        <Badge color="blue">Informação</Badge>
        <Badge color="yellow">Aviso</Badge>
        <Badge color="purple">Mestre</Badge>
      </div>

      <SectionTitle>Card</SectionTitle>
      <div className="max-w-md">
        <Card>
          <h3 className="font-semibold mb-2 text-app-fg">Card de exemplo</h3>
          <p className="text-sm text-app-muted">Conteúdo dentro de um card reutilizável.</p>
        </Card>
      </div>

      <SectionTitle>Ícones</SectionTitle>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {ICON_NAMES.map((name) => (
          <Card key={name} className="flex items-center gap-3">
            <Icon name={name} className="h-5 w-5 text-app-fg" />
            <div className="min-w-0">
              <div className="text-sm text-app-fg">{name}</div>
              <div className="text-[10px] text-app-muted">Icon name</div>
            </div>
          </Card>
        ))}
      </div>
    </main>
  );
}
