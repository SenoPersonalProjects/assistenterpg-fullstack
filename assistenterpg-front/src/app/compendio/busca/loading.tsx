import { RouteLoadingSkeleton } from '@/components/ui/RouteLoadingSkeleton';

export default function BuscaCompendioLoading() {
  return <RouteLoadingSkeleton message="Buscando no compendio..." variant="grid" cards={8} />;
}
