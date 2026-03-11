import { RouteLoadingSkeleton } from '@/components/ui/RouteLoadingSkeleton';

export default function NotificacoesLoading() {
  return <RouteLoadingSkeleton message="Carregando notificacoes..." variant="grid" cards={4} />;
}
