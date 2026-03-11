import { RouteLoadingSkeleton } from '@/components/ui/RouteLoadingSkeleton';

export default function PersonagensBaseLoading() {
  return <RouteLoadingSkeleton message="Carregando personagens..." variant="grid" cards={6} />;
}
