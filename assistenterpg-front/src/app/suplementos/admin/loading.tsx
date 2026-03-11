import { RouteLoadingSkeleton } from '@/components/ui/RouteLoadingSkeleton';

export default function SuplementosAdminLoading() {
  return <RouteLoadingSkeleton message="Carregando painel de suplementos..." variant="grid" cards={6} />;
}
