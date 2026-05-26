import { RouteLoadingSkeleton } from '@/components/ui/RouteLoadingSkeleton';

export default function BuscaCompendioLoading() {
  return <RouteLoadingSkeleton message="Buscando no compêndio..." variant="grid" cards={8} />;
}
