import { RouteLoadingSkeleton } from '@/components/ui/RouteLoadingSkeleton';

export default function CampanhasLoading() {
  return <RouteLoadingSkeleton message="Carregando campanhas..." variant="grid" cards={6} />;
}
