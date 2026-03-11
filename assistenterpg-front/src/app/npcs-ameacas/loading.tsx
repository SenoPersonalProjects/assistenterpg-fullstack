import { RouteLoadingSkeleton } from '@/components/ui/RouteLoadingSkeleton';

export default function NpcsAmeacasLoading() {
  return <RouteLoadingSkeleton message="Carregando NPC..." variant="grid" cards={6} />;
}
