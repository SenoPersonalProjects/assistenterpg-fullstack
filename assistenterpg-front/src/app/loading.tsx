import { RouteLoadingSkeleton } from '@/components/ui/RouteLoadingSkeleton';

export default function GlobalLoading() {
  return <RouteLoadingSkeleton message="Carregando página..." variant="grid" cards={6} />;
}
