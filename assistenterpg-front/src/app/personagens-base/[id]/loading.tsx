import { RouteLoadingSkeleton } from '@/components/ui/RouteLoadingSkeleton';

export default function PersonagemBaseDetalheLoading() {
  return <RouteLoadingSkeleton message="Carregando ficha..." variant="detail" />;
}
