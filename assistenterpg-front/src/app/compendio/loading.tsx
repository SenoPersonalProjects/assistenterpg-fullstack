import { RouteLoadingSkeleton } from '@/components/ui/RouteLoadingSkeleton';

export default function CompendioLoading() {
  return <RouteLoadingSkeleton message="Carregando compêndio..." variant="grid" cards={8} />;
}
