import { RouteLoadingSkeleton } from '@/components/ui/RouteLoadingSkeleton';

export default function NovoPersonagemBaseLoading() {
  return <RouteLoadingSkeleton message="Preparando criação de personagem..." variant="form" />;
}
