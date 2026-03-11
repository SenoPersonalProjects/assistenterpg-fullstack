import { RouteLoadingSkeleton } from '@/components/ui/RouteLoadingSkeleton';

export default function HomeLoading() {
  return <RouteLoadingSkeleton message="Carregando inicio..." variant="detail" />;
}
