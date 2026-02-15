'use client';

import { Card } from '@/components/ui/Card';
import { SectionTitle } from '@/components/ui/SectionTitle';

export function CampaignSessionsPlaceholder() {
  return (
    <section>
      <SectionTitle>Próximas sessões</SectionTitle>
      <Card>
        <p className="text-sm text-app-muted">
          Em breve: listagem e criação de sessões desta campanha.
        </p>
      </Card>
    </section>
  );
}
