// app/personagens-base/page.tsx
// ✅ UX PADRONIZADA - Igual home + campanhas

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useConfirm } from '@/hooks/useConfirm';
import {
  apiGetMeusPersonagensBase,
  apiGetClasses,
  apiGetClas,
  apiGetOrigens,
  apiGetProficiencias,
  apiGetTiposGrau,
  apiGetTecnicasInatas,
  apiDeletePersonagemBase,
  PersonagemBaseResumo,
} from '@/lib/api';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { EmptyState } from '@/components/ui/EmptyState';
import { Icon } from '@/components/ui/Icon';
import { PersonagemBaseListItem } from '@/components/personagem-base/create/PersonagemBaseListItem';

export default function PersonagensBasePage() {
  const router = useRouter();
  const { usuario, loading: authLoading } = useAuth();
  const { isOpen, options, confirm, handleClose, handleConfirm } = useConfirm();

  const [personagens, setPersonagens] = useState<PersonagemBaseResumo[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [clas, setClas] = useState<any[]>([]);
  const [origens, setOrigens] = useState<any[]>([]);
  const [proficiencias, setProficiencias] = useState<any[]>([]);
  const [tiposGrau, setTiposGrau] = useState<any[]>([]);
  const [tecnicasInatas, setTecnicasInatas] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [personagemParaExcluir, setPersonagemParaExcluir] = useState<PersonagemBaseResumo | null>(null);

  useEffect(() => {
    if (!authLoading && !usuario) {
      router.push('/auth/login');
      return;
    }

    if (!authLoading && usuario) {

      carregarDados();
    }
  }, [authLoading, usuario, router]);

  async function carregarDados() {
    try {
      setErro(null);
      setLoading(true);

      const [
        personagensRes,
        classesRes,
        clasRes,
        origensRes,
        profsRes,
        tiposGrauRes,
        tecnicasInatasRes,
      ] = await Promise.all([
        apiGetMeusPersonagensBase(),
        apiGetClasses(),
        apiGetClas(),
        apiGetOrigens(),
        apiGetProficiencias(),
        apiGetTiposGrau(),
        apiGetTecnicasInatas(),
      ]);

      setPersonagens(personagensRes);
      setClasses(classesRes);
      setClas(clasRes);
      setOrigens(origensRes);
      setProficiencias(profsRes);
      setTiposGrau(tiposGrauRes);
      setTecnicasInatas(tecnicasInatasRes);
    } catch (e) {
      console.error(e);
      setErro('Erro ao carregar dados de personagem-base');
    } finally {
      setLoading(false);
    }
  }

  function handleDeleteClick(personagem: PersonagemBaseResumo) {
    setPersonagemParaExcluir(personagem);
    
    confirm({
      title: `Excluir "${personagem.nome}"?`,
      description: 'Esta ação é irreversível!',
      confirmLabel: 'Sim, excluir',
      cancelLabel: 'Cancelar',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await apiDeletePersonagemBase(personagem.id);
          setPersonagens(prev => prev.filter(p => p.id !== personagem.id));
          setErro(null);
        } catch (error) {
          setErro('Erro ao excluir personagem. Tente novamente.');
          console.error('Erro ao excluir:', error);
        } finally {
          setPersonagemParaExcluir(null);
        }
      },
    });
  }

  if (authLoading || loading) {
    return (
      <Loading
        message="Carregando personagens..."
        className="p-6 text-app-fg"
      />
    );
  }

  if (!usuario) return null;

  return (
    <>
      <main className="min-h-screen bg-app-bg p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header - Padrão home/campanhas */}
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-app-primary/10">
                <Icon name="characters" className="w-6 h-6 text-app-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-app-fg">
                  Meus personagens-base
                </h1>
                <p className="text-sm text-app-muted mt-0.5">
                  ({personagens.length}) Crie fichas reutilizáveis para suas campanhas
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => router.push('/')}
              >
                <Icon name="back" className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <Button 
                variant="primary"
                onClick={() => router.push('/personagens-base/novo')}
              >
                <Icon name="add" className="w-4 h-4 mr-2" />
                Novo personagem
              </Button>
            </div>
          </header>

          {/* Erro */}
          {erro && <ErrorAlert message={erro} />}

          {/* Lista */}
          <section>
            <SectionTitle>
              Personagens-base ({personagens.length})
            </SectionTitle>
            
            {personagens.length === 0 ? (
              <EmptyState 
                variant="card"
                icon="characters"
                title="Nenhum personagem criado"
                description="Crie seu primeiro personagem-base para usar em campanhas!"
              >
                <Button 
                  variant="primary"
                  size="sm"
                  onClick={() => router.push('/personagens-base/novo')}
                  className="mt-4"
                >
                  <Icon name="add" className="w-4 h-4 mr-2" />
                  Criar primeiro personagem
                </Button>
              </EmptyState>
            ) : (
              <div className="grid gap-4 mt-4 sm:grid-cols-2 lg:grid-cols-3">
                {personagens.map((p) => (
                  <PersonagemBaseListItem
                    key={p.id}
                    personagem={p}
                    onClick={() => router.push(`/personagens-base/${p.id}`)}
                    onDelete={() => handleDeleteClick(p)}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Card de ajuda - só quando vazio */}
          {personagens.length === 0 && (
            <section>
              <div className="rounded-lg border border-app-border bg-app-surface p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-app-primary/10">
                    <Icon name="info" className="h-6 w-6 text-app-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-app-fg mb-2">
                      O que são personagens-base?
                    </h3>
                    <p className="text-sm text-app-muted leading-relaxed mb-4">
                      São fichas reutilizáveis que você cria uma vez e usa em várias campanhas.
                    </p>
                    <ul className="space-y-2.5 text-sm text-app-muted">
                      <li className="flex items-start gap-2.5">
                        <Icon name="check" className="w-5 h-5 text-app-success flex-shrink-0 mt-0.5" />
                        <span>Defina atributos, classe, clã e técnica inata</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <Icon name="check" className="w-5 h-5 text-app-success flex-shrink-0 mt-0.5" />
                        <span>Escolha perícias e distribua pontos de aprimoramento</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <Icon name="check" className="w-5 h-5 text-app-success flex-shrink-0 mt-0.5" />
                        <span>Reutilize em qualquer campanha sem recriar</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Confirm Dialog - Padrão campanhas */}
      <ConfirmDialog
        isOpen={isOpen}
        onClose={handleClose}
        onConfirm={handleConfirm}
        title={options?.title ?? ''}
        description={options?.description ?? ''}
        confirmLabel={options?.confirmLabel}
        cancelLabel={options?.cancelLabel}
        variant={options?.variant}
      >
        <div className="rounded border border-app-danger/40 bg-app-danger/5 p-3">
          <p className="text-xs font-semibold text-app-danger mb-2 flex items-center gap-1.5">
            <Icon name="warning" className="w-4 h-4" />
            ATENÇÃO: Esta ação é IRREVERSÍVEL!
          </p>
          <ul className="space-y-1 text-xs text-app-danger/90">
            <li>• Personagem-base excluído permanentemente</li>
            <li>• Todas as instâncias em campanhas removidas</li>
            <li>• Histórico e progresso perdidos</li>
          </ul>
        </div>
      </ConfirmDialog>
    </>
  );
}
