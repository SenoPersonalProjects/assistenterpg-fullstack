import { RouteLoadingSkeleton } from '@/components/ui/RouteLoadingSkeleton';

export default function HomebrewsLoading() {
  return <RouteLoadingSkeleton message="Carregando homebrews..." variant="grid" cards={6} />;
}
