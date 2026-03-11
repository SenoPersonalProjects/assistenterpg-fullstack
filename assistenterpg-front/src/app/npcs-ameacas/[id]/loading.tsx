import { RouteLoadingSkeleton } from '@/components/ui/RouteLoadingSkeleton';

export default function NpcDetalheLoading() {
  return <RouteLoadingSkeleton message="Carregando ficha..." variant="detail" />;
}
