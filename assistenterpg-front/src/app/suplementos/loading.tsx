import { RouteLoadingSkeleton } from '@/components/ui/RouteLoadingSkeleton';

export default function SuplementosLoading() {
  return <RouteLoadingSkeleton message="Carregando suplementos..." variant="grid" cards={6} />;
}
